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

	// Here we compute the effect of steps on ISF
	// the total steps of the last 4 hours should be compared to 
	// the mean number of steps/4hours counted the previous week
	// or to a default of 1500 steps/4h (6000 steps/16 hours)

	// compute cumulative daily steps in the previous 7 days or 7 * 1440 min
	// then divide by 16 hours for hourly steps and multiply by 4 for 4-hour periods
	let last7daysSteps = activities.filter((e) => e.minutesAgo <= 10080);
	let cumulativeSteps = last7daysSteps.reduce(function(tot, arr) {
		return tot + arr.steps;
	}, 0);
	let mean4hourSteps = cumulativeSteps/4;
	console.log(`mean4hourSteps:`, mean4hourSteps);

	// compute last 4 hours steps
	let last4hoursActivities = activities.filter((e) => e.minutesAgo <= 240);
	let last4hourSteps = last4hoursActivities.reduce(function(tot, arr) {
		return tot + arr.steps;
	}, 0);
	console.log(`last4hourSteps:`, last4hourSteps);

	let stepRatio = last4hourSteps / mean4hourSteps;

	let resultStepAct = 1;

	// if the stepcount in the last 4 hours is <= to the mean 4hours steps, no effect on ISF
	if (stepRatio <= 1) {
		resultStepAct = 1
	}		
	else if (stepRatio > 1 && stepRatio <= 3) {
		resultStepAct = 2
	}
	else if (stepRatio > 3 && stepRatio <= 5) {
		resultStepAct = 3						
	}
	else if (stepRatio > 5) {
		resultStepAct = 4
	};
	return resultStepAct;
}


function physicalHeartRateIsf(activities: (Activity & MinutesAgo)[]): number {
	let last240min = activities.filter((e) => e.minutesAgo <= 240 && e.minutesAgo >= 0);

	// Here we compute the effect of heartRate on ISF
	// let's compute the "activity" based on the heart rate every 5 min in the last 6 hours
	// this "activity" is a coefficient that will affect the ISF  
	// ====================================================================================

	let timeSinceHRAct = last240min.map(entry => {

		const minutesAgo = entry.minutesAgo;
		const heartRatio = entry.heartRate/MAX_HR;
		
		const hrRatio = entry.heartRate/ MAX_HR;		
		const lambda = 0.08; // very short

		if (hrRatio <= 0.6) {
			return 0
		}
		else if (hrRatio > 0.6 && hrRatio <= 0.75) {
			return heartRatio * (1 - (Math.pow(minutesAgo / 240, 3))) // "low = cubic" slow decay
			//return heartRate / MAX_HR * (1 - Math.sqrt(time / 240)) // "low = square root" decay	
		}
		else if (hrRatio > 0.75 && hrRatio <= 0.9) {
			return heartRatio * (1 - (minutesAgo / 240)) // "mid = linear" decay						
		}
		else if (hrRatio > 0.9) {
			return heartRatio * (Math.exp(-lambda * minutesAgo)) // "peak = exponential" very fast decay
		}
	});
	const resultHRAct = timeSinceHRAct.reduce((tot, arr) => tot + arr, 0);
	return 1 + resultHRAct;
}


//LIVER
function physicalHeartRateLiver(activities: (Activity & MinutesAgo)[]): number {
	let last240min = activities.filter((e) => e.minutesAgo <= 240);

	// Here we compute the effect of heartRate on liver EGP
	// let's compute the "activity" based on the heart rate every 5 min in the last 6 hours
	// this "activity" will affect the endogenous glucose production EGP a.k.a. "liver"
	// ====================================================================================

	let timeSinceHRAct = last240min.map(entry => {

		const minutesAgo = entry.minutesAgo;
		const heartRate = entry.heartRate;
		
		const hrRatio = heartRate / MAX_HR;		
		const lambda = 0.03; // longer than effect on ISF, but still short

		if (hrRatio <= 0.6) {
			return 0
		}
		else if (hrRatio > 0.6 && hrRatio <= 0.75) {
			return 0
		}
		else if (hrRatio > 0.75 && hrRatio <= 0.9) {
			return hrRatio * (1 - (minutesAgo / 240)) // "linear" decay OR:
			//return heartRate / MAX_HR * (1 - Math.sqrt(time / 240)) // "square root" decay				
		}
		else if (hrRatio > 0.9) {
			return hrRatio * (Math.exp(-lambda * minutesAgo)) // "exponential" fast decay
		}
	});
	const resultHRAct = timeSinceHRAct.reduce((tot, arr) =>tot + arr, 0);	
	return resultHRAct;
}


function physicalStepsLiver(activities: (Activity & MinutesAgo)[]): number {

	// Here we compute the effect of steps on liver EGP
	// We'll assume the number of steps doesn't affect the EGP
	// or Endogenous Glucose Production by the liver
	return null;
}


// Helper functions
//=================

function hasHearRate(activities: Activity[]): boolean {
	return activities.some(a => a.heartRate > MIN_HR);
}

