import { Activity } from "./Types";
import { getDeltaMinutes } from "./utils";

type MinutesAgo = { minutesAgo: number };

const MIN_HR = 10;
const MAX_HR = 170;

// export function physicalIsf(activities: Activity[]): number {
// 	if (hasHeartRate(activities)) {
// 		return physicalHeartRateIsf(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
// 	} else {
// 		return physicalStepsIsf(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
// 	}
// }

// export function physicalLiver(activities: Activity[]): number {
// 	//TODO check activity with HR
// 	if (hasHeartRate(activities)) {
// 		return physicalHeartRateLiver(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
// 	} else {
// 		return physicalStepsLiver(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
// 	}
// }

//ALTERNATIVE
//===========
export function physicalIsf(activities: Activity[]): number {
	const aaa = physicalHeartRateIsf(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
	const bbb = physicalStepsIsf(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
	return Math.max(aaa, bbb);

}

export function physicalLiver(activities: Activity[]): number {
	//TODO check activity with HR
	const aaa =  physicalHeartRateLiver(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
	const bbb =  physicalStepsLiver(activities.map(a => ({ ...a, minutesAgo: getDeltaMinutes(a.created_at) })));
	return Math.max(aaa, bbb);
}




// HEARTRATE
// =======================

function physicalHeartRateIsf(activities: (Activity & MinutesAgo)[]): number {
	let last360min = activities.filter((e) => e.minutesAgo <= 360 && e.minutesAgo >= 0);

	// Here we compute the effect of heartRate on ISF
	// let's compute the "activity" based on the heart rate every 5 min in the last 6 hours
	// this "activity" is a coefficient that will affect the ISF  
	// ====================================================================================

	let timeSinceHRAct = last360min.map(entry => {

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

				return hrRatio * (240 - minutesAgo) / (24000);
			}
			else if (hrRatio > 0.75 && hrRatio <= 0.9) {
				// in moderate intensity "cardio" exercise, I suggest a steady, linearly
				// decreasing effect over 6 hours:

				// after 10 minutes the effect is (360-10)/2*36000 = 35/7200 = 0.004861	
				// after 60 minutes the effect is (360-60)/2*36000 = 30/7200 = 0.004166		
				// after 120 minutes the effect is (360-120)/2*36000 = 24/7200 = 0.00333
				// after 180 minutes the effect is (360-180)/2*36000 = 18/7200 = 0.00250
				// after 240 minutes the effect is (360-240)/2*36000 = 12/7200 = 0.00166
				return hrRatio * (360 - minutesAgo) / (72000);
			}
			else if (hrRatio > 0.9) {
				return 0
			}
		} else {
			return 0;
		}
	});
	const resultHRAct = 1 + timeSinceHRAct.reduce((tot, arr) => tot + arr, 0);

	console.log(`@@@ PHYSICAL HEARTRATE ISF:`, resultHRAct);
	return resultHRAct;
}


function physicalHeartRateLiver(activities: (Activity & MinutesAgo)[]): number {
	let last360min = activities.filter((e) => e.minutesAgo <= 360);

	// Here we compute the effect of heartRate on liver EGP
	// Let's compute the "activity" based on the heart rate every 5 min in the last 6 hours
	// This "activity" will affect the endogenous glucose production EGP a.k.a. "liver"
	// Every activity point depends on the HR entry, expressed as a "relative excess of HR"
	// ====================================================================================

	let timeSinceHRAct = last360min.map(entry => {

		const minutesAgo = entry.minutesAgo;
		const heartRate = entry.heartRate;
		const hrRatio = entry.heartRate / MAX_HR;
		if (minutesAgo >= 0 && hrRatio > 0.6) {
			if (hrRatio > 0.6 && hrRatio <= 0.75) {
				// in low intensity "fat burn" exercise,
				// the original "liver" function is not altered
				return 0;
			}
			else if (hrRatio > 0.75 && hrRatio <= 0.9) {
				// in moderate intensity "cardio" exercise, I suggest a steady low, linearly
				// decreasing effect over 4 hours:

				// after 10 minutes the effect is (240-10)/24000 = 23/2400 = 0.009583	
				// after 60 minutes the effect is (240-60)/24000 = 18/2400 = 0.0075		
				// after 120 minutes the effect is (240-120)/24000 = 12/2400 = 0.005
				// after 180 minutes the effect is (240-180)/24000 = 6/2400 = 0.0025

				return Math.max(hrRatio * (240 - minutesAgo) / (24000), 0);
			}
			else if (hrRatio > 0.9) {
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
	console.log(`@@@ PHYSICAL HEARTRATE LIVER:`, resultHRAct);
	return resultHRAct;
}





// STEPS
// ============================================

function physicalStepsIsf(activities: (Activity & MinutesAgo)[]): number {

	// Here we compute the effect of steps on ISF
	// the total steps of the last 4 hours should be compared to 
	// the mean number of steps/4hours counted the previous week
	// or to a default of 1500 steps/4h (6000 steps/16 hours)

	// compute cumulative daily steps in the previous 7 days or 7 * 1440 min
	// then divide by 16 hours for hourly steps and multiply by 4 for 4-hour periods
	let last7daysSteps = activities.filter((e) => e.minutesAgo <= 10080);
	let cumulativeSteps = last7daysSteps.reduce(function (tot, arr) {
		return tot + arr.steps;
	}, 0);
	let mean4hourSteps = cumulativeSteps / 4;
	console.log(`mean4hourSteps:`, mean4hourSteps);

	// compute last 4 hours steps
	let last4hoursActivities = activities.filter((e) => e.minutesAgo <= 240);
	let last4hourSteps = last4hoursActivities.reduce(function (tot, arr) {
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


function physicalStepsLiver(activities: (Activity & MinutesAgo)[]): number {

	// Here we compute the effect of steps on liver EGP
	// We'll assume the number of steps doesn't affect the EGP
	// or Endogenous Glucose Production by the liver
	return null;
}


// Helper functions
//=================

function hasHeartRate(activities: Activity[]): boolean {
	return activities.some(a => a.heartRate > MIN_HR);
}

