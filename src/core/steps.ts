import { Activity } from './types';
import logger from './logger';

type MinutesAgo = { minutesAgo: number };

const MINUTES_IN_WEEK = 7 * 24 * 60; // 10080 minutes
const PERIODS_PER_DAY = 4; // Number of 4-hour periods
const MINUTES_IN_PERIOD = PERIODS_PER_DAY * 60; // 240 minutes (4 hours)
const MIN_STEPS_PER_PERIOD = 1500;
const MIN_VALID_STEPS = -1;
const DAYS_PER_WEEK = 7;
const ISF_ADJUSTMENT_FACTOR = 6;

export function physicalStepsIsf(activities: (Activity & MinutesAgo)[]): number {
	const previousWeekSteps = activities.filter(
		(activity) => activity.minutesAgo <= MINUTES_IN_WEEK && (activity.steps ?? 0) > MIN_VALID_STEPS,
	);
	const totalWeeklySteps = previousWeekSteps.reduce((total, activity) => total + (activity.steps ?? 0), 0);

	logger.debug('[steps] Weekly step metrics:', {
		totalSteps: totalWeeklySteps,
		dailyAverage: Math.round(totalWeeklySteps / DAYS_PER_WEEK),
	});

	const avgFourHourSteps = Math.max(
		Math.round(totalWeeklySteps / (DAYS_PER_WEEK * PERIODS_PER_DAY)),
		MIN_STEPS_PER_PERIOD,
	);
	logger.debug('[steps] 4-hour average steps:', { avgFourHourSteps });

	const recentActivities = activities.filter(
		(activity) => activity.minutesAgo <= MINUTES_IN_PERIOD && (activity.steps ?? 0) > MIN_VALID_STEPS,
	);
	const recentSteps = recentActivities.reduce((total, activity) => total + (activity.steps ?? 0), 0);
	logger.debug('[steps] Recent 4-hour steps:', { recentSteps });

	const stepRatio = recentSteps / avgFourHourSteps;
	let isfAdjustment = 0;

	if (stepRatio > 1) {
		isfAdjustment = stepRatio / ISF_ADJUSTMENT_FACTOR;
	}

	logger.debug('[steps] Steps effect on ISF:', { stepRatio, isfAdjustment });
	return isfAdjustment;
}

export function physicalStepsLiver(activities: (Activity & MinutesAgo)[]): number {
	const liverAdjustment = 0;
	logger.debug('Steps effect on liver EGP:', { liverAdjustment });
	return liverAdjustment;
}
