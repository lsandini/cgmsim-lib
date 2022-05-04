import logger from './utils';
import { TreatmentDelta } from './Types';
import { Activity } from './utils';

//const logger = pino();

export default function (weight, tou: Pick<TreatmentDelta, 'insulin' | 'minutesAgo'>[]): number {

	logger.info(tou);

	// activities be expressed as U/min !!!
	const timeSinceToujeoAct = tou.map(entry => {
		const hoursAgo = entry.minutesAgo / 60;

		const insulin = entry.insulin;
		const duration = (24 + (14 * insulin / weight));
		const peak = (duration / 2.5);
		const { activity } = Activity(peak, duration, hoursAgo, insulin);

		return {
			hoursAgo,
			toujeoActivity: activity
		};
	});
	logger.info('the is the accumulated toujeo activity:', timeSinceToujeoAct);

	// compute the aggregated activity of last toujeos in 27 hours

	const lastToujeos = timeSinceToujeoAct.filter((e) => e.hoursAgo <= 30);
	logger.info('these are the last toujeos and activities:', lastToujeos);

	const resultTouAct = lastToujeos.reduce(function (tot, arr) {
		return tot + arr.toujeoActivity;
	}, 0);

	logger.info(resultTouAct);

	return resultTouAct;
}