import logger, {
	getDeltaMinutes,
	getBiexpTreatmentActivity,
	roundTo8Decimals,
} from './utils';
import { NSTreatment, isMealBolusTreatment } from './Types';

export default (
	treatments: NSTreatment[] = [],
	dia: number,
	peak: number,
): number => {
	const insulin = treatments
		?.filter(isMealBolusTreatment)
		.filter((e) => e?.insulin > 0)
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
		return getBiexpTreatmentActivity({
			peak,
			duration,
			minutesAgo: entry.minutesAgo,
			units,
		});
	});

	logger.debug(
		'these are the last insulins and activities: %o',
		insulinsBolusAct,
	);

	const bolusAct = insulinsBolusAct.reduce(
		(tot, activity) => tot + activity,
		0,
	);
	logger.debug('these are the insulins bolus activity: %o', bolusAct);
	return roundTo8Decimals(bolusAct);
};
