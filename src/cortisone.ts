import { TreatmentExpParam, NSTreatment, NSTreatmentParsed } from './Types';
import { getTreatmentExpParam } from './drug';
import logger, { getExpTreatmentActivity, roundTo8Decimals } from './utils';

const computeCortisoneActivity = (treatments: TreatmentExpParam[]) => {
	// expressed U/min !!!
	return treatments
		.map(getExpTreatmentActivity)
		.reduce((tot, activity) => tot + activity, 0);
};

export default function (
	treatments: NSTreatmentParsed[],
	weight: number,
): number {
	//Find Cortisone boluses
	const lastCOR = getTreatmentExpParam(treatments, weight, 'COR');
	const activityCOR =
		lastCOR.length > 0 ? computeCortisoneActivity(lastCOR) : 0;
	logger.debug('these are the last COR: %o', { lastCOR, activityCOR });

	return roundTo8Decimals(activityCOR / 2);
}
