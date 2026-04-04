import { HTTP } from '../common/enum.js';

export class ResponseProvider<T> {
	public statusCode: HTTP | undefined;

	public body: T | undefined;

	public headers?: object;

	public config?: object;

	public request?: object;
}
