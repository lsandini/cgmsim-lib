import { TreatmentBiexpParam, NSTreatmentParsed } from './Types';
import { getTreatmentBiexpParam } from './drug';
import logger, { getBiexpTreatmentActivity, roundTo8Decimals } from './utils';

const computeBasalActivity = (treatments: TreatmentBiexpParam[]) => {
	// expressed U/min !!!
	return treatments
		.map(getBiexpTreatmentActivity)
		.reduce((tot, activity) => tot + activity, 0);
};

export default function (
	treatments: NSTreatmentParsed[],
	weight: number,
): number {
	const lastGLA = getTreatmentBiexpParam(treatments, weight, 'GLA');
	const activityGLA = lastGLA.length ? computeBasalActivity(lastGLA) : 0;
	logger.debug('these are the last GLA: %o', { lastGLA, activityGLA });

	const lastDET = getTreatmentBiexpParam(treatments, weight, 'DET');
	const activityDET = lastDET.length ? computeBasalActivity(lastDET) : 0;
	logger.debug('these are the last DET: %o', { lastDET, activityDET });

	const lastTOU = getTreatmentBiexpParam(treatments, weight, 'TOU');
	const activityTOU = lastTOU.length ? computeBasalActivity(lastTOU) : 0;
	logger.debug('these are the last TOU: %o', { lastTOU, activityTOU });

	const lastDEG = getTreatmentBiexpParam(treatments, weight, 'DEG');
	const activityDEG = lastDEG.length ? computeBasalActivity(lastDEG) : 0;
	logger.debug('these are the last DEG: %o', { lastDEG, activityDEG });

	const lastNPH = getTreatmentBiexpParam(treatments, weight, 'NPH');
	const activityNPH = lastNPH.length ? computeBasalActivity(lastNPH) : 0;
	logger.debug('these are the last NPH: %o', { lastNPH, activityNPH });

	return roundTo8Decimals(
		activityDEG + activityDET + activityGLA + activityTOU + activityNPH,
	);
}
