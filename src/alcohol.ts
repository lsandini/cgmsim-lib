import {
	TreatmentBiexpParam,
	NSTreatment,
	NSTreatmentParsed,
	GenderType,
} from './Types';
import { getTreatmentBiexpParam } from './drug';
import logger, {
	getDeltaMinutes,
	getBiexpTreatmentActivity,
	roundTo8Decimals,
} from './utils';

function getAlcoholActivity(
	gender: 'Male' | 'Female',
	weightKg: number,
	peak: number,
	duration: number,
	minutesAgo: number, //minutesAgo
	units: number,
): number {
	const peakAlcoholAmountMin = 60; //min
	const r = gender === 'Male' ? 0.68 : 0.55;
	const eliminationRate = gender === 'Male' ? 0.016 / 60 : 0.018 / 60; //g/100ml/min
	const peakAmount = (units / (weightKg * 1000 * r)) * 100; //g/100ml
	const washoutDuration = peakAlcoholAmountMin + peakAmount / eliminationRate; //min
	const unitsWeighted = units * (80 / weightKg);
	if (washoutDuration < minutesAgo) {
		return (
			getBiexpTreatmentActivity({
				peak,
				duration,
				minutesAgo: minutesAgo - washoutDuration,
				units: unitsWeighted,
			}) / 0.35
		);
	}
	return 0;
}

export const computeAlcoholActivity = (
	treatments: TreatmentBiexpParam[],
	weight: number,
	gender: GenderType,
) => {
	const treatmentsActivity = treatments.map((e) => {
		const minutesAgo = e.minutesAgo;
		const units = e.units;
		// TODO rewrite alcoolActivity as %
		const activity = getAlcoholActivity(
			gender,
			weight,
			e.peak,
			e.duration,
			minutesAgo,
			units,
		);
		return activity;
	});
	logger.debug('these are the last Alcohol: %o', treatmentsActivity);
	const resultAct = treatmentsActivity.reduce((tot, activity) => {
		return tot + activity;
	}, 0);
	return resultAct;
};

export default function (
	treatments: NSTreatmentParsed[],
	weight: number,
	gender: GenderType,
): number {
	//Find Alcohol boluses

	const lastALC = getTreatmentBiexpParam(treatments, weight, 'ALC');
	const activityALC =
		lastALC.length > 0 ? computeAlcoholActivity(lastALC, weight, gender) : 0;
	logger.debug('these are the last ALC: %o', { lastALC, activityALC });

	const lastBEER = getTreatmentBiexpParam(treatments, weight, 'BEER');
	const activityBEER =
		lastBEER.length > 0 ? computeAlcoholActivity(lastBEER, weight, gender) : 0;
	logger.debug('these are the last BEER: %o', { lastBEER, activityBEER });

	return roundTo8Decimals(activityALC + activityBEER);
}
