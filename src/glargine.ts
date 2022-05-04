import  { Activity } from './utils';
import logger from './utils';
import { TreatmentDelta } from './Types';

//const logger = pino();

export default function (weight: number, glargines: Pick<TreatmentDelta, 'minutesAgo' | 'insulin'>[]): number {
	// const jsongla = JSON.stringify(glargines);
	// const glargines = JSON.parseWithDate(jsongla);
	logger.info(glargines);

	// activities be expressed as U/min !!!
	const timeSinceGlargineAct = glargines.map(entry => {
		const hoursAgo = entry.minutesAgo / 60;
		const insulin = entry.insulin;
		const duration = (22 + (12 * insulin / weight));
		const peak = (duration / 2.5);
		const { activity } = Activity(peak, duration, hoursAgo, insulin);

		return {
			hoursAgo,
			glargineActivity: activity
		};
	});
	logger.info('the is the accumulated glargine activity:', timeSinceGlargineAct);

	// compute the aggregated activity of last glargines in 27 hours

	const lastGlargines = timeSinceGlargineAct.filter((e) => e.hoursAgo <= 30);
	logger.info('these are the last glargines and activities:', lastGlargines);

	const resultGlaAct = lastGlargines.reduce(function (tot, arr) {
		return tot + arr.glargineActivity;
	}, 0);

	logger.info(resultGlaAct);

	return resultGlaAct;
}


