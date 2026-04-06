import { EnvUtil } from './utils/env.util.js';
import { GithubProviderImpl } from './provider/impl/github.provider.impl.js';
import { GithubRepos } from './interfaces/github-repos.interface.js';
import { GitHubService } from './services/github.service.js';
new EnvUtil().load();

const results: GithubRepos[] = await new GithubProviderImpl().listAllRepositories();

const result = [results[0], results[1], results[2]];
const githubService: GitHubService = new GitHubService();
const listPathsRepository: string[] = [];
for (const repo of result) {
	listPathsRepository.push(await githubService.cloneRepositoryFromSSH(repo.ssh_url, repo.name));
}
console.log('La lista e repositorios es: ', listPathsRepository);
