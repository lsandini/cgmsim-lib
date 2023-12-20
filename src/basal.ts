import { TreatmentDelta, TreatmentDrug } from './Types';
import { getDrugActivity } from './drug';
import logger, { getTreatmentActivity } from './utils';

export const computeBasalActivity = (treatments: TreatmentDelta[]) => {
	// activities be expressed as U/min !!!
	const treatmentsActivity = treatments.map((e) => {
		const activity = getTreatmentActivity(
			e.peak,
			e.duration,
			e.minutesAgo,
			e.units,
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
	const lastGLA = getDrugActivity(treatments, weight, 'GLA');
	const activityGLA = lastGLA.length > 0 ? computeBasalActivity(lastGLA) : 0;
	logger.debug('these are the last GLA: %o', { lastGLA, activityGLA });

	const lastDET = getDrugActivity(treatments, weight, 'DET');
	const activityDET = lastDET.length ? computeBasalActivity(lastDET) : 0;
	logger.debug('these are the last DET: %o', { lastDET, activityDET });

	const lastTOU = getDrugActivity(treatments, weight, 'TOU');
	const activityTOU = lastTOU.length ? computeBasalActivity(lastTOU) : 0;
	logger.debug('these are the last TOU: %o', { lastTOU, activityTOU });

	const lastDEG = getDrugActivity(treatments, weight, 'DEG');
	const activityDEG = lastDEG.length ? computeBasalActivity(lastDEG) : 0;
	logger.debug('these are the last DEG: %o', { lastDEG, activityDEG });

  const lastNPH = getDrugActivity(treatments, weight, 'NPH');
	const activityNPH = lastNPH.length ? computeBasalActivity(lastNPH) : 0;
	logger.debug('these are the last NPH: %o', { lastNPH, activityNPH });

	return activityDEG + activityDET + activityGLA + activityTOU + activityNPH;
}
