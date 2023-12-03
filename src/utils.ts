import fetch from 'node-fetch';
import * as moment from 'moment';
import pino, { LevelWithSilent, TransportTargetOptions } from 'pino';
import setupParams from './setupParams';
import { Activity, Entry, Note, SimulationResult } from './Types';
import { load } from 'ts-dotenv';
import pinoPretty from 'pino-pretty';

const env = load({
	LOGTAIL_SECRET: { type: String, optional: true },
	LOG_LEVEL: { type: String, optional: true },
	NODE_ENV: { type: String, optional: true },
});

const token: string = env.LOGTAIL_SECRET;
const level: LevelWithSilent | string = env.LOG_LEVEL ?? 'error';

const targets: TransportTargetOptions[] = [];

if (token) {
	targets.push({
		target: '@logtail/pino',
		options: { sourceToken: token },

		level,
	});
}

const logger = pino({
	level,
	prettifier: process.env.NODE_ENV === 'development' ? pinoPretty : null,
	transport: {
		targets,
	},
});

export default logger;
export function isHttps(str) {
	return str.match(/^https/)?.length > 0;
}
export function removeTrailingSlash(str) {
	return str.endsWith('/') ? str.slice(0, -1) : str;
}

export function getTreatmentActivity(
	peakMin: number,
	durationMin: number,
	timeMin: number,
	units: number
) {
	const tau =
		(peakMin * (1 - peakMin / durationMin)) / (1 - (2 * peakMin) / durationMin);
	const a = (2 * tau) / durationMin;
	const S = 1 / (1 - a + (1 + a) * Math.exp(-durationMin / tau));
	const activity =
		units *
		(S / Math.pow(tau, 2)) *
		timeMin *
		(1 - timeMin / durationMin) *
		Math.exp(-timeMin / tau);
	if (activity <= 0) {
		return 0;
	}
	if (timeMin < 15) {
		return activity * (timeMin / 15);
	}
	return activity;
}
export function getInsulinOnBoard(
	peakMin: number,
	durationMin: number,
	timeMin: number,
	insulin: number
) {
	const tau =
		(peakMin * (1 - peakMin / durationMin)) / (1 - (2 * peakMin) / durationMin);
	const a = (2 * tau) / durationMin;
	const S = 1 / (1 - a + (1 + a) * Math.exp(-durationMin / tau));
	const iob =
		1 -
		S *
			(1 - a) *
			((Math.pow(timeMin, 2) / (tau * durationMin * (1 - a)) -
				timeMin / tau -
				1) *
				Math.exp(-timeMin / tau) +
				1);
	return iob > 0 ? iob : 0;
}
//IOB curve: IOB(t) = 1-S*(1-a)*((t^2/(tau*td*(1-a)) - t/tau - 1)*exp(-t/tau)+1);
export const getDeltaMinutes = (mills: number | string) =>
	Math.round(moment().diff(moment(mills), 'seconds') / 60);
export function uploadBase(
	cgmsim: Entry | Activity | Note | SimulationResult,
	nsUrlApi: string,
	apiSecret: string
): Promise<void> {
	const _isHttps = isHttps(nsUrlApi);

	const { postParams } = setupParams(apiSecret, _isHttps);
	const body_json = JSON.stringify(cgmsim);

	return fetch(nsUrlApi, {
		...postParams,
		body: body_json,
	})
		.then(() => {
			logger.debug('NIGHTSCOUT Updated');
		})
		.catch((err) => {
			logger.debug(err);
			throw new Error(err);
		});
}
export function loadBase(
	nsUrlApi: string,
	apiSecret: string
): Promise<(Entry | Activity | Note)[]> {
	const _isHttps = isHttps(nsUrlApi);

	const { getParams } = setupParams(apiSecret, _isHttps);

	return fetch(nsUrlApi, {
		...getParams,
	})
		.then((result) => {
			logger.debug('NIGHTSCOUT Load');
			return result.json();
		})
		.catch((err) => {
			logger.debug(err);
			throw new Error(err);
		});
}
