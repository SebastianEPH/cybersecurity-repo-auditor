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

	public static isValidCodeRepository(text: string): boolean {
		const regex = /^A\d{3}-.*$/;
		return regex.test(text);
	}
	public static isMaintenanceRepository(text: string): boolean {
		const regex = /-IaC-infraestructura|-pipeline-devops|-test-automation|_cloudformation|-cloudformation/i;
		return regex.test(text);
	}
	public static getCodeRepository(texto: string): string {
		const regex = /^(A\d{3})-/;
		const match = texto.match(regex);
		return match ? match[1] : "";
	}

}
