import fetch from 'node-fetch';
import * as moment from 'moment';
import pino, { LevelWithSilent, TransportTargetOptions } from 'pino';
import setupParams from './setupParams';
import { Activity, Entry, EntryValueType, Note, Sgv, SimulationResult, TreatmentExpParam } from './Types';
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

/**
 * Checks if a URL starts with HTTPS protocol
 * @param url - URL to check
 * @returns boolean indicating if the URL uses HTTPS
 */
export function isHttps(url: string | null | undefined): boolean {
	if (!url) {
		return false;
	}
	const httpsPattern = /^https:\/\//i;
	return httpsPattern.test(url);
}

/**
 * Removes trailing slash from a string if present
 * @param inputString - String to process
 * @returns String without trailing slash
 */
export function removeTrailingSlash(inputString: string): string {
	return inputString.endsWith('/') ? inputString.slice(0, -1) : inputString;
}

/**
 * Calculates exponential treatment activity based on given parameters
 * @param params - Treatment parameters including peak, duration, minutesAgo, and units
 * @returns Calculated activity value
 */
export function getExpTreatmentActivity({ peak, duration, minutesAgo, units }: TreatmentExpParam): number {
	const tau = (peak * (1 - peak / duration)) / (1 - (2 * peak) / duration);
	const scaleFactor = (2 * tau) / duration;
	const normalizationFactor = 1 / (1 - scaleFactor + (1 + scaleFactor) * Math.exp(-duration / tau));

	let activity =
		units *
		(normalizationFactor / Math.pow(tau, 2)) *
		minutesAgo *
		(1 - minutesAgo / duration) *
		Math.exp(-minutesAgo / tau);

	if (activity <= 0) {
		return 0;
	}

	// Ramp up activity linearly in first 15 minutes
	if (minutesAgo < 15) {
		return activity * (minutesAgo / 15);
	}

	return activity;
}
/**
 * Calculates exponential treatment activity based on given parameters
 * @param params - Treatment parameters including peak, duration, minutesAgo, and units
 * @returns Calculated activity value
 */
export function getExpTreatmentOnBody({ peak, duration, minutesAgo, units }: TreatmentExpParam): number {
	const tau = (peak * (1 - peak / duration)) / (1 - (2 * peak) / duration);
	const scaleFactor = (2 * tau) / duration;
	const normalizationFactor = 1 / (1 - scaleFactor + (1 + scaleFactor) * Math.exp(-duration / tau));

	let activity =
		units *
		(normalizationFactor / Math.pow(tau, 2)) *
		minutesAgo *
		(1 - minutesAgo / duration) *
		Math.exp(-minutesAgo / tau);

	if (activity <= 0) {
		return 0;
	}

	// Ramp up activity linearly in first 15 minutes
	if (minutesAgo < 15) {
		return activity * (minutesAgo / 15);
	}

	return activity;
}
const DEFAULT_SETTINGS = {
	KP: 3.0,
	KI: 0.3,
	KD: 1.8,
	TDI: 60,
	TARGET: 72, // mg/dL (6.0 mmol/L)
};

export const calculatePID = (
	entries: Sgv[],
	{ KP, KI, KD, TDI }: { KP: number; KI: number; KD: number; TDI: number } = DEFAULT_SETTINGS,
) => {
	try {
		if (!entries || entries.length < 36) {
			console.log('Entries received:', {
				entriesProvided: entries?.length || 0,
				required: 36,
				entries: entries,
			});
			throw new Error('Insufficient CGM data');
		}

		console.log('Starting PID calculation with entries:', entries.length);

		const settings = {
			target: DEFAULT_SETTINGS.TARGET,
			tdi: TDI,
			Kp: KP,
			Ki: KI,
			Kd: KD,
			maxBasalRate: (TDI / 24) * 1.5,
		};
		console.log('PID settings:', settings);

		const currentGlucose = entries[0].sgv;
		const error = (settings.target - currentGlucose) / 100;

		if (currentGlucose < settings.target) {
			console.log('Below target glucose - suspending insulin');
			return {
				rate: 0,
				diagnostics: {
					pTerm: 0,
					iTerm: 0,
					dTerm: 0,
					currentGlucose,
					suspendedForSafety: true,
				},
			};
		}

		const pTerm = -settings.Kp * error;

		const recentReadings = entries.slice(0, 24);
		const integralError = recentReadings.reduce((sum, reading, index) => {
			if (index === 0) return sum;
			const prevReading = recentReadings[index - 1];
			const timeGap = (prevReading.mills - reading.mills) / (1000 * 60);
			const prevError = (settings.target - prevReading.sgv) / 100;
			const currentError = (settings.target - reading.sgv) / 100;
			const avgError = (prevError + currentError) / 2;
			return sum + (avgError * timeGap) / 60;
		}, 0);

		const iTerm = -settings.Ki * integralError;

		let dTerm = 0;
		if (entries.length >= 3) {
			const window = entries.slice(0, 3);
			const timeSpanHours = (window[0].mills - window[2].mills) / (1000 * 60 * 60);
			const recentError = (settings.target - window[0].sgv) / 100;
			const olderError = (settings.target - window[2].sgv) / 100;
			const errorChange = recentError - olderError;
			const errorRateOfChange = errorChange / timeSpanHours;
			dTerm = -settings.Kd * errorRateOfChange;
		}

		let totalRate = Math.max(0, Math.min(pTerm + iTerm + dTerm, settings.maxBasalRate));
		const rate = Math.round(totalRate * 20) / 20;

		console.log('PID calculation result:', {
			rate,
			diagnostics: {
				pTerm,
				iTerm,
				dTerm,
				currentGlucose,
				suspendedForSafety: false,
			},
		});
		return {
			rate,
			diagnostics: { pTerm, iTerm, dTerm, currentGlucose },
		};
	} catch (error) {
		logger.error(`PID calculation error: %o`, error);
		throw error;
	}
};

/**
 * Calculates time difference in minutes between now and given timestamp
 * @param timestamp - Timestamp in milliseconds or ISO string
 * @returns Number of minutes difference
 */
export const getDeltaMinutes = (timestamp: number | TypeDateISO): number =>
	Math.round(moment().diff(moment(timestamp), 'seconds') / 60);

/**
 * Uploads data to Nightscout API
 * @param data - Data to upload (Entry, Activity, Note, or SimulationResult)
 * @param apiUrl - Nightscout API URL
 * @param apiSecret - API secret key
 * @returns Promise<void>
 */
export function uploadBase(
	data: Entry | Activity | Note | SimulationResult,
	apiUrl: string,
	apiSecret: string,
): Promise<void> {
	const isSecure = isHttps(apiUrl);
	const { postParams } = setupParams(apiSecret, isSecure);
	const jsonData = JSON.stringify(data);

	return fetch(apiUrl, {
		...postParams,
		body: jsonData,
	})
		.then(() => {
			logger.debug('[utils] Successfully updated Nightscout');
		})
		.catch((error) => {
			logger.debug('[utils] %o', error);
			throw new Error(error);
		});
}

/**
 * Loads data from Nightscout API
 * @param apiUrl - Nightscout API URL
 * @param apiSecret - API secret key
 * @returns Promise with array of entries
 */
export function loadBase(apiUrl: string, apiSecret: string): Promise<(Entry | Activity | Note)[]> {
	const isSecure = isHttps(apiUrl);
	const { getParams } = setupParams(apiSecret, isSecure);

	return fetch(apiUrl, {
		...getParams,
	})
		.then((response) => {
			logger.debug('[utils] Successfully loaded from Nightscout');
			return response.json();
		})
		.catch((error) => {
			logger.debug('[utils] %o', error);
			throw new Error(error);
		});
}

/**
 * Rounds a number to 8 decimal places
 * @param value - Number to round
 * @returns Rounded number
 */
export function roundTo8Decimals(value: number): number {
	const multiplier = Math.pow(10, 8);
	return Math.round(value * multiplier) / multiplier;
}
