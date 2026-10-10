import logger from './logger';
import { getDeltaMinutes, getExpTreatmentActivity, getExpTreatmentIOB, roundTo8Decimals } from './utils';
import { CoreTreatment, NSTreatment, TreatmentExpParam, isMealBolusTreatment } from './types';

/**
 * Normalizes treatments to have insulin amount and minutesAgo
 */
function getActiveBolusTreatments(
	treatments: (NSTreatment | CoreTreatment)[],
): { minutesAgo: number; insulin: number }[] {
	if (!treatments || !Array.isArray(treatments)) {
		return [];
	}

	return treatments
		.filter((treatment) => {
			if ('eventType' in treatment) {
				return isMealBolusTreatment(treatment) && (treatment.insulin ?? 0) > 0;
			}
			return (treatment.type === 'bolus' || treatment.type === 'Meal Bolus') && (treatment.units ?? 0) > 0;
		})
		.map((treatment) => {
			const time = 'created_at' in treatment ? treatment.created_at : treatment.timestamp;
			const insulin = 'insulin' in treatment ? treatment.insulin ?? 0 : 'units' in treatment ? treatment.units ?? 0 : 0;
			return {
				minutesAgo: getDeltaMinutes(time),
				insulin,
			};
		})
		.filter((bolus) => bolus.minutesAgo <= 300 && bolus.minutesAgo >= 0);
}

/**
 * Calculates the total active bolus insulin
 * @param treatments - Array of insulin treatments
 * @param dia - Duration of Insulin Action in hours
 * @param peak - Time to peak insulin activity in minutes
 * @returns Total active bolus insulin in Units
 */
export default function calculateBolusActivity(
	treatments: (NSTreatment | CoreTreatment)[],
	dia: number,
	peak: number,
): number {
	const activeBolusInsulin = getActiveBolusTreatments(treatments);

	logger.debug('[bolus] Active bolus treatments:', activeBolusInsulin);
	logger.debug('[bolus] Number of active boluses:', activeBolusInsulin.length);

	const durationInMinutes = dia * 60;

	const bolusActivities = activeBolusInsulin.map((bolus) => {
		return getExpTreatmentActivity({
			peak,
			duration: durationInMinutes,
			minutesAgo: bolus.minutesAgo,
			units: bolus.insulin,
		});
	});

	logger.debug('[bolus] Individual bolus activities:', bolusActivities);

	const totalBolusActivity = bolusActivities.reduce((total, activity) => total + activity, 0);

	logger.debug('[bolus] Total bolus insulin activity:', totalBolusActivity);
	return roundTo8Decimals(totalBolusActivity);
}

/**
 * Calculates total active bolus insulin on board (IOB)
 * @param treatments - Array of insulin treatments
 * @param dia - Duration of Insulin Action in hours
 * @param peak - Time to peak insulin activity in minutes
 * @returns Total IOB in Units
 */
export function calculateBolusIOB(treatments: (NSTreatment | CoreTreatment)[], dia: number, peak: number): number {
	const activeBolusInsulin = getActiveBolusTreatments(treatments);

	logger.debug('[bolus] Active bolus treatments for IOB:', activeBolusInsulin);

	const durationInMinutes = dia * 60;

	const bolusIOBs = activeBolusInsulin.map((bolus) => {
		return getExpTreatmentIOB({
			peak,
			duration: durationInMinutes,
			minutesAgo: bolus.minutesAgo,
			units: bolus.insulin,
		});
	});

	logger.debug('[bolus] Individual bolus IOBs:', bolusIOBs);

	const totalBolusIOB = bolusIOBs.reduce((total, iob) => total + iob, 0);

	logger.debug('[bolus] Total bolus insulin IOB:', totalBolusIOB);
	return roundTo8Decimals(totalBolusIOB);
}

/**
 * Clean alias for calculateBolusIOB and single treatment exponential IOB calculation.
 */
export function calculateExponentialIOB(
	treatmentsOrParams: (NSTreatment | CoreTreatment)[] | TreatmentExpParam,
	dia?: number,
	peak?: number,
): number {
	if (Array.isArray(treatmentsOrParams)) {
		return calculateBolusIOB(treatmentsOrParams, dia ?? 5, peak ?? 75);
	}
	return getExpTreatmentIOB(treatmentsOrParams);
}
