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

// Type definitions
interface ActivityWithTime extends Activity {
	minutesAgo: number;
}

/**
 * Enhances activity data with time information
 * @param activities - Raw activity data
 * @returns Activities with added time information
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
 * @param activities - Physical activity data array containing heart rate and timestamp
 * @param age - User's age for max heart rate calculation
 * @param gender - User's gender for max heart rate calculation
 * @returns Current intensity of physical activity as a percentage (0-100)
 */
export function currentIntensity(activities: Activity[], age: number, gender: GenderType): number {
	if (!activities?.length) {
		return ACTIVITY_CONSTANTS.DEFAULT_INTENSITY;
	}

	const maxHr = getMaxHr(age, gender);
	const activitiesWithTime = addTimeToActivities(activities);

	const intensity = physicalHeartIntensity(activitiesWithTime, maxHr);
	return intensity ?? ACTIVITY_CONSTANTS.DEFAULT_INTENSITY;
}

/**
 * Calculates insulin sensitivity factor based on physical activity.
 * Compares heart rate and steps data to determine the most significant impact.
 * @param activities - Array of physical activities with heart rate and steps
 * @param age - User's age for calculations
 * @param gender - User's gender for calculations
 * @returns The higher insulin sensitivity factor between heart rate and steps calculations
 */
export function physicalIsf(activities: Activity[], age: number, gender: GenderType): number {
	const maxHr = getMaxHr(age, gender);
	const activitiesWithTime = addTimeToActivities(activities);

	// Calculate ISF using both methods
	const hrIsf = physicalHeartRateIsf(activitiesWithTime, maxHr);
	const stepIsf = physicalStepsIsf(activitiesWithTime);

	// Determine which method provided higher ISF
	if (hrIsf > stepIsf) {
		logger.info(`@@@ USING HeartRate for ISF:, %o`, hrIsf);
	} else {
		logger.info(`@@@ USING Steps for ISF:, %o`, stepIsf);
	}

	return Math.max(hrIsf, stepIsf);
}

/**
 * Calculates liver glucose production factor based on physical activity.
 * Compares heart rate and steps data to determine the strongest impact on liver glucose production.
 * @param activities - Array of physical activities with heart rate and steps
 * @param age - User's age for calculations
 * @param gender - User's gender for calculations
 * @returns The higher liver glucose production factor between heart rate and steps calculations
 */
export function physicalLiver(activities: Activity[], age: number, gender: GenderType): number {
	const maxHr = getMaxHr(age, gender);
	const activitiesWithTime = addTimeToActivities(activities);

	return Math.max(physicalHeartRateLiver(activitiesWithTime, maxHr), physicalStepsLiver(activitiesWithTime));
}
