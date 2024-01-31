import fetch from 'node-fetch';
import * as moment from 'moment';
import pino, { LevelWithSilent, TransportTargetOptions } from 'pino';
import setupParams from './setupParams';
import {
	Activity,
	Entry,
	Note,
	SimulationResult,
	TreatmentBiexpParam,
} from './Types';
import { load } from 'ts-dotenv';
import pinoPretty from 'pino-pretty';
import { TypeDateISO } from './TypeDateISO';

const env = load({
	LOGTAIL_SECRET: { type: String, optional: true },
	LOG_LEVEL: { type: String, optional: true },
	NODE_ENV: { type: String, optional: true },
});

const token: string = env.LOGTAIL_SECRET;
const level: LevelWithSilent | string = env.LOG_LEVEL ?? 'error';

const targets: TransportTargetOptions[] = [];

let _nsUrl = null;

export const setLogger = (nsUrl) => {
	_nsUrl = nsUrl;
};

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
const getLogger = () => logger.child({ nsUrl: _nsUrl });
export default getLogger;

export function isHttps(url: string | null | undefined): boolean {
	if (!url) {
		return false; // Return false for null or undefined input
	}

	// Rest of the function remains the same
	const pattern = /^https:\/\//i;
	return pattern.test(url);
}

export function removeTrailingSlash(str) {
	return str.endsWith('/') ? str.slice(0, -1) : str;
}

export function getBiexpTreatmentActivity({
	peak,
	duration,
	minutesAgo,
	units,
}: TreatmentBiexpParam) {
	const tau = (peak * (1 - peak / duration)) / (1 - (2 * peak) / duration);
	const a = (2 * tau) / duration;
	const S = 1 / (1 - a + (1 + a) * Math.exp(-duration / tau));
	const activity =
		units *
		(S / Math.pow(tau, 2)) *
		minutesAgo *
		(1 - minutesAgo / duration) *
		Math.exp(-minutesAgo / tau);
	if (activity <= 0) {
		return 0;
	}
	if (minutesAgo < 15) {
		return activity * (minutesAgo / 15);
	}
	return activity;
}

export const getDeltaMinutes = (mills: number | TypeDateISO) =>
	Math.round(moment().diff(moment(mills), 'seconds') / 60);

export function uploadBase(
	cgmsim: Entry | Activity | Note | SimulationResult,
	nsUrlApi: string,
	apiSecret: string,
): Promise<void> {
	const _isHttps = isHttps(nsUrlApi);

	const { postParams } = setupParams(apiSecret, _isHttps);
	const body_json = JSON.stringify(cgmsim);

	return fetch(nsUrlApi, {
		...postParams,
		body: body_json,
	})
		.then(() => {
			getLogger().debug('NIGHTSCOUT Updated');
		})
		.catch((err) => {
			getLogger().debug(err);
			throw new Error(err);
		});
}

export function loadBase(
	nsUrlApi: string,
	apiSecret: string,
): Promise<(Entry | Activity | Note)[]> {
	const _isHttps = isHttps(nsUrlApi);
	const { getParams } = setupParams(apiSecret, _isHttps);
	return fetch(nsUrlApi, {
		...getParams,
	})
		.then((result) => {
			getLogger().debug('NIGHTSCOUT Load');
			return result.json();
		})
		.catch((err) => {
			getLogger().debug(err);
			throw new Error(err);
		});
}
export function roundTo8Decimals(number: number) {
	let multiplier = Math.pow(10, 8);
	let roundedNumber = Math.round(number * multiplier) / multiplier;
	return roundedNumber;
}
