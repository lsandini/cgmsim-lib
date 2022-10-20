import { Treatment } from './Types';
import logger, { getDeltaMinutes } from './utils';

//const logger = pino();

export default function carbs(treatments: Treatment[] = [], carbsAbs: number, isf: number, cr: number): number {
	const isfMMol = isf / 18; //(mmol/l)/U

	const meals = treatments
		.filter(e => e.carbs && getDeltaMinutes(e.created_at) <= 360)
		.map(e => ({
			...e,
			minutesAgo: getDeltaMinutes(e.created_at),
		}))
		.filter(e=>e.minutesAgo>=0);

	logger.debug('Last 6 hours meal: %o', meals);

	const carbs = meals || [];
	const carbAbsTime = carbsAbs; // meal absorption time in min default 360 or 6 hours
	const fast_carbAbsTime = carbAbsTime / 6; // = 1 h or 60 min
	const slow_carbAbsTime = carbAbsTime / 1.5; // = 4 h or 240 min

	const timeSinceMealAct = carbs.map(entry => {
		const minutesAgo = entry.minutesAgo;
		const carbs_g = entry.carbs;

		// the first 40g of every meal at most are always considered fast carbs ???
		// No, let the amount of fast carbs be totally random, but at most 30 g.
		const fast = Math.min(entry.carbs, 40);

		// the amount exceeding 30 grams will be randomly split into fast and slow carbs
		const rest = entry.carbs - fast;
		const FSR = (Math.random() * (0.4 - 0.1) + 0.1); // FSR = FAST RANDOM RATIO

		// all fast carbs counted together
		const fast_carbs = fast + (FSR * rest);

		// the remainder is slow carbs
		const slow_carbs = (1 - FSR) * rest;

		logger.debug('carbs_g:', carbs_g, 'fast:', fast, 'rest:', rest, 'fast_carbs:', fast_carbs, 'slow_carbs: %o', slow_carbs);

		let fast_carbrate = 0;
		let slow_carbrate = 0;


		if (minutesAgo < (fast_carbAbsTime / 2)) {
			const AT2 = Math.pow(fast_carbAbsTime, 2);
			fast_carbrate = (fast_carbs * 4 * minutesAgo) / AT2;
			//COB = (fast_carbs * 2 * Math.pow(t, 2)) / AT2;
		} else if (minutesAgo < (fast_carbAbsTime)) {
			fast_carbrate = (fast_carbs * 4 / fast_carbAbsTime) * (1 - (minutesAgo / fast_carbAbsTime));
			// const AAA = (4 * fast_carbs / fast_carbAbsTime);
			// const BBB = Math.pow(t, 2) / (2 * fast_carbAbsTime);
			// COB = (AAA * (t - BBB)) - fast_carbs;
		} else {
			fast_carbrate = 0;
			// COB = 0;
			logger.debug('fast carb absorption rate: %o', fast_carbrate);
		}

		if (minutesAgo < (slow_carbAbsTime / 2)) {
			const AT2 = Math.pow(slow_carbAbsTime, 2);
			slow_carbrate = (slow_carbs * 4 * minutesAgo) / AT2;
			//COB = (slow_carbs * 2 * Math.pow(t, 2)) / AT2;
		} else if (minutesAgo < (slow_carbAbsTime)) {
			slow_carbrate = (slow_carbs * 4 / slow_carbAbsTime) * (1 - (minutesAgo / slow_carbAbsTime));
			// const AAA = (4 * slow_carbs / slow_carbAbsTime);
			// const BBB = Math.pow(t, 2) / (2 * slow_carbAbsTime);
			//COB = (AAA * (t - BBB)) - slow_carbs;
		} else {
			slow_carbrate = 0;
			// COB = 0;
			logger.debug('slow carb absorption rate: %o', slow_carbrate);
		}

		return fast_carbrate + slow_carbrate;
	});
	logger.debug(timeSinceMealAct);


	const totalCarbRate = timeSinceMealAct.reduce((tot, carbrate) => tot + carbrate, 0);
	const DBGC = (isfMMol / cr) * totalCarbRate; //DeltaBloodGlucoseFromCarbs
	logger.debug(`CARB RATE:%o`, totalCarbRate);
	logger.info(`Delta blood Glucose From Carbs per minute:%o`, DBGC);

	return DBGC;
};