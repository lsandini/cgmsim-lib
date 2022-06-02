import fetch from 'node-fetch';
import * as moment from "moment";
import pino from 'pino';
import setupParams from "./setupParams";
import { Activity, Note, Sgv } from "./Types";

const logger = pino({
	level: process.env.LOG_LEVEL ?? 'error',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true
		}
	}
});

export default logger;

export function getInsulinActivity(peakMin: number, durationMin: number, timeMin: number, insulin: number) {
	const tau = peakMin * (1 - peakMin / durationMin) / (1 - 2 * peakMin / durationMin);
	const a = 2 * tau / durationMin;
	const S = 1 / (1 - a + (1 + a) * Math.exp(-durationMin / tau));
	const activity = (insulin * (S / Math.pow(tau, 2)) * timeMin * (1 - timeMin / durationMin) * Math.exp(-timeMin / tau))

	return activity;
}
export const getDeltaMinutes = (mills: number | string) => Math.round(moment().diff(moment(mills), 'seconds') / 60);
export function uploadBase(cgmsim: Sgv | Activity | Note, nsUrlApi: string, apiSecret: string) {
	const isHttps = nsUrlApi.match(/^https/)?.length > 0;
	const { postParams } = setupParams(apiSecret,isHttps);
	const body_json = JSON.stringify(cgmsim);

	return fetch(nsUrlApi, {
		...postParams,
		body: body_json,
	})
		.then(() => {
			logger.debug('NIGTHSCOUT Updated');
		})
		.catch(err => {
			logger.debug(err);
		});
}
