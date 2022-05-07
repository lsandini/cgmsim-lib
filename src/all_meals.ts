import logger from './utils';
import { Treatment, TreatmentDelta } from './Types';
import { getDeltaMinutes } from './utils';

//const logger = pino();

export default function (treatments: Treatment[]): TreatmentDelta[] {

	const meals = treatments
		.filter(e => e.carbs && getDeltaMinutes(e.created_at) > 360)
		.map(e => ({
			...e,
			minutesAgo: getDeltaMinutes(e.created_at),
		}));

	logger.info('Last 6 hours meal: %o', meals);
	return meals;
}

