import logger, { getDeltaMinutes, getInsulinActivity } from './utils';
import { Treatment } from './Types';

export default (treatments: Treatment[], dia: number, peak: number): number => {


	const insulin = treatments
		.filter(e => e.insulin)
		.map(e => ({
			minutesAgo: getDeltaMinutes(e.created_at),
			insulin: e.insulin
		}))
		.filter(e =>  e.minutesAgo <= 300);

	logger.debug('this is the filtered treatments (insulin): %o', insulin);
	logger.debug('length %o', insulin.length); // returns the number of boluses or length of the array

	// dia is the duration of insulin action in hours
	const duration = dia * 60;

	const insulinsBolusAct = insulin.map(entry => {
		const insulin = entry.insulin;
		return getInsulinActivity(peak, duration, entry.minutesAgo, insulin);
	});

	
	logger.debug('these are the last insulins and activities: %o', insulinsBolusAct);

	const bolusAct = insulinsBolusAct.reduce((tot, activity) =>tot + activity, 0);
	logger.info('these are the insulins bolus activity: %o', bolusAct);
	return bolusAct;

};