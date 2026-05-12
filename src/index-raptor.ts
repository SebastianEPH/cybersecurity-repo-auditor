import { EnvUtil } from './utils/env.util.js';
import { GithubProviderImpl } from './provider/impl/github.provider.impl.js';
import { GithubRepositoryInformation } from './interfaces/github-repos.interface.js';
import { GitHubService } from './services/github.service.js';

import { GitleaksService } from './services/gitleaks.services.js';
import {Mapper} from "./mapper/mapper.js";

new EnvUtil().load();

const result: GithubRepositoryInformation[] = await new GithubProviderImpl().listAllRepositories();

// const result: GithubRepos[] = [results[0], results[1], results[2]];
const githubService: GitHubService = new GitHubService(false);
const listPathsRepository: string[] = [];

console.log(githubService);



const procesarConRaptor = async (repositoryInfo: GithubRepositoryInformation) => {
	/* Agrega validaciones para omitir repositoriso que no queremos analizar o procesar */
	if(!Mapper.isValidCodeRepository(repositoryInfo.name)){
		console.log(`'${repositoryInfo.name}' fue omitido ya que no tiene código de proyecto`)
		return null
	}
	if(Mapper.isMaintenanceRepository(repositoryInfo.name)){
		console.log(`'${repositoryInfo.name}' fue omitido ya es un repo de mantenimiento`)
		return null
	}
	const codeRepository: string = Mapper.getCodeRepository(repositoryInfo.name);
	console.log(`=> '${repositoryInfo.name}'`)
	console.log(`Codigo de APP [${codeRepository}]`)
	const pathFinish:string  = await githubService.cloneRepositoryFromSSH(
		repositoryInfo.ssh_url,
		codeRepository,
		repositoryInfo.name
	);
	console.log(`=> Clonado '${pathFinish}'`)






};
//
// // // PROCESO DENTRO
// for (const repo of result) {
// // 	// listPathsRepository.push(await githubService.cloneRepositoryFromSSH(repo.ssh_url, repo.name));
// // 	console.log('=>', repo.name);
// 	await procesarConRaptor(repo)
// }
//


await procesarConRaptor(result[0])
