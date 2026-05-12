import { GithubPaginationRepository, GithubRepositoryInformation } from '../interfaces/github-repos.interface.js';

export interface GithubProvider {
	listAllRepositories(): Promise<GithubRepositoryInformation[]>;
	listRepositories(limitItems: number, page: number): Promise<GithubPaginationRepository>;
}
