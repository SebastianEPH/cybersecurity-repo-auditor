import { EnvUtil } from './utils/env.util.js';
import { GithubProviderImpl } from './provider/impl/github.provider.impl.js';
import { GithubRepos } from './interfaces/github-repos.interface.js';
new EnvUtil().load();

const result: GithubRepos[] = await new GithubProviderImpl().listAllRepositories();

result.forEach((repository: GithubRepos) => {
	console.log(repository.full_name);
});
console.log(`total de repositorios: '${result.length}'`);
