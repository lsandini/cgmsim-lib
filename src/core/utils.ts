import { TreatmentExpParam } from './types';
import { TypeDateISO } from './TypeDateISO';

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
 * Calculates time difference in minutes between now and given timestamp.
 * Pure JavaScript calculation with zero dependencies on moment.js.
 * @param timestamp - Timestamp in milliseconds, ISO string, or Date
 * @param now - Reference timestamp in milliseconds, ISO string, or Date
 * @returns Number of minutes difference
 */
export const getDeltaMinutes = (
	timestamp: number | TypeDateISO | string | Date,
	now?: number | TypeDateISO | string | Date,
): number => {
	const tNow = now != null ? new Date(now).getTime() : Date.now();
	const tThen = new Date(timestamp).getTime();
	return Math.round((tNow - tThen) / 60000);
};

/**
 * Rounds a number to 8 decimal places
 * @param value - Number to round
 * @returns Rounded number
 */
export function roundTo8Decimals(value: number): number {
	const multiplier = Math.pow(10, 8);
	return Math.round(value * multiplier) / multiplier;
}

/**
 * Fowler–Noll–Vo hash function (FNV-1a) returning an unsigned 32-bit integer.
 * @param input - The input string to hash
 * @returns 32-bit unsigned integer hash
 */
export function fnv1a(input: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

/**
 * Mulberry32 32-bit pseudo-random number generator (PRNG).
 * Produces a deterministic sequence of floating point numbers in [0, 1) from a 32-bit seed.
 * @param seed - 32-bit integer seed
 * @returns A zero-argument function returning a pseudo-random number in [0, 1)
 */
export function mulberry32(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Deterministic pseudo-random number utility combining FNV-1a hashing and Mulberry32 PRNG.
 * If called with a seed only, returns a generator function `() => number` producing floats in [0, 1).
 *
 * @param seed - Seed string or number
 * @returns A pseudo-random generator function producing values in [0, 1)
 */
export function rnd(seed: string | number): () => number;
/**
 * Directly generates a deterministic pseudo-random number in [min, max) using the given seed.
 *
 * @param seed - Seed string or number
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns A pseudo-random float in [min, max)
 */
export function rnd(seed: string | number, min: number, max: number): number;
export function rnd(seed: string | number, min?: number, max?: number): (() => number) | number {
	const numericSeed = typeof seed === 'number' ? seed : fnv1a(String(seed));
	const generator = mulberry32(numericSeed);
	if (min !== undefined && max !== undefined) {
		return min + generator() * (max - min);
	}
	return generator;
}

/**
 * Converts blood glucose from mg/dL to mmol/L.
 * @param mgdl - Blood glucose value in mg/dL
 * @returns Blood glucose value in mmol/L
 */
export function mgdlToMmol(mgdl: number): number {
	return mgdl / 18;
}

/**
 * Converts blood glucose from mmol/L to mg/dL.
 * @param mmol - Blood glucose value in mmol/L
 * @returns Blood glucose value in mg/dL
 */
export function mmolToMgdl(mmol: number): number {
	return mmol * 18;
}

/**
 * Calculates carb absorption rate at a given time using a triangular absorption model.
 * @param carbs - Total carbs in grams
 * @param minutesAgo - Elapsed minutes since meal
 * @param absorptionTime - Total absorption duration in minutes
 * @returns Absorption rate in g/min
 */
export function triangularAbsorptionRate(carbs: number, minutesAgo: number, absorptionTime: number): number {
	if (minutesAgo <= 0 || minutesAgo >= absorptionTime || absorptionTime <= 0) {
		return 0;
	}
	const halfTime = absorptionTime / 2;
	if (minutesAgo < halfTime) {
		return (carbs * 4 * minutesAgo) / Math.pow(absorptionTime, 2);
	}
	return ((carbs * 4) / absorptionTime) * (1 - minutesAgo / absorptionTime);
}

/**
 * Calculates remaining unabsorbed carbs at a given time using a triangular absorption model.
 * @param carbs - Total carbs in grams
 * @param minutesAgo - Elapsed minutes since meal
 * @param absorptionTime - Total absorption duration in minutes
 * @returns Remaining unabsorbed carbs in grams
 */
export function triangularAbsorptionRemaining(carbs: number, minutesAgo: number, absorptionTime: number): number {
	if (minutesAgo >= absorptionTime || absorptionTime <= 0) {
		return 0;
	}
	if (minutesAgo <= 0) {
		return carbs;
	}
	const halfTime = absorptionTime / 2;
	let remaining: number;
	if (minutesAgo < halfTime) {
		remaining = carbs - ((2 * carbs) / Math.pow(absorptionTime, 2)) * Math.pow(minutesAgo, 2);
	} else {
		remaining =
			2 * carbs - ((4 * carbs) / absorptionTime) * (minutesAgo - Math.pow(minutesAgo, 2) / (2 * absorptionTime));
	}
	return Math.max(0, remaining);
}

/**
 * Time components decomposed in hours, minutes, and decimal hours.
 */
export interface TimeComponents {
	decimalHours: number;
	hours: number;
	minutes: number;
}

/**
 * Extracts time components (decimal hours, hours, minutes) in a given timezone.
 * @param timezone - IANA timezone identifier (e.g. 'UTC', 'Europe/Rome')
 * @param referenceTime - Optional reference time (timestamp or Date, defaults to Date.now())
 * @returns TimeComponents object
 */
export function getTimeComponentsInTimezone(
	timezone: string,
	referenceTime: number | Date = Date.now(),
): TimeComponents {
	const currentTime = typeof referenceTime === 'number' ? referenceTime : referenceTime.getTime();
	const hoursString = new Date(currentTime).toLocaleString('en-US', {
		timeZone: timezone,
		hour: 'numeric',
		hour12: false,
	});
	const minutesString = new Date(currentTime).toLocaleString('en-US', {
		timeZone: timezone,
		minute: 'numeric',
	});

	const hours = parseInt(hoursString, 10);
	const minutes = parseInt(minutesString, 10);
	const decimalHours = hours + minutes / 60;

	return { decimalHours, hours, minutes };
}
