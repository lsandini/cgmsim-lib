import logger, { getDeltaMinutes, getExpTreatmentActivity, roundTo8Decimals } from './utils';
import { NSTreatment, isMealBolusTreatment } from './Types';

/**
 * Calculates the total active bolus insulin
 * @param treatments - Array of insulin treatments
 * @param dia - Duration of Insulin Action in hours
 * @param peak - Time to peak insulin activity in minutes
 * @returns Total active bolus insulin in Units
 */
export default (treatments: NSTreatment[], dia: number, peak: number): number => {
	// Filter for active meal boluses in the last 5 hours
	const activeBolusInsulin =
		treatments
			?.filter(isMealBolusTreatment)
			.filter((treatment) => treatment?.insulin > 0)
			.map((treatment) => ({
				minutesAgo: getDeltaMinutes(treatment.created_at),
				insulin: treatment.insulin,
			}))
			.filter((bolus) => bolus.minutesAgo <= 300 && bolus.minutesAgo >= 0) || [];

	logger.debug('[bolus] Active bolus treatments:', activeBolusInsulin);
	logger.debug('[bolus] Number of active boluses:', activeBolusInsulin.length);

	// Convert DIA from hours to minutes
	const durationInMinutes = dia * 60;

	// Calculate activity for each active bolus
	const bolusActivities = activeBolusInsulin?.map((bolus) => {
		return getExpTreatmentActivity({
			peak,
			duration: durationInMinutes,
			minutesAgo: bolus.minutesAgo,
			units: bolus.insulin,
		});
	});

	logger.debug('[bolus] Individual bolus activities:', bolusActivities);

	// Sum all bolus activities
	const totalBolusActivity = bolusActivities.reduce((total, activity) => total + activity, 0);

	logger.debug('[bolus] Total bolus insulin activity:', totalBolusActivity);
	return roundTo8Decimals(totalBolusActivity);
};
