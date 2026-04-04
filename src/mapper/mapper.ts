import { BOOLEAN_STRING, HTTP } from '../common/enum.js';

export class Mapper {
	public static parseStatusCodeForHeader(status: string, statusCodeDefault: HTTP = HTTP.STATUS_CODE_200): HTTP {
		const statusNumber: number = Number(status);
		if (Object.values(HTTP).includes(statusNumber as HTTP)) return statusNumber as HTTP;
		return statusCodeDefault;
	}

	public static parseStatusCodeForAxios(status: number): HTTP {
		if (Object.values(HTTP).includes(status as HTTP)) return status as HTTP;
		return HTTP.STATUS_CODE_500;
	}
	public static parseToBoolean = (value: string | boolean) => value === BOOLEAN_STRING.TRUE || value === true;
}
