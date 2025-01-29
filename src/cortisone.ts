import { TreatmentExpParam, NSTreatmentParsed } from './Types';
import { getTreatmentExpParam } from './drug';
import logger, { getExpTreatmentActivity, roundTo8Decimals } from './utils';

/**
 * Calculates the total activity of cortisone treatments
 * @param treatments - Array of treatment parameters with exponential decay
 * @returns Total activity in U/min
 */
const calculateCortisoneActivity = (treatments: TreatmentExpParam[]): number => {
	// expressed U/min !!!
	return treatments
		.map(getExpTreatmentActivity)
		.reduce((totalActivity, currentActivity) => totalActivity + currentActivity, 0);
};

/**
 * Calculates the final cortisone activity based on treatments and patient weight
 * @param treatments - Array of parsed treatments
 * @param weightKg - Patient weight in kg
 * @returns Final cortisone activity (halved and rounded to 8 decimal places)
 */
export default function calculateFinalCortisoneActivity(treatments: NSTreatmentParsed[], weightKg: number): number {
	// Get cortisone treatments and calculate their activity
	const recentCortisoneTreatments = getTreatmentExpParam(treatments, weightKg, 'COR');
	const cortisoneActivity =
		recentCortisoneTreatments.length > 0 ? calculateCortisoneActivity(recentCortisoneTreatments) : 0;
	logger.debug('Recent cortisone treatments:', {
		treatments: recentCortisoneTreatments,
		activity: cortisoneActivity,
	});

	// Return the final activity (halved and rounded)
	return roundTo8Decimals(cortisoneActivity / 2);
}
