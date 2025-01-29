import { NSTreatment, isMealBolusTreatment } from './Types';
import logger, { getDeltaMinutes } from './utils';

//const logger = pino();

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
	const isfMmol = isf / 18; // Convert ISF to (mmol/L)/U

	// Get active meals within absorption time window
	const activeMeals = treatments
		?.filter(isMealBolusTreatment)
		.filter((meal) => meal?.carbs > 0 && getDeltaMinutes(meal.created_at) <= carbAbsorptionTime)
		.map((meal) => ({
			...meal,
			minutesAgo: getDeltaMinutes(meal.created_at),
		}))
		.filter((meal) => meal.minutesAgo >= 0);

	logger.debug('Active meals in absorption window:', activeMeals);

	// Define absorption times for different carb types
	const fastAbsorptionTime = carbAbsorptionTime / 6; // 60 min for default
	const slowAbsorptionTime = carbAbsorptionTime / 1.5; // 240 min for default

	// Calculate absorption rates for each meal
	const mealAbsorptionRates = activeMeals.map((meal) => {
		const minutesAgo = meal.minutesAgo;
		const totalCarbs = meal.carbs;

		// Random split between fast and slow carbs
		const fastCarbsPortion = Math.min(Math.random() * totalCarbs, 40);
		const remainingCarbs = totalCarbs - fastCarbsPortion;
		const fastAbsorptionRatio = Math.random() * (0.4 - 0.1) + 0.1;

		const fastCarbs = fastCarbsPortion + fastAbsorptionRatio * remainingCarbs;
		const slowCarbs = (1 - fastAbsorptionRatio) * remainingCarbs;

		logger.debug('Carb absorption split:', {
			totalCarbs,
			fastCarbsPortion,
			remainingCarbs,
			fastCarbs,
			slowCarbs,
		});

		// Calculate absorption rates for fast carbs
		let fastCarbRate = 0;
		if (minutesAgo < fastAbsorptionTime / 2) {
			const timeSquared = Math.pow(fastAbsorptionTime, 2);
			fastCarbRate = (fastCarbs * 4 * minutesAgo) / timeSquared;
		} else if (minutesAgo < fastAbsorptionTime) {
			fastCarbRate = ((fastCarbs * 4) / fastAbsorptionTime) * (1 - minutesAgo / fastAbsorptionTime);
		}
		logger.debug('Fast carb absorption rate:', fastCarbRate);

		// Calculate absorption rates for slow carbs
		let slowCarbRate = 0;
		if (minutesAgo < slowAbsorptionTime / 2) {
			const timeSquared = Math.pow(slowAbsorptionTime, 2);
			slowCarbRate = (slowCarbs * 4 * minutesAgo) / timeSquared;
		} else if (minutesAgo < slowAbsorptionTime) {
			slowCarbRate = ((slowCarbs * 4) / slowAbsorptionTime) * (1 - minutesAgo / slowAbsorptionTime);
		}
		logger.debug('Slow carb absorption rate:', slowCarbRate);

		return fastCarbRate + slowCarbRate;
	});

	const totalCarbRate = mealAbsorptionRates.reduce((total, rate) => total + rate, 0);

	const bloodGlucoseImpact = (isfMmol / cr) * totalCarbRate;

	logger.debug('Total carb absorption rate:', totalCarbRate);
	logger.debug('Predicted blood glucose impact per minute:', bloodGlucoseImpact);

	return bloodGlucoseImpact;
}
