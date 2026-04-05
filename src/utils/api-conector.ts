import axios, { AxiosInstance } from 'axios';
import { TIMEOUT } from '../common/enum.js';
import https from 'https';
import { ResponseProvider } from '../models/response.provider.js';
import { READERS_RESPONSE } from '../common/constans.js';
import { Mapper } from '../mapper/mapper.js';

interface ApiConnectorConfig {
	host: string;
	timeout: TIMEOUT;
}

export class ApiConnectorUtil {
	private axiosInstance: AxiosInstance;

	constructor(private readonly config: ApiConnectorConfig) {
		const agent: https.Agent = new https.Agent({ rejectUnauthorized: false });
		this.axiosInstance = axios.create({
			baseURL: this.config.host,
			timeout: +this.config.timeout,
			headers: READERS_RESPONSE,
			httpsAgent: agent,
		});
	}

	public async get<T, U>(path: string, headers: object = {}, params: object = {}): Promise<ResponseProvider<T, U>> {
		try {
			const {
				data,
				status,
				headers: headerResponse,
				config,
				request,
			} = await this.axiosInstance.get(path, { headers, params });
			return {
				statusCode: Mapper.parseStatusCodeForAxios(status),
				body: data,
				config,
				headers: <U>headerResponse,
				request,
			};
		} catch (error) {
			console.log('ApiConnectorUtil | GET | Error in call provider', JSON.stringify(error));
			return this.parseError(error);
		}
	}

	public async getFile<T, U>(path: string, headers: object = {}): Promise<ResponseProvider<T, U>> {
		try {
			const {
				data,
				status,
				headers: headerResponse,
				config,
				request,
			} = await this.axiosInstance.get(path, {
				headers,
				responseType: 'arraybuffer',
			});
			return {
				statusCode: Mapper.parseStatusCodeForAxios(status),
				body: data,
				config,
				headers: <U>headerResponse,
				request,
			};
		} catch (error) {
			console.log('ApiConnectorUtil | GET FILE | Error in call provider', JSON.stringify(error));
			return this.parseError(error);
		}
	}

	public async post<T, U>(path: string, payload: object, headers: object = {}): Promise<ResponseProvider<T, U>> {
		try {
			const {
				data,
				status,
				headers: headerResponse,
				config,
				request,
			} = await this.axiosInstance.post(path, payload, { headers });
			return {
				statusCode: Mapper.parseStatusCodeForAxios(status),
				body: data,
				config,
				headers: <U>headerResponse,
				request,
			};
		} catch (error) {
			return this.parseError(error);
		}
	}

	public get host(): string {
		return this.config.host;
	}

	public get timeOut(): number {
		return this.config.timeout;
	}
	private parseError<T, U>(error: unknown): ResponseProvider<T, U> {
		const e = error as any;
		return {
			statusCode: Mapper.parseStatusCodeForAxios(e.response?.status),
			body: e.response?.data,
			headers: e.response?.headers,
			config: e.response?.config,
			request: e.response?.request,
		};
	}
}
