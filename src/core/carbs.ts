import { CoreTreatment, NSTreatment, isMealBolusTreatment } from './types';
import logger from './logger';
import { getDeltaMinutes, mgdlToMmol, rnd, triangularAbsorptionRate, triangularAbsorptionRemaining } from './utils';

const FAST_THRESHOLD = 30;
const EXTRA_FAST_MIN = 0.2;
const EXTRA_FAST_MAX = 0.7;

type SplittableMeal = { created_at?: string; timestamp?: string | Date | number; carbs?: number };

export type CarbSplit = {
	fastCarbs: number;
	slowCarbs: number;
	extraFastRatio: number;
};

export function splitMealCarbs(meal: SplittableMeal): CarbSplit {
	const carbs = meal.carbs ?? 0;
	const timeKey = meal.created_at || (meal.timestamp ? String(meal.timestamp) : '');
	const rng = rnd(`${timeKey}|${carbs}`);
	const extraFastRatio = EXTRA_FAST_MIN + rng() * (EXTRA_FAST_MAX - EXTRA_FAST_MIN);

	if (carbs <= FAST_THRESHOLD) {
		return { fastCarbs: carbs, slowCarbs: 0, extraFastRatio };
	}

	const excess = carbs - FAST_THRESHOLD;
	const fastCarbs = FAST_THRESHOLD + extraFastRatio * excess;
	const slowCarbs = (1 - extraFastRatio) * excess;
	return { fastCarbs, slowCarbs, extraFastRatio };
}

type ActiveMeal = {
	carbs: number;
	minutesAgo: number;
	created_at?: string;
	timestamp?: string | Date | number;
	absorptionDuration?: number;
};

function normalizeActiveMeals(
	treatments: (NSTreatment | CoreTreatment)[] = [],
	carbAbsorptionTime: number,
	referenceTime?: number | Date,
): ActiveMeal[] {
	if (!treatments || !Array.isArray(treatments)) {
		return [];
	}

	return treatments
		.filter((treatment) => {
			if ('eventType' in treatment) {
				return isMealBolusTreatment(treatment) && (treatment.carbs ?? 0) > 0;
			}
			return (treatment.type === 'carb' || treatment.type === 'Meal Bolus') && (treatment.carbs ?? 0) > 0;
		})
		.map((meal) => {
			const time = 'created_at' in meal ? meal.created_at : meal.timestamp;
			const carbs = 'carbs' in meal ? meal.carbs ?? 0 : 0;
			const absorptionDuration =
				'absorptionDuration' in meal && typeof meal.absorptionDuration === 'number'
					? meal.absorptionDuration
					: undefined;
			const minutesAgo = getDeltaMinutes(time, referenceTime);
			return {
				...meal,
				carbs,
				minutesAgo,
				absorptionDuration,
			};
		})
		.filter((meal) => {
			const maxDuration = meal.absorptionDuration ?? carbAbsorptionTime;
			return meal.minutesAgo <= maxDuration && meal.minutesAgo >= 0;
		});
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
	treatments: (NSTreatment | CoreTreatment)[] = [],
	carbAbsorptionTime: number,
	isf: number,
	cr: number,
	referenceTime?: number | Date,
): number {
	const isfMmol = mgdlToMmol(isf); // Convert ISF to (mmol/L)/U

	const activeMeals = normalizeActiveMeals(treatments, carbAbsorptionTime, referenceTime);

	logger.debug('[carbs] Active meals in absorption window:', activeMeals);

	if (activeMeals.length > 0) {
		const latestMeal = activeMeals.reduce((a, b) => (a.minutesAgo <= b.minutesAgo ? a : b));
		const split = splitMealCarbs(latestMeal);
		logger.debug(
			'[carbs] Latest meal split: %dg carbs at %s (%dm ago) → fast %sg / slow %sg (extraFastRatio %s)',
			latestMeal.carbs,
			latestMeal.created_at || latestMeal.timestamp,
			latestMeal.minutesAgo,
			split.fastCarbs.toFixed(2),
			split.slowCarbs.toFixed(2),
			split.extraFastRatio.toFixed(3),
		);
	}

	const mealAbsorptionRates = activeMeals.map((meal) => {
		const minutesAgo = meal.minutesAgo;
		const totalCarbs = meal.carbs;
		const duration = meal.absorptionDuration;
		const fastAbsorptionTime = duration ? Math.max(60, duration / 3) : carbAbsorptionTime / 6;
		const slowAbsorptionTime = duration ? duration : carbAbsorptionTime / 1.5;

		const { fastCarbs, slowCarbs } = splitMealCarbs(meal);

		logger.debug('[carbs] Carb absorption split:', {
			totalCarbs,
			fastCarbs,
			slowCarbs,
		});

		const fastCarbRate = triangularAbsorptionRate(fastCarbs, minutesAgo, fastAbsorptionTime);
		logger.debug('[carbs] Fast carb absorption rate:', fastCarbRate);

		const slowCarbRate = triangularAbsorptionRate(slowCarbs, minutesAgo, slowAbsorptionTime);
		logger.debug('[carbs] Slow carb absorption rate:', slowCarbRate);

		return fastCarbRate + slowCarbRate;
	});

	const totalCarbRate = mealAbsorptionRates.reduce((total, rate) => total + rate, 0);
	const bloodGlucoseImpact = (isfMmol / cr) * totalCarbRate;

	logger.debug('[carbs] Total carb absorption rate:', totalCarbRate);
	logger.debug('[carbs] Predicted blood glucose impact per minute:', bloodGlucoseImpact);

	return bloodGlucoseImpact;
}

/**
 * Calculates remaining unabsorbed carbohydrates (Carbs On Board)
 * @param carbAbsorptionTime - Time in minutes for complete carb absorption (default 360 min / 6 hours)
 * @param treatments - Array of treatments containing carb intake
 * @returns Total remaining unabsorbed carbs in grams
 */
export function calculateCarbsCOB(
	carbAbsorptionTime: number,
	treatments: (NSTreatment | CoreTreatment)[] = [],
	referenceTime?: number | Date,
): number {
	const activeMeals = normalizeActiveMeals(treatments, carbAbsorptionTime, referenceTime);
	logger.debug('[carbs] Active meals in absorption window:', activeMeals);

	const remainingCarbs = activeMeals.map((meal) => {
		const minutesAgo = meal.minutesAgo;
		const totalCarbs = meal.carbs;
		const duration = meal.absorptionDuration;
		const fastAbsorptionTime = duration ? Math.max(60, duration / 3) : carbAbsorptionTime / 6;
		const slowAbsorptionTime = duration ? duration : carbAbsorptionTime / 1.5;

		const { fastCarbs, slowCarbs } = splitMealCarbs(meal);

		logger.debug('[carbs] Carb split:', {
			totalCarbs,
			fastCarbs,
			slowCarbs,
		});

		const remainingFastCarbs = triangularAbsorptionRemaining(fastCarbs, minutesAgo, fastAbsorptionTime);
		logger.debug('[carbs] Remaining fast carbs:', remainingFastCarbs);

		const remainingSlowCarbs = triangularAbsorptionRemaining(slowCarbs, minutesAgo, slowAbsorptionTime);
		logger.debug('[carbs] Remaining slow carbs:', remainingSlowCarbs);

		return remainingFastCarbs + remainingSlowCarbs;
	});

	const totalCOB = remainingCarbs.reduce((total, cob) => total + cob, 0);
	logger.debug('[carbs] Total Carbs On Board:', totalCOB);

	return totalCOB;
}

/**
 * Standard alias for calculateCarbsCOB
 */
export const calculateCOB = calculateCarbsCOB;
