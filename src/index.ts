import { EnvUtil } from './utils/env.util.js';
import { GithubProviderImpl } from './provider/impl/github.provider.impl.js';
import { GithubRepos } from './interfaces/github-repos.interface.js';
import { GitHubService } from './services/github.service.js';

import { GitleaksService } from './services/gitleaks.services.js';

new EnvUtil().load();

const result: GithubRepos[] = await new GithubProviderImpl().listAllRepositories();

// const result: GithubRepos[] = [results[0], results[1], results[2]];
const githubService: GitHubService = new GitHubService();
const listPathsRepository: string[] = [];
for (const repo of result) {
	listPathsRepository.push(await githubService.cloneRepositoryFromSSH(repo.ssh_url, repo.name));
}
console.log('La lista de repositorios es: ', listPathsRepository);

const serviceGitleaks = new GitleaksService({
	concurrency: 15 /* A la vez*/,
	// Timeout por repo: 3 minutos (repos grandes pueden tardar más)
	timeoutMs: 3 * 60 * 1_000,
});

async function main() {
	const summary = await serviceGitleaks.scanAll(listPathsRepository);

	// Filtra sólo los que tienen leaks para revisión manual
	const withLeaks = summary.results.filter((r) => r.leaksFound);
	if (withLeaks.length > 0) {
		console.log('\n🚨 Repositorios con secretos encontrados:');
		withLeaks.forEach((r) => console.log(`   • ${r.repoName} → ${r.reportFile}`));
	}

	// Filtra los que fallaron para reintento
	const failed = summary.results.filter((r) => !r.success);
	if (failed.length > 0) {
		console.log('\n⚠️  Repositorios que fallaron (para reintentar):');
		failed.forEach((r) => console.log(`   • ${r.repoName}: ${r.error?.slice(0, 80)}`));
	}
}

main().catch(console.error);

