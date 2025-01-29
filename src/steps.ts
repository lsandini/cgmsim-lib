import { Activity, GenderType } from './Types';
import logger from './utils';
type MinutesAgo = { minutesAgo: number };

export function physicalStepsIsf(activities: (Activity & MinutesAgo)[]): number {
	// Calculate ISF (Insulin Sensitivity Factor) adjustment based on physical activity
	// Compare steps from last 4 hours against:
	// 1. Average steps/4hours from previous week
	// 2. Default baseline of 1500 steps/4h (assuming 6000 steps/16 active hours)

	// Calculate average daily steps from previous 7 days (7 * 1440 minutes)
	const WEEK_IN_MINUTES = 10080;
	const previousWeekSteps = activities.filter((e) => e.minutesAgo <= WEEK_IN_MINUTES && e.steps > -1);
	const totalWeeklySteps = previousWeekSteps.reduce((total, curr) => total + curr.steps, 0);

	logger.debug('Weekly step metrics:', {
		totalSteps: totalWeeklySteps,
		dailyAverage: Math.round(totalWeeklySteps / 7),
	});

	// Calculate 4-hour average, with minimum threshold of 1500 steps
	const MIN_FOUR_HOUR_STEPS = 1500;
	const avgFourHourSteps = Math.max(Math.round(totalWeeklySteps / (7 * 4)), MIN_FOUR_HOUR_STEPS);
	logger.debug('4-hour average steps:', { avgFourHourSteps });

	// Calculate steps from last 4 hours
	const FOUR_HOURS_IN_MINUTES = 240;
	const recentActivities = activities.filter((e) => e.minutesAgo <= FOUR_HOURS_IN_MINUTES && e.steps > -1);
	const recentSteps = recentActivities.reduce((total, curr) => total + curr.steps, 0);
	logger.debug('Recent 4-hour steps:', { recentSteps });

	const stepRatio = recentSteps / avgFourHourSteps;
	let isfAdjustment = 0;

	// Calculate ISF adjustment:
	// - No effect if current steps are below or equal to average
	// - Linear increase based on ratio if above average
	if (stepRatio > 1) {
		isfAdjustment = stepRatio / 6;
		// Examples:
		// stepRatio 1.8 → adjustment = 0.30 (30% increase)
		// stepRatio 3.0 → adjustment = 0.50 (50% increase)
	}

	logger.debug('Steps effect on ISF:', { stepRatio, isfAdjustment });
	return isfAdjustment;
}

export function physicalStepsLiver(activities: (Activity & MinutesAgo)[]): number {
	// Calculate liver EGP (Endogenous Glucose Production) adjustment
	// Currently assuming steps have no effect on liver glucose production
	const liverAdjustment = 0;
	logger.debug('Steps effect on liver EGP:', { liverAdjustment });
	return liverAdjustment;
}
