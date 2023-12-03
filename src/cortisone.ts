import { TreatmentDelta, Treatment, TreatmentDrug } from './Types';
import { getDrugActivity } from './drug';
import logger, { getDeltaMinutes, getTreatmentActivity } from './utils';

export const peakCortisone = {
	COR: (duration: number) => duration / 3,
};
export const durationCortisone = {
	COR: (insulin: number, weight: number) => (16 + (12 * insulin) / weight) * 60,
};

export const computeCortisoneActivity = (treatments: TreatmentDelta[]) => {
	// activities be expressed as U/min !!!
	const treatmentsActivity = treatments.map((e) => {
		const minutesAgo = e.minutesAgo;
		const units = e.units;
		const activity = getTreatmentActivity(
			e.peak,
			e.duration,
			minutesAgo,
			units
		);
		return activity;
	});
	logger.debug('these are the last Slow INSULINS: %o', treatmentsActivity);
	const resultAct = treatmentsActivity.reduce((tot, activity) => {
		return tot + activity;
	}, 0);
	return resultAct;
};

export default function (treatments: TreatmentDrug[], weight: number): number {
	//Find Cortisone boluses

	const lastCOR = getDrugActivity(treatments, weight, 'COR');
	const activityCOR =
		lastCOR.length > 0 ? computeCortisoneActivity(lastCOR) : 0;
	logger.debug('these are the last COR: %o', { lastCOR, activityCOR });

	return activityCOR / 2;
}
