import logger from './utils';
import { TreatmentDelta } from './Types';
import { Activity } from './utils';

//const logger = pino();
export default function (weight: number, detemirs: Pick<TreatmentDelta, 'minutesAgo' | 'insulin'>[]): number {
	logger.info(detemirs);

	// activities be expressed as U/min !!!
	const timeSinceDetemirAct = detemirs.map(entry => {
		const hoursAgo = entry.minutesAgo / 60;
		const insulin = entry.insulin;
		const duration = (14 + (24 * insulin / weight));
		const peak = (duration / 3);
		const { activity } = Activity(peak, duration, hoursAgo, insulin);

		return {
			hoursAgo,
			detemirActivity: activity
		};
	});
	logger.info('these are the detemir activities:', timeSinceDetemirAct);

	// compute the aggregated activity of last detemirs in 30 hours

	const lastDetemirs = timeSinceDetemirAct.filter((e) => e.hoursAgo <= 30);
	logger.info('these are the last detemirs and activities:', lastDetemirs);

	const resultDetAct = lastDetemirs.reduce(function (tot, arr) {
		return tot + arr.detemirActivity;
	}, 0);

	logger.info(resultDetAct);
	return resultDetAct;
};