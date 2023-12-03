import logger, { getDeltaMinutes, getTreatmentActivity } from './utils';
import { Treatment } from './Types';

export default (
	treatments: Treatment[] = [],
	dia: number,
	peak: number
): number => {
	const insulin = treatments
		?.filter((e) => e.insulin)
		.map((e) => ({
			minutesAgo: getDeltaMinutes(e.created_at),
			insulin: e.insulin,
		}))
		.filter((e) => e.minutesAgo <= 300 && e.minutesAgo >= 0);

	logger.debug('this is the filtered treatments (insulin): %o', insulin);
	logger.debug('length %o', insulin.length); // returns the number of boluses or length of the array

	// dia is the duration of insulin action in hours
	const duration = dia * 60;

	const insulinsBolusAct = insulin?.map((entry) => {
		const units = entry.insulin;
		return getTreatmentActivity(peak, duration, entry.minutesAgo, units);
	});

	logger.debug(
		'these are the last insulins and activities: %o',
		insulinsBolusAct
	);

	const bolusAct = insulinsBolusAct.reduce(
		(tot, activity) => tot + activity,
		0
	);
	logger.debug('these are the insulins bolus activity: %o', bolusAct);
	return bolusAct;
};
