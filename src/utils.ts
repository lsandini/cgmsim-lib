import * as moment from "moment";
import pino from 'pino';

const logger = pino({
	level: process.env.LOG_LEVEL,
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true
		}
	}
});

export default logger;

export function Activity(peak: number, duration: number, hoursAgo: number, insulin: number) {
	const tau = peak * (1 - peak / duration) / (1 - 2 * peak / duration);
	const a = 2 * tau / duration;
	const S = 1 / (1 - a + (1 + a) * Math.exp(-duration / tau));
	const activity = (insulin * (S / Math.pow(tau, 2)) * hoursAgo * (1 - hoursAgo / duration) * Math.exp(-hoursAgo / tau)) / 60

	return { S, tau, activity };
}
export const getDeltaMinutes = (mills) => Math.round(moment().diff(moment(mills), 'seconds') / 60);
