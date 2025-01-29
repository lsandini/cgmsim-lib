import { Activity, GenderType } from './Types';
import logger from './utils';
type MinutesAgo = { minutesAgo: number };

export function physicalStepsIsf(activities: (Activity & MinutesAgo)[]): number {
	// Here we compute the effect of steps on ISF
	// the total steps of the last 4 hours should be compared to
	// the mean number of steps/4hours counted the previous week
	// or to a default of 1500 steps/4h (6000 steps/16 hours)

	// compute cumulative daily steps in the previous 7 days or 7 * 1440 min
	// then divide by 16 hours for hourly steps and multiply by 4 for 4-hour periods
	let last7daysSteps = activities.filter((e) => e.minutesAgo <= 10080 && e.steps > -1);
	let cumulativeSteps = last7daysSteps.reduce(function (tot, arr) {
		return tot + arr.steps;
	}, 0);
	logger.debug(`cumulativeSteps 7 days steps: %o`, cumulativeSteps);
	logger.debug(`means steps over 7 days: %o`, Math.round(cumulativeSteps / 7));
	let mean4hourSteps = Math.max(Math.round(cumulativeSteps / (7 * 4)), 1500);
	logger.debug(`mean4hourSteps, min 1500: %o`, mean4hourSteps);

	// compute last 4 hours steps
	let last4hoursActivities = activities.filter((e) => e.minutesAgo <= 240 && e.steps > -1);
	let last4hourSteps = last4hoursActivities.reduce(function (tot, arr) {
		return tot + arr.steps;
	}, 0);
	logger.debug(`last4hourSteps: %o`, last4hourSteps);

	let stepRatio = last4hourSteps / mean4hourSteps;

	let resultStepAct = 1;

	// if the stepcount in the last 4 hours is <= to the mean 4hours steps, no effect on ISF
	if (stepRatio <= 1) {
		resultStepAct = 1;
	} else if (stepRatio > 1) {
		resultStepAct = 1 + stepRatio / 6;
		// if stepRatio is 1.8, result is 1 + 1.8/6 = 1.30
		// if stepRatio is 3, result is 1 + 3/6 = 1.5
	}
	logger.debug(`@@@ PHYSICAL STEPS ISF: %o`, resultStepAct);
	return resultStepAct;
}

export function physicalStepsLiver(activities: (Activity & MinutesAgo)[]): number {
	// Here we compute the effect of steps on liver EGP
	// We'll assume the number of steps doesn't affect the EGP
	// or Endogenous Glucose Production by the liver
	let resultStepAct = 1;
	logger.debug(`@@@ PHYSICAL STEPS LIVER: %o`, resultStepAct);
	return resultStepAct;
}
