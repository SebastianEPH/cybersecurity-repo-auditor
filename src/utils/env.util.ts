import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export class EnvUtil {
	public envPath: string | undefined;
	public envName: string | undefined;

	constructor() {
		this.getNameFromArgument();
		this.getEnvPath();
		this.load();
	}

	public load() {
		dotenv.config({ path: this.envPath });
	}

	private getNameFromArgument(): void {
		this.envName = process.argv[2];
		console.log(`[ENV] Argumento '${this.envName}'`);
		if (!this.envName) {
			console.error('Debes indicar el entorno: npm run dev -- <env>');
			process.exit(1);
		}
	}
	private getEnvPath(): void {
		this.envPath = path.resolve(`config/.env.${this.envName}`);
		console.log(`[ENV] Path .env '${this.envPath}'`);
		if (!fs.existsSync(this.envPath)) {
			console.error(`No existe el archivo: ${this.envPath}`);
			process.exit(1);
		}
	}
}
