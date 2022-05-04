import logger from './utils';
import { Treatment, TreatmentDelta } from './Types';
import { getDeltaMinutes } from './utils';

//const logger = pino();

export default function (treatments: Treatment[]): TreatmentDelta[] {

	const meals = treatments
		.filter(e => e.carbs && getDeltaMinutes(e.mills) > 360)
		.map(e => ({
			...e,
			minutesAgo: getDeltaMinutes(e.mills),
		}));

	logger.info('Last 6 hours meal:', meals);
	return meals;
}

