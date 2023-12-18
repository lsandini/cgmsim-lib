import { TreatmentDelta, Treatment, TreatmentDrug, GenderType } from './Types';
import { getDrugActivity } from './drug';
import logger, { getDeltaMinutes, getTreatmentActivity } from './utils';

function getAlcoholActivity(
	gender: 'Male' | 'Female',
	weightKg: number,
	peakMin: number,
	durationMin: number,
	timeMin: number, //minutesAgo
	units: number,
): number {
	const peakAlcoholAmountMin = 60; //min
	const r = gender === 'Male' ? 0.68 : 0.55;
	const eliminationRate = gender === 'Male' ? 0.016 / 60 : 0.018 / 60; //g/100ml/min
	const peakAmount = ((units * 12) / (weightKg * 1000 * r)) * 100; //g/100ml
	const washoutDuration = peakAlcoholAmountMin + peakAmount / eliminationRate; //min
	const unitsWeighted = units * 12 * (80 / weightKg);
	if (washoutDuration < timeMin) {
		return (
			getTreatmentActivity(
				peakMin,
				durationMin,
				timeMin - washoutDuration,
				unitsWeighted,
			) / 35
		);
	}
	return 0;
}

export const computeAlcoholActivity = (
	treatments: TreatmentDelta[],
	weight: number,
	gender: GenderType,
) => {
	const treatmentsActivity = treatments.map((e) => {
		const minutesAgo = e.minutesAgo;
		const units = e.units;
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
	treatments: TreatmentDrug[],
	weight: number,
	gender: GenderType,
): number {
	//Find Alcohol boluses

	const lastALC = getDrugActivity(treatments, weight, 'ALC');
	const activityALC =
		lastALC.length > 0 ? computeAlcoholActivity(lastALC, weight, gender) : 0;
	logger.debug('these are the last ALC: %o', { lastALC, activityALC });

	return activityALC / 2;
}
