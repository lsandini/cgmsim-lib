import logger from './utils';
import { TreatmentDelta } from './Types';
import { Activity } from './utils';

//const logger = pino();
export default function (degludecs: Pick<TreatmentDelta, 'insulin' | 'minutesAgo'>[]): number {
	logger.info(degludecs);

	// activities be expressed as U/min !!!
	const timeSinceDegludecAct = degludecs.map(entry => {
		const hoursAgo = entry.minutesAgo / 60;
		const insulin = entry.insulin;
		const duration = 42;
		const peak = (duration / 3);
		const { activity } = Activity(peak, duration, hoursAgo, insulin);

		return {
			hours: hoursAgo,
			degludecActivity: activity,
		};
	});

	logger.info('these are the degludec activities: %o', timeSinceDegludecAct);

	// compute the aggregated activity of last degludecs in 45 hours

	const lastDegludecs = timeSinceDegludecAct.filter((e) => e.hours <= 45);
	logger.info('these are the last degludecs and activities: %o', lastDegludecs);

	const resultDegAct = lastDegludecs.reduce((tot, arr) => tot + arr.degludecActivity, 0);

	logger.info(resultDegAct);
	return resultDegAct;
};