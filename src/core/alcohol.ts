import { TreatmentExpParam, NSTreatmentParsed, GenderType } from './types';
import { getTreatmentExpParam } from './drug';
import logger from './logger';
import { getExpTreatmentActivity, roundTo8Decimals } from './utils';

function calculateAlcoholActivity(
	gender: 'Male' | 'Female' | 'male' | 'female',
	weightKg: number,
	peak: number,
	duration: number,
	minutesAgo: number,
	units: number,
): number {
	const isMale = gender === 'Male' || gender === 'male';
	const peakAlcoholMinutes = 60;
	const genderConstant = isMale ? 0.68 : 0.55;
	const eliminationRate = isMale ? 0.016 / 60 : 0.018 / 60;

	const peakConcentration = (units / (weightKg * 1000 * genderConstant)) * 100;
	const washoutDuration = peakAlcoholMinutes + peakConcentration / eliminationRate;
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

	logger.debug('[alcohol] Individual alcohol activities: %o', treatmentActivities);

	return treatmentActivities.reduce((total, activity) => total + activity, 0);
};

export default function calculateTotalActivity(
	treatments: NSTreatmentParsed[],
	weightKg: number,
	gender: GenderType,
): number {
	const alcoholTreatments = getTreatmentExpParam(treatments, weightKg, 'ALC');
	const alcoholActivity =
		alcoholTreatments.length > 0 ? calculateTotalAlcoholActivity(alcoholTreatments, weightKg, gender) : 0;
	logger.debug('[alcohol] Alcohol treatments and activity: %o', {
		alcoholTreatments,
		alcoholActivity,
	});

	const beerTreatments = getTreatmentExpParam(treatments, weightKg, 'BEER');
	const beerActivity = beerTreatments.length > 0 ? calculateTotalAlcoholActivity(beerTreatments, weightKg, gender) : 0;
	logger.debug('[alcohol] Beer treatments and activity: %o', {
		beerTreatments,
		beerActivity,
	});

	return 1 - roundTo8Decimals(alcoholActivity + beerActivity);
}
