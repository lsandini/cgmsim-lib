import { getMaxHr, physicalHeartIntensity, physicalHeartRateIsf, physicalHeartRateLiver } from './heartRate';
import { physicalStepsIsf, physicalStepsLiver } from './steps';
import { Activity, GenderType } from './types';
import logger from './logger';
import { getDeltaMinutes } from './utils';

const ACTIVITY_CONSTANTS = {
	DEFAULT_INTENSITY: 0,
	TIME_WINDOW_MINUTES: 360,
	MIN_ACTIVITY_THRESHOLD: 0,
} as const;

interface ActivityWithTime extends Activity {
	minutesAgo: number;
}

function addTimeToActivities(activities: Activity[]): ActivityWithTime[] {
	return activities.map((activity) => ({
		...activity,
		minutesAgo: getDeltaMinutes(activity.created_at),
	}));
}

export function currentIntensity(activities: Activity[], age: number, gender: GenderType | 'male' | 'female'): number {
	if (!activities?.length) {
		return ACTIVITY_CONSTANTS.DEFAULT_INTENSITY;
	}

	const maxHeartRate = getMaxHr(age, gender);
	const activitiesWithTime = addTimeToActivities(activities);

	const intensity = physicalHeartIntensity(activitiesWithTime, maxHeartRate);
	return intensity ?? ACTIVITY_CONSTANTS.DEFAULT_INTENSITY;
}

export function physicalIsf(activities: Activity[], age: number, gender: GenderType | 'male' | 'female'): number {
	const maxHeartRate = getMaxHr(age, gender);
	const activitiesWithTime = addTimeToActivities(activities);

	const heartRateIsf = physicalHeartRateIsf(activitiesWithTime, maxHeartRate);
	const stepsIsf = physicalStepsIsf(activitiesWithTime);

	logger.info('[physical] Heart rate ISF calculation used: %d', heartRateIsf);
	logger.info('[physical] Steps ISF calculation used: %d', stepsIsf);

	return 1 + Math.max(heartRateIsf, stepsIsf);
}

export function physicalLiver(activities: Activity[], age: number, gender: GenderType | 'male' | 'female'): number {
	const maxHeartRate = getMaxHr(age, gender);
	const activitiesWithTime = addTimeToActivities(activities);

	return 1 + Math.max(physicalHeartRateLiver(activitiesWithTime, maxHeartRate), physicalStepsLiver(activitiesWithTime));
}
