import { GithubProvider } from '../github.provider.js';
import { ResponseProvider } from '../../models/response.provider.js';
import { HEADERS } from '../../common/enum.js';
import { ApiConnectorUtil } from '../../utils/api-conector.js';

export class GithubProviderImpl implements GithubProvider {
	private readonly host: string = 'https://api.github.com';
	private githubConnector: ApiConnectorUtil;

	constructor() {
		this.githubConnector = new ApiConnectorUtil({
			host: this.host,
			timeout: 10000,
		});
	}

	public async listRepositories(): Promise<ResponseProvider<object>> {
		const path = `https://api.github.com/orgs/${process.env.GITHUB_NAME_ORGANIZATION}/repos`;
		const headers = {
			[HEADERS.AUTHORIZATION]: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
		};
		const params = {
			per_page: 100,
		};
		return await this.githubConnector.get(path, headers);
	}
}
