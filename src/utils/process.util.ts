import { spawn } from 'child_process';

export class ProcessUtil {
	public static run(command: string, args: string[]): Promise<number> {
		return new Promise((resolve, reject) => {
			const proc = spawn(command, args, {
				stdio: 'ignore',
				shell: false,
			});

			proc.on('close', (code) => {
				if (code === null) {
					reject(new Error('Process terminated unexpectedly'));
				} else {
					resolve(code);
				}
			});

			proc.on('error', reject);
		});
	}
}
