import fetch from 'node-fetch';
import * as moment from 'moment';
import pino, { LevelWithSilent, TransportTargetOptions } from 'pino';
import setupParams from './setupParams';
import { Activity, DeviceStatus, Entry, Note, SimulationResult, TreatmentExpParam } from './Types';
import { load } from 'ts-dotenv';
import pinoPretty from 'pino-pretty';
import { TypeDateISO } from './TypeDateISO';

const env = load({
	LOGTAIL_SECRET: { type: String, optional: true },
	LOGTAIL_HOST: { type: String, optional: true },
	LOG_LEVEL: { type: String, optional: true },
	NODE_ENV: { type: String, optional: true },
});

const token: string = env.LOGTAIL_SECRET;
const host: string = env.LOGTAIL_HOST;

const level: LevelWithSilent | string = env.LOG_LEVEL ?? 'error';

const targets: TransportTargetOptions[] = [];
let options;
if (host) {
	options = { endpoint: 'https://' + host };
}
if (token) {
	targets.push({
		target: '@logtail/pino',
		options: { sourceToken: token, options },

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
 * Calculates remaining insulin on board (IOB) using the exponential model
 *
 * @param params - Treatment parameters including peak, duration, minutesAgo, and units
 * @returns Remaining insulin on board in units
 */
export function getExpTreatmentIOB({ peak, duration, minutesAgo, units }: TreatmentExpParam): number {
	if (minutesAgo >= duration) {
		return 0;
	}

	// Calculate model parameters
	const tau = (peak * (1 - peak / duration)) / (1 - (2 * peak) / duration);
	const a = (2 * tau) / duration;
	const S = 1 / (1 - a + (1 + a) * Math.exp(-duration / tau));

	// Calculate IOB fraction using the formula
	let iobFraction =
		1 -
		S *
			(1 - a) *
			((Math.pow(minutesAgo, 2) / (tau * duration * (1 - a)) - minutesAgo / tau - 1) * Math.exp(-minutesAgo / tau) + 1);

	// Handle ramp-up period in first 15 minutes
	if (minutesAgo < 15) {
		iobFraction = 1 - (minutesAgo / 15) * (1 - iobFraction);
	}

	// Scale by units and ensure non-negative
	return Math.max(0, units * iobFraction);
}

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
	data: Entry | Activity | Note | SimulationResult | DeviceStatus,
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
			logger.error('[utils] Error: %o', error);
			throw new Error(error);
		});
}

/**
 * Deletes data from the Nightscout API that is older than a specified number of days.
 * @param days - Number of days to retain data. Data older than this will be deleted.
 * @param apiUrl - Nightscout API URL.
 * @param apiSecret - Nightscout API secret.
 * @returns A promise that resolves when the deletion is complete.
 * @throws Error if the deletion fails.
 * @example
 * // Delete data older than 30 days from Nightscout
 * deleteBase(30, "https://nightscout.example.com/api/v1/treatments", "apiSecret123")
 *   .then(() => {
 *     console.log("Old data deleted successfully.");
 *   })
 *   .catch((error) => {
 *     console.error("Error deleting old data:", error);
 *   });
 */
export function deleteBase(days: number, apiUrl: string, apiSecret: string): Promise<void> {
	const isSecure = isHttps(apiUrl);
	const { deleteParams } = setupParams(apiSecret, isSecure);
	const date = new Date();
	date.setDate(date.getDate() - days);
	const isoDate = date.toISOString().split('T')[0];

	return fetch(apiUrl + '?find[created_at][$lte]=' + isoDate, {
		...deleteParams,
	})
		.then(() => {
			logger.debug('[utils] Successfully deleted old data from Nightscout');
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
export function loadBase(apiUrl: string, apiSecret: string): Promise<(Entry | Activity | Note | DeviceStatus)[]> {
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
