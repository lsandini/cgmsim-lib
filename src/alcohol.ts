import { TreatmentExpParam, NSTreatmentParsed, GenderType } from './Types';
import { getTreatmentExpParam } from './drug';
import logger, { getExpTreatmentActivity, roundTo8Decimals } from './utils';

/**
 * Calculates the alcohol activity based on various parameters
 * @param gender - Patient's gender
 * @param weightKg - Patient's weight
 * @param peak - Peak value of alcohol concentration
 * @param duration - Duration of alcohol effect
 * @param minutesAgo - Time elapsed since consumption in minutes
 * @param units - Number of alcohol units consumed
 * @returns Calculated alcohol activity
 */
function calculateAlcoholActivity(
	gender: 'Male' | 'Female',
	weightKg: number,
	peak: number,
	duration: number,
	minutesAgo: number,
	units: number,
): number {
	// Constants for alcohol metabolism
	const peakAlcoholMinutes = 60; // Time to reach peak alcohol concentration in minutes
	const genderConstant = gender === 'Male' ? 0.68 : 0.55; // Widmark formula constant
	const eliminationRate = gender === 'Male' ? 0.016 / 60 : 0.018 / 60; // Alcohol elimination rate in g/100ml/min

	// Calculate peak alcohol concentration using Widmark formula
	const peakConcentration = (units / (weightKg * 1000 * genderConstant)) * 100; // g/100ml

	// Calculate total washout duration
	const washoutDuration = peakAlcoholMinutes + peakConcentration / eliminationRate; // minutes

	// Weight-adjusted units for standardization
	const weightAdjustedUnits = units * (80 / weightKg);

	if (washoutDuration < minutesAgo) {
		return (
			getExpTreatmentActivity({
				peak,
				duration,
				minutesAgo: minutesAgo - washoutDuration,
				units: weightAdjustedUnits,
			}) / 0.35
		);
	}
	return 0;
}

/**
 * Computes the total alcohol activity for multiple treatments
 * @param treatments - Array of treatment parameters
 * @param weightKg - Patient's weight
 * @param gender - Patient's gender
 * @returns Total alcohol activity
 */
const calculateTotalAlcoholActivity = (
	treatments: TreatmentExpParam[],
	weightKg: number,
	gender: GenderType,
): number => {
	const treatmentActivities = treatments.map((treatment) => {
		return calculateAlcoholActivity(
			gender,
			weightKg,
			treatment.peak,
			treatment.duration,
			treatment.minutesAgo,
			treatment.units,
		);
	});

	logger.debug('Individual alcohol activities: %o', treatmentActivities);

	return treatmentActivities.reduce((total, activity) => total + activity, 0);
};

/**
 * Main function to calculate total alcohol activity from different sources (ALC and BEER)
 * @param treatments - Array of parsed treatments
 * @param weightKg - Patient's weight
 * @param gender - Patient's gender
 * @returns Combined alcohol activity from all sources
 */
export default function calculateTotalActivity(
	treatments: NSTreatmentParsed[],
	weightKg: number,
	gender: GenderType,
): number {
	// Calculate activity from alcohol treatments
	const alcoholTreatments = getTreatmentExpParam(treatments, weightKg, 'ALC');
	const alcoholActivity =
		alcoholTreatments.length > 0 ? calculateTotalAlcoholActivity(alcoholTreatments, weightKg, gender) : 0;
	logger.debug('Alcohol treatments and activity: %o', {
		alcoholTreatments,
		alcoholActivity,
	});

	// Calculate activity from beer treatments
	const beerTreatments = getTreatmentExpParam(treatments, weightKg, 'BEER');
	const beerActivity = beerTreatments.length > 0 ? calculateTotalAlcoholActivity(beerTreatments, weightKg, gender) : 0;
	logger.debug('Beer treatments and activity: %o', {
		beerTreatments,
		beerActivity,
	});

	return 1 - roundTo8Decimals(alcoholActivity + beerActivity);
}
