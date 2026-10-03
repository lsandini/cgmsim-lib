import { Activity, GenderType } from './types';
import logger from './logger';

type MinutesAgo = { minutesAgo: number };

const MIN_HR = 10;

/**
 * Calculates maximum heart rate based on age and gender
 * @param age - Patient's age
 * @param gender - Patient's gender
 * @returns number - Maximum heart rate in beats per minute
 */
export function getMaxHr(age: number, gender: GenderType | 'male' | 'female') {
	let MAX_HR = 170;
	if (age > 0) {
		if (gender === 'Male' || gender === 'male') {
			MAX_HR = 210 - 0.7 * age;
		} else if (gender === 'Female' || gender === 'female') {
			MAX_HR = 190 - 0.4 * age;
		}
	}
	return MAX_HR;
}

/**
 * Calculates ISF adjustment based on heart rate activity
 */
export function physicalHeartRateIsf(activities: (Activity & MinutesAgo)[], MAX_HR: number): number {
	const last360min = activities.filter((e) => e.minutesAgo <= 360 && e.minutesAgo >= 0);

	const timeSinceHRAct = last360min.map((entry) => {
		const { minutesAgo, heartRate } = entry;
		const hrRatio = heartRate / MAX_HR;

		if (minutesAgo < 0 || hrRatio <= 0.6) return 0;

		if (hrRatio <= 0.75) {
			return (hrRatio * (240 - minutesAgo)) / 24000;
		}
		if (hrRatio <= 0.9) {
			return (hrRatio * (360 - minutesAgo)) / 72000;
		}
		return 0;
	});

	const resultHRAct = timeSinceHRAct.reduce((tot, curr) => tot + curr, 0);
	logger.debug('[heartRate] HR effect on ISF:', { resultHRAct });
	return resultHRAct;
}

/**
 * Calculates liver glucose production adjustment based on heart rate
 */
export function physicalHeartRateLiver(activities: (Activity & MinutesAgo)[], MAX_HR: number): number {
	const last360min = activities.filter((e) => e.minutesAgo <= 360);

	const timeSinceHRAct = last360min.map((entry) => {
		const { minutesAgo, heartRate } = entry;
		const hrRatio = heartRate / MAX_HR;

		if (minutesAgo < 0 || hrRatio <= 0.6 || !hrRatio) {
			return 0;
		}

		if (hrRatio <= 0.75) {
			return 0;
		}
		if (hrRatio <= 0.9) {
			return Math.max((hrRatio * (240 - minutesAgo)) / 24000, 0);
		}
		const a = 0.15;
		const b = 0.8;
		return hrRatio * 0.1 * Math.exp(-a * Math.pow(minutesAgo, b));
	});

	const resultHRAct = timeSinceHRAct.reduce((tot, curr) => tot + curr, 0);
	logger.debug('[heartRate] HR effect on liver:', { resultHRAct });
	return resultHRAct;
}

export function hasHeartRate(activities: Activity[]): boolean {
	return activities.some((a) => (a.heartRate ?? 0) > MIN_HR);
}

export function physicalHeartIntensity(activities: (Activity & MinutesAgo)[], MAX_HR: number) {
	const last5min = activities?.filter((e) => e.minutesAgo <= 5);

	let minutesAgo = 360;
	let hrRatio = 0;

	last5min?.forEach((entry) => {
		if (entry.minutesAgo < minutesAgo) {
			minutesAgo = entry.minutesAgo;
			hrRatio = (entry.heartRate ?? 0) / MAX_HR;
		}
	});
	return hrRatio > 0.8 ? 0 : hrRatio;
}
