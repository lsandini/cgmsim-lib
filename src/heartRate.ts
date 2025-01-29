import { Activity, GenderType } from './Types';
import logger from './utils';
type MinutesAgo = { minutesAgo: number };

const MIN_HR = 10;

/**
 * Calculates maximum heart rate based on age and gender
 * @param age - Patient's age
 * @param gender - Patient's gender
 * @returns number - Maximum heart rate in beats per minute
 */
export function getMaxHr(age: number, gender: GenderType) {
	let MAX_HR = 170;
	if (age > 0) {
		if (gender === 'Male') {
			MAX_HR = 210 - 0.7 * age;
		} else if (gender === 'Female') {
			MAX_HR = 190 - 0.4 * age;
		}
	}
	return MAX_HR;
}

/**
 * Calculates ISF adjustment based on heart rate activity
 * @param activities - Array of activities containing heart rate data and time information
 * @param MAX_HR - Maximum heart rate calculated for the user
 * @returns number - ISF adjustment factor (1 = no effect, >1 = increased sensitivity)
 */
export function physicalHeartRateIsf(activities: (Activity & MinutesAgo)[], MAX_HR: number): number {
	// Filter activities from last 6 hours
	const last360min = activities.filter((e) => e.minutesAgo <= 360 && e.minutesAgo >= 0);

	const timeSinceHRAct = last360min.map((entry) => {
		const { minutesAgo, heartRate } = entry;
		const hrRatio = heartRate / MAX_HR;

		// Ignore activities with low HR or negative time
		if (minutesAgo < 0 || hrRatio <= 0.6) return 0;

		// Calculate effect based on intensity
		if (hrRatio <= 0.75) {
			// Low intensity (fat burn) - linear effect over 4 hours
			return (hrRatio * (240 - minutesAgo)) / 24000;
		}
		if (hrRatio <= 0.9) {
			// Medium intensity (cardio) - linear effect over 6 hours
			return (hrRatio * (360 - minutesAgo)) / 72000;
		}
		return 0; // High intensity (>90%) - no effect
	});

	const resultHRAct = timeSinceHRAct.reduce((tot, curr) => tot + curr, 0);
	logger.debug('HR effect on ISF:', { resultHRAct });
	return resultHRAct;
}

/**
 * Calculates liver glucose production adjustment based on heart rate
 * @param activities - Array of activities containing heart rate data and time information
 * @param MAX_HR - Maximum heart rate calculated for the user
 * @returns number - Liver adjustment factor (1 = no effect, >1 = increased production)
 */
export function physicalHeartRateLiver(activities: (Activity & MinutesAgo)[], MAX_HR: number): number {
	const last360min = activities.filter((e) => e.minutesAgo <= 360);

	const timeSinceHRAct = last360min.map((entry) => {
		const { minutesAgo, heartRate } = entry;
		const hrRatio = heartRate / MAX_HR;

		// Ignore activities with low HR or negative time
		if (minutesAgo < 0 || hrRatio <= 0.6) return 0;

		if (hrRatio <= 0.75) {
			return 0; // Low intensity - no effect
		}
		if (hrRatio <= 0.9) {
			// Medium intensity - linear effect over 4 hours
			return Math.max((hrRatio * (240 - minutesAgo)) / 24000, 0);
		}
		// High intensity - exponential decay
		const a = 0.15;
		const b = 0.8;
		return hrRatio * 0.1 * Math.exp(-a * Math.pow(minutesAgo, b));
	});

	const resultHRAct = timeSinceHRAct.reduce((tot, curr) => tot + curr, 0);
	logger.debug('HR effect on liver:', { resultHRAct });
	return resultHRAct;
}

/**
 * Checks if any valid heart rate readings exist in activities
 * @param activities - Array of activities containing heart rate data
 * @returns boolean - True if valid heart rate readings exist
 */
export function hasHeartRate(activities: Activity[]): boolean {
	return activities.some((a) => a.heartRate > MIN_HR);
}

/**
 * Calculates current physical intensity based on recent heart rate
 * @param activities - Array of activities containing heart rate data and time information
 * @param MAX_HR - Maximum heart rate calculated for the user
 * @returns number - Intensity ratio (0-0.8, where 0 = rest, 0.8 = high intensity)
 */
export function physicalHeartIntensity(activities: (Activity & MinutesAgo)[], MAX_HR: number) {
	let last5min = activities?.filter((e) => e.minutesAgo <= 5);

	let minutesAgo = 360;
	let hrRatio = 0;

	last5min?.forEach((entry) => {
		if (entry.minutesAgo < minutesAgo) {
			minutesAgo = entry.minutesAgo;
			hrRatio = entry.heartRate / MAX_HR;
		}
	});
	return hrRatio > 0.8 ? 0 : hrRatio;
}
