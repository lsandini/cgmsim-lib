import { NSTreatment, isMealBolusTreatment } from './Types';
import logger, { getDeltaMinutes } from './utils';

const FAST_THRESHOLD = 30;
const EXTRA_FAST_MIN = 0.2;
const EXTRA_FAST_MAX = 0.7;

type SplittableMeal = { created_at: string; carbs?: number };

type ActiveMeal = NSTreatment & {
	minutesAgo: number;
	carbs: number;
};

export type CarbSplit = {
	fastCarbs: number;
	slowCarbs: number;
	extraFastRatio: number;
};

export type CarbCalculation = {
	effect: number;
	cob: number;
};

function fnv1a(input: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

function mulberry32(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function splitMealCarbs(meal: SplittableMeal): CarbSplit {
	const carbs = meal.carbs ?? 0;
	const rng = mulberry32(fnv1a(`${meal.created_at}|${carbs}`));
	const extraFastRatio = EXTRA_FAST_MIN + rng() * (EXTRA_FAST_MAX - EXTRA_FAST_MIN);

	if (carbs <= FAST_THRESHOLD) {
		return { fastCarbs: carbs, slowCarbs: 0, extraFastRatio };
	}

	const excess = carbs - FAST_THRESHOLD;
	const fastCarbs = FAST_THRESHOLD + extraFastRatio * excess;
	const slowCarbs = (1 - extraFastRatio) * excess;
	return { fastCarbs, slowCarbs, extraFastRatio };
}

function getActiveMeals(treatments: NSTreatment[] = [], carbAbsorptionTime: number): ActiveMeal[] {
	return treatments
		.filter(isMealBolusTreatment)
		.filter((meal) => meal?.carbs > 0 && getDeltaMinutes(meal.created_at) <= carbAbsorptionTime)
		.map((meal) => ({
			...meal,
			carbs: meal.carbs ?? 0,
			minutesAgo: getDeltaMinutes(meal.created_at),
		}))
		.filter((meal) => meal.minutesAgo >= 0);
}

function calculateMealAbsorptionRate(meal: ActiveMeal, fastAbsorptionTime: number, slowAbsorptionTime: number): number {
	const minutesAgo = meal.minutesAgo;
	const { fastCarbs, slowCarbs } = splitMealCarbs(meal);

	logger.debug('[carbs] Carb absorption split:', {
		totalCarbs: meal.carbs,
		fastCarbs,
		slowCarbs,
	});

	let fastCarbRate = 0;
	if (minutesAgo < fastAbsorptionTime / 2) {
		const timeSquared = Math.pow(fastAbsorptionTime, 2);
		fastCarbRate = (fastCarbs * 4 * minutesAgo) / timeSquared;
	} else if (minutesAgo < fastAbsorptionTime) {
		fastCarbRate = ((fastCarbs * 4) / fastAbsorptionTime) * (1 - minutesAgo / fastAbsorptionTime);
	}
	logger.debug('[carbs] Fast carb absorption rate:', fastCarbRate);

	let slowCarbRate = 0;
	if (minutesAgo < slowAbsorptionTime / 2) {
		const timeSquared = Math.pow(slowAbsorptionTime, 2);
		slowCarbRate = (slowCarbs * 4 * minutesAgo) / timeSquared;
	} else if (minutesAgo < slowAbsorptionTime) {
		slowCarbRate = ((slowCarbs * 4) / slowAbsorptionTime) * (1 - minutesAgo / slowAbsorptionTime);
	}
	logger.debug('[carbs] Slow carb absorption rate:', slowCarbRate);

	return fastCarbRate + slowCarbRate;
}

function calculateMealCOB(meal: ActiveMeal, fastAbsorptionTime: number, slowAbsorptionTime: number): number {
	const minutesAgo = meal.minutesAgo;
	const { fastCarbs, slowCarbs } = splitMealCarbs(meal);

	logger.debug('[carbs] Carb split:', {
		totalCarbs: meal.carbs,
		fastCarbs,
		slowCarbs,
	});

	let remainingFastCarbs = 0;
	if (minutesAgo < fastAbsorptionTime) {
		if (minutesAgo < fastAbsorptionTime / 2) {
			remainingFastCarbs = fastCarbs - ((2 * fastCarbs) / Math.pow(fastAbsorptionTime, 2)) * Math.pow(minutesAgo, 2);
		} else {
			remainingFastCarbs =
				2 * fastCarbs -
				((4 * fastCarbs) / fastAbsorptionTime) * (minutesAgo - Math.pow(minutesAgo, 2) / (2 * fastAbsorptionTime));
		}
	}
	remainingFastCarbs = Math.max(0, remainingFastCarbs);
	logger.debug('[carbs] Remaining fast carbs:', remainingFastCarbs);

	let remainingSlowCarbs = 0;
	if (minutesAgo < slowAbsorptionTime) {
		if (minutesAgo < slowAbsorptionTime / 2) {
			remainingSlowCarbs = slowCarbs - ((2 * slowCarbs) / Math.pow(slowAbsorptionTime, 2)) * Math.pow(minutesAgo, 2);
		} else {
			remainingSlowCarbs =
				2 * slowCarbs -
				((4 * slowCarbs) / slowAbsorptionTime) * (minutesAgo - Math.pow(minutesAgo, 2) / (2 * slowAbsorptionTime));
		}
	}
	remainingSlowCarbs = Math.max(0, remainingSlowCarbs);
	logger.debug('[carbs] Remaining slow carbs:', remainingSlowCarbs);

	return remainingFastCarbs + remainingSlowCarbs;
}

function getAbsorptionTimes(carbAbsorptionTime: number) {
	return {
		fastAbsorptionTime: carbAbsorptionTime / 6,
		slowAbsorptionTime: carbAbsorptionTime / 1.5,
	};
}

function calculateMealTotals(activeMeals: ActiveMeal[], carbAbsorptionTime: number) {
	const { fastAbsorptionTime, slowAbsorptionTime } = getAbsorptionTimes(carbAbsorptionTime);

	return activeMeals.reduce(
		(total, meal) => ({
			totalCarbRate: total.totalCarbRate + calculateMealAbsorptionRate(meal, fastAbsorptionTime, slowAbsorptionTime),
			cob: total.cob + calculateMealCOB(meal, fastAbsorptionTime, slowAbsorptionTime),
		}),
		{ totalCarbRate: 0, cob: 0 },
	);
}

export function calculateCarbEffectAndCOB(
	treatments: NSTreatment[] = [],
	carbAbsorptionTime: number,
	isf: number,
	cr: number,
): CarbCalculation {
	const activeMeals = getActiveMeals(treatments, carbAbsorptionTime);

	logger.debug('[carbs] Active meals in absorption window:', activeMeals);

	if (activeMeals.length > 0) {
		const latestMeal = activeMeals.reduce((a, b) => (a.minutesAgo <= b.minutesAgo ? a : b));
		const split = splitMealCarbs(latestMeal);
		logger.debug(
			'[carbs] Latest meal split: %dg carbs at %s (%dm ago) -> fast %sg / slow %sg (extraFastRatio %s)',
			latestMeal.carbs,
			latestMeal.created_at,
			latestMeal.minutesAgo,
			split.fastCarbs.toFixed(2),
			split.slowCarbs.toFixed(2),
			split.extraFastRatio.toFixed(3),
		);
	}

	const totals = calculateMealTotals(activeMeals, carbAbsorptionTime);
	const bloodGlucoseImpact = (isf / 18 / cr) * totals.totalCarbRate;

	logger.debug('[carbs] Total carb absorption rate:', totals.totalCarbRate);
	logger.debug('[carbs] Predicted blood glucose impact per minute:', bloodGlucoseImpact);
	logger.debug('[carbs] Total Carbs On Board:', totals.cob);

	return {
		effect: bloodGlucoseImpact,
		cob: totals.cob,
	};
}

/**
 * Calculates blood glucose impact from active carbohydrates
 * @param treatments - Array of treatments containing carb intake
 * @param carbAbsorptionTime - Time in minutes for complete carb absorption (default 360 min / 6 hours)
 * @param isf - Insulin Sensitivity Factor in mg/dl/U
 * @param cr - Carb Ratio in g/U
 * @returns Predicted blood glucose change per minute (mmol/L/min)
 */
export default function calculateCarbEffect(
	treatments: NSTreatment[] = [],
	carbAbsorptionTime: number,
	isf: number,
	cr: number,
): number {
	const activeMeals = getActiveMeals(treatments, carbAbsorptionTime);
	const { fastAbsorptionTime, slowAbsorptionTime } = getAbsorptionTimes(carbAbsorptionTime);
	const totalCarbRate = activeMeals.reduce(
		(total, meal) => total + calculateMealAbsorptionRate(meal, fastAbsorptionTime, slowAbsorptionTime),
		0,
	);
	const bloodGlucoseImpact = (isf / 18 / cr) * totalCarbRate;

	logger.debug('[carbs] Total carb absorption rate:', totalCarbRate);
	logger.debug('[carbs] Predicted blood glucose impact per minute:', bloodGlucoseImpact);

	return bloodGlucoseImpact;
}

/**
 * Calculates remaining unabsorbed carbohydrates (Carbs On Board)
 * @param treatments - Array of treatments containing carb intake
 * @param carbAbsorptionTime - Time in minutes for complete carb absorption (default 360 min / 6 hours)
 * @returns Total remaining unabsorbed carbs in grams
 */
export function calculateCarbsCOB(carbAbsorptionTime: number, treatments: NSTreatment[] = []): number {
	const activeMeals = getActiveMeals(treatments, carbAbsorptionTime);
	const { fastAbsorptionTime, slowAbsorptionTime } = getAbsorptionTimes(carbAbsorptionTime);
	const cob = activeMeals.reduce(
		(total, meal) => total + calculateMealCOB(meal, fastAbsorptionTime, slowAbsorptionTime),
		0,
	);

	logger.debug('[carbs] Total Carbs On Board:', cob);
	return cob;
}
