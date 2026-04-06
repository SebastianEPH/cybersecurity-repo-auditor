export class TimeUtil {
	public static generateUnixTimestamp(): number {
		return Math.floor(Date.now() / 1000);
	}
}
