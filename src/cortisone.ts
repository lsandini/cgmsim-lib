import { TreatmentDelta, Treatment } from './Types';
import logger, { getDeltaMinutes, getInsulinActivity } from './utils';

export const peakCortisone = {
	COR: (duration: number) => duration / 2.5,
};
export const durationCortisone = {
	COR: (insulin: number, weight: number) => (16 + (12 * insulin) / weight) * 60,
};

export const computeCortisoneActivity = (
	treatments: (TreatmentDelta & { duration: number; peak: number })[]
) => {
	// activities be expressed as U/min !!!
	const treatmentsActivity = treatments.map((e) => {
		const minutesAgo = e.minutesAgo;
		const insulin = e.insulin;
		const activity = getInsulinActivity(
			e.peak,
			e.duration,
			minutesAgo,
			insulin
		);
		return activity;
	});
	logger.debug('these are the last Slow INSULINS: %o', treatmentsActivity);
	const resultAct = treatmentsActivity.reduce((tot, activity) => {
		return tot + activity;
	}, 0);
	return resultAct;
};

export default function (treatments: Treatment[], weight: number): number {
	//Find Cortisone boluses
	const Cortisones =
		treatments && treatments.length
			? treatments
					.filter((e) => e.notes)
					.map((e) => {
						const lastIndexEmptySpace = e.notes.lastIndexOf(' ');
						logger.debug(
							'cortisone %o',
							parseInt(e.notes.slice(lastIndexEmptySpace), 10)
						);
						return {
							...e,
							minutesAgo: getDeltaMinutes(e.created_at),
							drug: e.notes.slice(0, 3),
							// insulin: parseInt(e.notes.slice(-2))
							insulin: parseInt(e.notes.slice(lastIndexEmptySpace), 10) || 0,
						};
					})
					.filter((e) => e.minutesAgo >= 0)
			: [];

	const lastCortisones = Cortisones.filter(function (e) {
		return e.minutesAgo <= 45 * 60; // keep only the Cortisones from the last 45 hours
	});


	const lastCOR = lastCortisones
		.filter((e) => {
			return (
				e.drug === 'pre' ||
				e.drug === 'Pre' ||
				e.drug === 'cor' ||
				e.drug === 'Cor'
			); // keep only the Cortisonees from the last 45 hours
		})
		.map((e) => {
			const duration = durationCortisone.COR(e.insulin, weight);
			const peak = peakCortisone.COR(duration);
			return {
				...e,
				duration,
				peak,
			};
		});
	const activityCOR = lastCOR.length > 0 ? computeCortisoneActivity(lastCOR) : 0;
	logger.debug('these are the last COR: %o', { lastCOR, activityCOR });

	return  (activityCOR/2);
}
