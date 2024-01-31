import { TreatmentBiexpParam, NSTreatment, NSTreatmentParsed } from './Types';
import { getTreatmentBiexpParam } from './drug';
import getLogger, {
	getBiexpTreatmentActivity,
	roundTo8Decimals,
} from './utils';

const computeCortisoneActivity = (treatments: TreatmentBiexpParam[]) => {
	// expressed U/min !!!
	return treatments
		.map(getBiexpTreatmentActivity)
		.reduce((tot, activity) => tot + activity, 0);
};

export default function (
	treatments: NSTreatmentParsed[],
	weight: number,
): number {
	//Find Cortisone boluses
	const lastCOR = getTreatmentBiexpParam(treatments, weight, 'COR');
	const activityCOR =
		lastCOR.length > 0 ? computeCortisoneActivity(lastCOR) : 0;
	getLogger().debug('these are the last COR: %o', { lastCOR, activityCOR });

	return roundTo8Decimals(activityCOR / 2);
}
