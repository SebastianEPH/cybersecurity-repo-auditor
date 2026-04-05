import { HTTP } from '../common/enum.js';

export interface ResponseProvider<T, U> {
	statusCode: HTTP;
	body: T | undefined;
	headers: U;
	config: object;
	request: object;
}
