import { Activity, GenderType } from './Types';
import logger from './utils';
type MinutesAgo = { minutesAgo: number };

const MIN_HR = 10;

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

export function physicalHeartRateIsf(activities: (Activity & MinutesAgo)[], MAX_HR: number): number {
	let last360min = activities.filter((e) => e.minutesAgo <= 360 && e.minutesAgo >= 0);

	// Here we compute the effect of heartRate on ISF
	// let's compute the "activity" based on the heart rate every 5 min in the last 6 hours
	// this "activity" is a coefficient that will affect the ISF
	// ====================================================================================

	let timeSinceHRAct = last360min.map((entry) => {
		const minutesAgo = entry.minutesAgo;
		const heartRate = entry.heartRate;
		const hrRatio = heartRate / MAX_HR;
		if (minutesAgo >= 0 && hrRatio > 0.6) {
			if (hrRatio <= 0.75) {
				// in low intensity "fat burn" exercise, I suggest a steady low, linearly
				// decreasing effect over 4 hours:

				// after 10 minutes the effect is (240-10)/24000 = 23/2400 = 0.009583
				// after 60 minutes the effect is (240-60)/24000 = 18/2400 = 0.0075
				// after 120 minutes the effect is (240-120)/24000 = 12/2400 = 0.005
				// after 180 minutes the effect is (240-180)/24000 = 6/2400 = 0.0025

				return (hrRatio * (240 - minutesAgo)) / 24000;
			} else if (hrRatio > 0.75 && hrRatio <= 0.9) {
				// in moderate intensity "cardio" exercise, I suggest a steady, linearly
				// decreasing effect over 6 hours:

				// after 10 minutes the effect is (360-10)/2*36000 = 35/7200 = 0.004861
				// after 60 minutes the effect is (360-60)/2*36000 = 30/7200 = 0.004166
				// after 120 minutes the effect is (360-120)/2*36000 = 24/7200 = 0.00333
				// after 180 minutes the effect is (360-180)/2*36000 = 18/7200 = 0.00250
				// after 240 minutes the effect is (360-240)/2*36000 = 12/7200 = 0.00166
				return (hrRatio * (360 - minutesAgo)) / 72000;
			} else if (hrRatio > 0.9) {
				return 0;
			}
		} else {
			return 0;
		}
	});
	const resultHRAct = 1 + timeSinceHRAct.reduce((tot, arr) => tot + arr, 0);

	logger.debug(`@@@ PHYSICAL HEART RATE ISF: %o`, resultHRAct);
	return resultHRAct;
}

export function physicalHeartRateLiver(activities: (Activity & MinutesAgo)[], MAX_HR: number): number {
	let last360min = activities.filter((e) => e.minutesAgo <= 360);

	// Here we compute the effect of heartRate on liver EGP
	// Let's compute the "activity" based on the heart rate every 5 min in the last 6 hours
	// This "activity" will affect the endogenous glucose production EGP a.k.a. "liver"
	// Every activity point depends on the HR entry, expressed as a "relative excess of HR"
	// ====================================================================================

	let timeSinceHRAct = last360min.map((entry) => {
		const minutesAgo = entry.minutesAgo;
		const heartRate = entry.heartRate;
		const hrRatio = entry.heartRate / MAX_HR;
		if (minutesAgo >= 0 && hrRatio > 0.6) {
			if (hrRatio > 0.6 && hrRatio <= 0.75) {
				// in low intensity "fat burn" exercise,
				// the original "liver" function is not altered
				return 0;
			} else if (hrRatio > 0.75 && hrRatio <= 0.9) {
				// in moderate intensity "cardio" exercise, I suggest a steady low, linearly
				// decreasing effect over 4 hours:

				// after 10 minutes the effect is (240-10)/24000 = 23/2400 = 0.009583
				// after 60 minutes the effect is (240-60)/24000 = 18/2400 = 0.0075
				// after 120 minutes the effect is (240-120)/24000 = 12/2400 = 0.005
				// after 180 minutes the effect is (240-180)/24000 = 6/2400 = 0.0025

				return Math.max((hrRatio * (240 - minutesAgo)) / 24000, 0);
			} else if (hrRatio > 0.9) {
				// in intense anaerobic "peak" exercise, the activity should be high
				// but decline rapidly to avoid accumulation:

				// after 5 minutes the effect is = 0.05807
				// after 10 minutes the effect is = 0.03881
				// after 30 minutes the effect is = 0.01024
				// after 60 minutes the effect is = 0.00189
				// after 240 minutes the effect is = 6E107

				let a = 0.15;
				let b = 0.8;
				let c = -a * Math.pow(minutesAgo, b);
				return hrRatio * 0.1 * Math.exp(c);
			}
		} else {
			return 0;
		}
	});
	//console.log(`timeSinceHRAct;`, timeSinceHRAct);
	//const resultHRAct = Math.min(Math.max((1 + timeSinceHRAct.reduce((tot, arr) => tot + arr, 0)),0),3);
	const resultHRAct = 1 + timeSinceHRAct.reduce((tot, arr) => tot + arr, 0);
	logger.debug(`@@@ PHYSICAL HEART RATE LIVER: %o`, resultHRAct);
	return resultHRAct;
}

export function hasHeartRate(activities: Activity[]): boolean {
	return activities.some((a) => a.heartRate > MIN_HR);
}

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
