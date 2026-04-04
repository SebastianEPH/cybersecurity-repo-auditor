import { EnvUtil } from './utils/env.util.js';
import { GithubProviderImpl } from './provider/impl/github.provider.impl.js';
new EnvUtil().load();

const result = await new GithubProviderImpl().listRepositories();
// console.log(JSON.stringify(result, null, 2))
console.log();

const prueba: [] = result.body as any;

prueba.forEach((repositorio: any) => {
	console.log(repositorio.full_name);
});
