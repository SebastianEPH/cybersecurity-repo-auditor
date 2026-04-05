import { GithubProvider } from '../github.provider.js';
import { ResponseProvider } from '../../models/response.provider.js';
import { HEADERS } from '../../common/enum.js';
import { ApiConnectorUtil } from '../../utils/api-conector.js';
import { GithubPaginationRepository, GithubRepos, PaginationGitHub } from '../../interfaces/github-repos.interface.js';

export class GithubProviderImpl implements GithubProvider {
	private readonly host: string = 'https://api.github.com';
	private githubConnector: ApiConnectorUtil;

	constructor() {
		this.githubConnector = new ApiConnectorUtil({
			host: this.host,
			timeout: 10000,
		});
	}

	public async listAllRepositories(): Promise<GithubRepos[]> {
		const limitItems: number = 100;
		let currentPage: number = 1;
		const { repositories, nextPage, lastPage } = await this.listRepositories(limitItems, currentPage);
		const result: GithubRepos[] = repositories;
		const promesas: Promise<GithubPaginationRepository>[] = [];
		for (let i: number = nextPage; i <= lastPage; i++) {
			promesas.push(this.listRepositories(limitItems, i));
		}
		const listPagination: GithubPaginationRepository[] = await Promise.all(promesas);
		listPagination.forEach((pagination: GithubPaginationRepository): void => {
			result.push(...pagination.repositories);
		});

		return result;
	}

	public async listRepositories(limitItems: number, page: number): Promise<GithubPaginationRepository> {
		const path = `/orgs/${process.env.GITHUB_NAME_ORGANIZATION}/repos`;
		const headers = {
			[HEADERS.AUTHORIZATION]: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
		};
		const params = { per_page: limitItems, page };
		const {
			statusCode,
			body,
			headers: headersResponse,
		} = <ResponseProvider<GithubRepos[], { link: string }>>await this.githubConnector.get(path, headers, params);
		if (!body) {
			throw new Error(`No body for github repo found for ${path}`);
		}
		const { nextPage, lastPage } = this.getPageRange(headersResponse?.link);
		return {
			repositories: body,
			nextPage,
			lastPage,
		};
	}

	private getPageRange(linkHeader: string): PaginationGitHub {
		const nextMatch = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="next"/);
		const lastMatch = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);
		return {
			nextPage: nextMatch ? parseInt(nextMatch[1], 10) : 0,
			lastPage: lastMatch ? parseInt(lastMatch[1], 10) : 0,
		};
	}
}
