import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
export interface ScanSummary {
	totalRepos: number;
	successful: number;
	failed: number;
	reposWithLeaks: number;
	reposClean: number;
	totalDurationMs: number;
	results: RepoResult[];
}
export interface GitleaksServiceOptions {
	/** Cuántos repos se procesan en paralelo (default: 10) */
	concurrency?: number;
	/** Timeout por repo en ms (default: 5 minutos) */
	timeoutMs?: number;
}

export interface RepoResult {
	repoPath: string;
	repoName: string;
	reportFile: string | null;
	success: boolean;
	leaksFound: boolean;
	error?: string;
	durationMs: number;
}

const execAsync = promisify(exec);

/**
 * Extrae un nombre de repositorio "limpio" desde la ruta.
 * Se toma el último segmento no vacío, se sanitiza para nombre de archivo.
 */
function repoNameFromPath(repoPath: string): string {
	const segments = repoPath.replace(/\\/g, '/').split('/').filter(Boolean);
	const last = segments.at(-1) ?? 'unknown_repo';
	// Quita caracteres no seguros para nombre de archivo
	return last.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export class GitleaksService {
	private readonly outputDir: string;
	private readonly concurrency: number;
	private readonly dockerImage: string = 'zricethezav/gitleaks:latest';
	private readonly timeoutMs: number;

	constructor(options: GitleaksServiceOptions) {
		this.outputDir = process.env.PATH_REPORTS!;
		this.concurrency = options.concurrency ?? 10;

		this.timeoutMs = options.timeoutMs ?? 5 * 60 * 1_000; // 5 min
	}

	// ── Public API ──────────────────────────────────────────────────────────────

	/**
	 * Escanea todos los repositorios de la lista con concurrencia controlada.
	 * Devuelve un resumen con el resultado de cada repo.
	 */
	async scanAll(repoPaths: string[]): Promise<ScanSummary> {
		await fs.mkdir(this.outputDir, { recursive: true });

		const startTime: number = Date.now();
		const results: RepoResult[] = [];
		const total: number = repoPaths.length;
		let processed: number = 0;

		console.log(`\n🔍 Iniciando escaneo de ${total} repositorios ` + `(concurrencia: ${this.concurrency})\n`);

		// Procesa en lotes del tamaño de `concurrency`
		for (let i = 0; i < total; i += this.concurrency) {
			const batch = repoPaths.slice(i, i + this.concurrency);

			const batchResults = await Promise.all(batch.map((repoPath) => this.scanOne(repoPath)));

			results.push(...batchResults);
			processed += batch.length;

			const pct = ((processed / total) * 100).toFixed(1);
			console.log(`  ✔ Lote completado — ${processed}/${total} (${pct}%)`);
		}

		const summary = this.buildSummary(results, Date.now() - startTime);
		await this.writeSummary(summary);

		this.printSummary(summary);
		return summary;
	}

	// ── Private: scan single repo ───────────────────────────────────────────────

	private async scanOne(repoPath: string): Promise<RepoResult> {
		const repoName = repoNameFromPath(repoPath);
		const reportFile = path.join(this.outputDir, `${repoName}.json`);
		const start = Date.now();

		try {
			const cmd = [
				'docker run --rm',
				`-v "${repoPath}:/repo"`,
				`-v "${this.outputDir}:/reports"`,
				this.dockerImage,
				'detect',
				'--source=/repo',
				'--report-format=json',
				`--report-path=/reports/${repoName}.json`,
				'--exit-code=0',
			].join(' ');

			console.log(`cmd=>>'${cmd}'`);
			await execAsync(cmd, { timeout: this.timeoutMs });

			// Si gitleaks no encontró nada, NO crea el archivo → lo creamos vacío
			const fileExists = await fs.access(reportFile).then(() => true).catch(() => false);
			if (!fileExists) {
				await fs.writeFile(reportFile, '[]', 'utf-8');
			}

			const leaksFound = await this.hasLeaks(reportFile);

			console.log(
				`  ${leaksFound ? '⚠️ ' : '✅'} ${repoName} ` +
				`(${Date.now() - start}ms)${leaksFound ? ' — LEAKS FOUND' : ''}`,
			);

			return {
				repoPath,
				repoName,
				reportFile,   // ← siempre tiene valor, nunca null en éxito
				success: true,
				leaksFound,
				durationMs: Date.now() - start,
			};
		} catch (err: unknown) {
			const error = err instanceof Error ? err.message : String(err);
			console.error(`  ❌ ${repoName} — ERROR: ${error.slice(0, 120)}`);

			return {
				repoPath,
				repoName,
				reportFile: null,
				success: false,
				leaksFound: false,
				error,
				durationMs: Date.now() - start,
			};
		}
	}
	// ── Private: helpers ────────────────────────────────────────────────────────

	private async hasLeaks(reportFile: string): Promise<boolean> {
		try {
			const raw = await fs.readFile(reportFile, 'utf-8');
			const data = JSON.parse(raw);
			return Array.isArray(data) && data.length > 0;
		} catch {
			return false;
		}
	}

	private buildSummary(results: RepoResult[], totalDurationMs: number): ScanSummary {
		return {
			totalRepos: results.length,
			successful: results.filter((r) => r.success).length,
			failed: results.filter((r) => !r.success).length,
			reposWithLeaks: results.filter((r) => r.leaksFound).length,
			reposClean: results.filter((r) => r.success && !r.leaksFound).length,
			totalDurationMs,
			results,
		};
	}

	private async writeSummary(summary: ScanSummary): Promise<void> {
		const summaryPath = path.join(this.outputDir, '_summary.json');
		await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
		console.log(`\n📄 Resumen guardado en: ${summaryPath}`);
	}

	private printSummary(summary: ScanSummary): void {
		const mins = (summary.totalDurationMs / 60_000).toFixed(1);
		console.log(`
╔══════════════════════════════════════╗
║         GITLEAKS — RESUMEN           ║
╠══════════════════════════════════════╣
║  Total repos  : ${String(summary.totalRepos).padStart(6)}               ║
║  Exitosos     : ${String(summary.successful).padStart(6)}               ║
║  Fallidos     : ${String(summary.failed).padStart(6)}               ║
║  Con leaks    : ${String(summary.reposWithLeaks).padStart(6)}               ║
║  Limpios      : ${String(summary.reposClean).padStart(6)}               ║
║  Duración     : ${mins.padStart(5)} min             ║
╚══════════════════════════════════════╝
`);
	}
}
