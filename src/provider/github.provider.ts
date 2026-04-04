import { ResponseProvider } from '../models/response.provider.js';

export interface GithubProvider {
	listRepositories(): Promise<object>;
}
