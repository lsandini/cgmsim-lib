/**
 * @fileoverview Physical activity calculations and analysis module
 * Handles heart rate and steps data to determine activity intensity,
 * insulin sensitivity, and liver glucose production factors.
 */

// Import necessary functions and types
import { getMaxHr, physicalHeartIntensity, physicalHeartRateIsf, physicalHeartRateLiver } from './heartRate';
import { physicalStepsIsf, physicalStepsLiver } from './steps';
import { Activity, GenderType } from './Types';
import logger, { getDeltaMinutes } from './utils';

// Constants for activity calculations
const ACTIVITY_CONSTANTS = {
	DEFAULT_INTENSITY: 0,
	TIME_WINDOW_MINUTES: 360, // 6 hours
	MIN_ACTIVITY_THRESHOLD: 0,
} as const;

// Type definitions for activities with time information
interface ActivityWithTime extends Activity {
	minutesAgo: number;
}

/**
 * Adds time information to each activity
 * @param activities - Array of raw activity data
 * @returns Array of activities with added time information
 */
function addTimeToActivities(activities: Activity[]): ActivityWithTime[] {
	return activities.map((activity) => ({
		...activity,
		minutesAgo: getDeltaMinutes(activity.created_at),
	}));
}

/**
 * Calculates the current intensity of physical activity based on user parameters.
 * This function combines heart rate data to determine activity intensity level.
 * @param activities - Array of physical activity data containing heart rate and timestamp
 * @param age - Patient's age
 * @param gender - Patient's gender
 * @returns Current intensity of physical activity as a percentage (0-100)
 */
export function currentIntensity(activities: Activity[], age: number, gender: GenderType): number {
	if (!activities?.length) {
		return ACTIVITY_CONSTANTS.DEFAULT_INTENSITY;
	}

	const maxHeartRate = getMaxHr(age, gender);
	const activitiesWithTime = addTimeToActivities(activities);

	const intensity = physicalHeartIntensity(activitiesWithTime, maxHeartRate);
	return intensity ?? ACTIVITY_CONSTANTS.DEFAULT_INTENSITY;
}

/**
 * Calculates insulin sensitivity factor based on physical activity.
 * Compares heart rate and steps data to determine the most significant impact.
 * @param activities - Array of physical activities with heart rate and steps
 * @param age - Patient's age
 * @param gender - Patient's gender
 * @returns The higher insulin sensitivity factor between heart rate and steps calculations
 */
export function physicalIsf(activities: Activity[], age: number, gender: GenderType): number {
	const maxHeartRate = getMaxHr(age, gender);
	const activitiesWithTime = addTimeToActivities(activities);

	const heartRateIsf = physicalHeartRateIsf(activitiesWithTime, maxHeartRate);
	const stepsIsf = physicalStepsIsf(activitiesWithTime);

	if (heartRateIsf > stepsIsf) {
		logger.info('[Physical Activity] Heart rate ISF calculation used: %d', heartRateIsf);
	} else {
		logger.info('[Physical Activity] Steps ISF calculation used: %d', stepsIsf);
	}

	return 1 + Math.max(heartRateIsf, stepsIsf);
}

/**
 * Calculates liver glucose production factor based on physical activity.
 * Compares heart rate and steps data to determine the strongest impact on liver glucose production.
 * @param activities - Array of physical activities with heart rate and steps
 * @param age - Patient's age
 * @param gender - Patient's gender
 * @returns The higher liver glucose production factor between heart rate and steps calculations
 */
export function physicalLiver(activities: Activity[], age: number, gender: GenderType): number {
	const maxHeartRate = getMaxHr(age, gender);
	const activitiesWithTime = addTimeToActivities(activities);

	return 1 + Math.max(physicalHeartRateLiver(activitiesWithTime, maxHeartRate), physicalStepsLiver(activitiesWithTime));
}
