import { Activity } from './Types';
import logger from './utils';

type MinutesAgo = { minutesAgo: number };

// Time constants (in minutes)
const MINUTES_IN_WEEK = 7 * 24 * 60; // 10080 minutes
const PERIODS_PER_DAY = 4; // Number of 4-hour periods
const MINUTES_IN_PERIOD = PERIODS_PER_DAY * 60; // 240 minutes (4 hours)

// Step thresholds
const MIN_STEPS_PER_PERIOD = 1500; // Minimum expected steps per 4 hours
const MIN_VALID_STEPS = -1; // Threshold for valid step count

// Calculation factors
const DAYS_PER_WEEK = 7;
const ISF_ADJUSTMENT_FACTOR = 6; // Divisor for ISF calculation

/**
 * Calculates ISF adjustment based on physical activity (steps)
 * @param activities - Array of activities containing steps data and time information
 * @returns number - ISF adjustment factor (0 = no effect, 0.5 = 50% increase)
 */
export function physicalStepsIsf(activities: (Activity & MinutesAgo)[]): number {
	// Filter activities from the past week
	const previousWeekSteps = activities.filter(
		(activity) => activity.minutesAgo <= MINUTES_IN_WEEK && activity.steps > MIN_VALID_STEPS,
	);
	const totalWeeklySteps = previousWeekSteps.reduce((total, activity) => total + activity.steps, 0);

	logger.debug('[steps] Weekly step metrics:', {
		totalSteps: totalWeeklySteps,
		dailyAverage: Math.round(totalWeeklySteps / DAYS_PER_WEEK),
	});

	// Calculate 4-hour average steps with a minimum threshold
	const avgFourHourSteps = Math.max(
		Math.round(totalWeeklySteps / (DAYS_PER_WEEK * PERIODS_PER_DAY)),
		MIN_STEPS_PER_PERIOD,
	);
	logger.debug('[steps] 4-hour average steps:', { avgFourHourSteps });

	// Calculate steps from the last 4 hours
	const recentActivities = activities.filter(
		(activity) => activity.minutesAgo <= MINUTES_IN_PERIOD && activity.steps > MIN_VALID_STEPS,
	);
	const recentSteps = recentActivities.reduce((total, activity) => total + activity.steps, 0);
	logger.debug('[steps] Recent 4-hour steps:', { recentSteps });

	// Calculate ISF adjustment based on step ratio
	const stepRatio = recentSteps / avgFourHourSteps;
	let isfAdjustment = 0;

	if (stepRatio > 1) {
		isfAdjustment = stepRatio / ISF_ADJUSTMENT_FACTOR;
		// Examples:
		// stepRatio 1.8 → adjustment = 0.30 (30% increase)
		// stepRatio 3.0 → adjustment = 0.50 (50% increase)
	}

	logger.debug('[steps] Steps effect on ISF:', { stepRatio, isfAdjustment });
	return isfAdjustment;
}

/**
 * Calculates liver glucose production adjustment based on steps
 * @param activities - Array of activities containing steps data and time information
 * @returns number - Liver adjustment factor (currently always returns 0)
 */
export function physicalStepsLiver(activities: (Activity & MinutesAgo)[]): number {
	// Calculate liver EGP (Endogenous Glucose Production) adjustment
	// Currently assuming steps have no effect on liver glucose production
	const liverAdjustment = 0;
	logger.debug('Steps effect on liver EGP:', { liverAdjustment });
	return liverAdjustment;
}
