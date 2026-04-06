import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { TimeUtil } from '../utils/time.util.js';

export class GitHubService {
	private readonly baseDir: string;
	constructor() {
		this.baseDir = path.join(
			process.env.PATH_CLONE_REPOSITORIES!,
			TimeUtil.generateUnixTimestamp().toString(),
			process.env.GITHUB_NAME_ORGANIZATION!,
		);
		if (!fs.existsSync(this.baseDir)) {
			fs.mkdirSync(this.baseDir, { recursive: true });
		}
	}
	public async cloneRepositoryFromSSH(sshUrl: string, name: string): Promise<string> {
		console.log(`[CLONE] git clone ${sshUrl}`);
		const targetPath: string = path.join(this.baseDir, name);
		const execAsync = promisify(exec);
		await execAsync(`git clone ${sshUrl} ${targetPath}`);
		return targetPath;
	}
}
