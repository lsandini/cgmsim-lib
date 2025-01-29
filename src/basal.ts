import { TreatmentExpParam, NSTreatmentParsed } from './Types';
import { getTreatmentExpParam } from './drug';
import logger, { getExpTreatmentActivity, roundTo8Decimals } from './utils';

/**
 * Calculates the basal insulin activity per minute for a given set of treatments
 * @param treatments - Array of insulin treatments
 * @returns Total basal activity in Units/minute
 */
const calculateBasalActivityPerMinute = (treatments: TreatmentExpParam[]): number => {
	// Calculate total activity by summing up individual treatment activities
	return treatments.map(getExpTreatmentActivity).reduce((total, activity) => total + activity, 0);
};

/**
 * Calculates the total basal insulin activity from all active insulin types
 * @param treatments - Array of parsed insulin treatments
 * @param weight - Patient's weight
 * @returns Total basal activity in Units/minute, rounded to 8 decimal places
 */
export default function calculateTotalBasalActivity(treatments: NSTreatmentParsed[], weight: number): number {
	// Calculate activity for Glargine insulin
	const lastGlargine = getTreatmentExpParam(treatments, weight, 'GLA');
	const glargineActivity = lastGlargine.length ? calculateBasalActivityPerMinute(lastGlargine) : 0;
	logger.debug('[basal] Glargine insulin activity:', {
		activeGlargineTreatments: lastGlargine,
		totalGlargineActivity: glargineActivity,
	});

	// Calculate activity for Detemir insulin
	const lastDetemir = getTreatmentExpParam(treatments, weight, 'DET');
	const detemirActivity = lastDetemir.length ? calculateBasalActivityPerMinute(lastDetemir) : 0;
	logger.debug('[basal] Detemir insulin activity:', {
		activeDetemirTreatments: lastDetemir,
		totalDetemirActivity: detemirActivity,
	});

	// Calculate activity for Toujeo insulin
	const lastToujeo = getTreatmentExpParam(treatments, weight, 'TOU');
	const toujeoActivity = lastToujeo.length ? calculateBasalActivityPerMinute(lastToujeo) : 0;
	logger.debug('[basal] Toujeo insulin activity:', {
		activeToujeoTreatments: lastToujeo,
		totalToujeoActivity: toujeoActivity,
	});

	// Calculate activity for Degludec insulin
	const lastDegludec = getTreatmentExpParam(treatments, weight, 'DEG');
	const degludecActivity = lastDegludec.length ? calculateBasalActivityPerMinute(lastDegludec) : 0;
	logger.debug('[basal] Degludec insulin activity:', {
		activeDegludecTreatments: lastDegludec,
		totalDegludecActivity: degludecActivity,
	});

	// Calculate activity for NPH insulin
	const lastNPH = getTreatmentExpParam(treatments, weight, 'NPH');
	const nphActivity = lastNPH.length ? calculateBasalActivityPerMinute(lastNPH) : 0;
	logger.debug('[basal] NPH insulin activity:', {
		activeNPHTreatments: lastNPH,
		totalNPHActivity: nphActivity,
	});

	// Sum and round all insulin activities
	return roundTo8Decimals(degludecActivity + detemirActivity + glargineActivity + toujeoActivity + nphActivity);
}
