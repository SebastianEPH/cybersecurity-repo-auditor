import { GithubPaginationRepository, GithubRepos } from '../interfaces/github-repos.interface.js';

export interface GithubProvider {
	listAllRepositories(): Promise<GithubRepos[]>;
	listRepositories(limitItems: number, page: number): Promise<GithubPaginationRepository>;
}
