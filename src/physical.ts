import { Activity } from "./Types";
import { getDeltaMinutes } from "./utils";

type MinutesAgo = { minutesAgo: number };

const MIN_HR = 10;
const MAX_HR = 170;


export function physicalIsf(activities: Activity[]): number {
	if (hasHearRate(activities)) {
	return physicalHeartRateIsf(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
	} else {
		return physicalStepsIsf(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
	}
}


export function physicalLiver(activities: Activity[]): number {
	//TODO check activity with HR
	if (hasHearRate(activities)) {
		return physicalHeartRateLiver(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
	} else {
		return physicalStepsLiver(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
	}
}



//ISF
function physicalStepsIsf(activities: (Activity & MinutesAgo)[]): number {
	return null;
}
function physicalHeartRateIsf(activities: (Activity & MinutesAgo)[]): number {
	let last240min = activities.filter((e) => e.minutesAgo <= 240 && e.minutesAgo >= 0);


	// let's compute the "activity" based on the heart rate every 5 min in the last 6 hours
	// this "activity" will affect the ISF and/or the endogenous glucose production EGP a.k.a. 
	// ============================================================

	let timeSinceHRAct = last240min.map(entry => {

		const time = entry.minutesAgo;
		const heartRate = entry.heartRate;

		const hrRatio = heartRate / MAX_HR;
		const lambda = 0.1;

		if (hrRatio <= 0.6) {
			return 0
		}
		else if (hrRatio > 0.6 && hrRatio <= 0.75) {
			return heartRate / MAX_HR * (Math.exp(-lambda * time))
		}
		else if (hrRatio > 0.75 && hrRatio <= 0.9) {
			return heartRate / MAX_HR * (1 - (time / 240)) //linear decay			
		}
		else if (hrRatio > 0.9) {
			return heartRate / MAX_HR * (1 - (Math.pow(time / 240, 3))) // "cubic" decay

		}
	});
	const resultHRAct = timeSinceHRAct.reduce((tot, arr) => tot + arr, 0);
	return 1 + resultHRAct;
}


//LIVER
function physicalHeartRateLiver(activities: (Activity & MinutesAgo)[]): number {
	return null;
}
function physicalStepsLiver(activities: (Activity & MinutesAgo)[]): number {
	return null;
}

function hasHearRate(activities: Activity[]): boolean {
	return activities.some(a => a.heartRate > MIN_HR);
}

