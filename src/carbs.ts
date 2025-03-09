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

	logger.debug('[carbs] Active meals in absorption window:', activeMeals);

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

		logger.debug('[carbs] Carb absorption split:', {
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
		logger.debug('[carbs] Fast carb absorption rate:', fastCarbRate);

		// Calculate absorption rates for slow carbs
		let slowCarbRate = 0;
		if (minutesAgo < slowAbsorptionTime / 2) {
			const timeSquared = Math.pow(slowAbsorptionTime, 2);
			slowCarbRate = (slowCarbs * 4 * minutesAgo) / timeSquared;
		} else if (minutesAgo < slowAbsorptionTime) {
			slowCarbRate = ((slowCarbs * 4) / slowAbsorptionTime) * (1 - minutesAgo / slowAbsorptionTime);
		}
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
 * @param treatments - Array of treatments containing carb intake
 * @param carbAbsorptionTime - Time in minutes for complete carb absorption (default 360 min / 6 hours)
 * @returns Total remaining unabsorbed carbs in grams
 */
export function calculateCarbsCOB(carbAbsorptionTime: number, treatments: NSTreatment[] = []): number {
	// Get active meals within absorption time window
	const activeMeals = treatments
		?.filter(isMealBolusTreatment)
		.filter((meal) => meal?.carbs > 0 && getDeltaMinutes(meal.created_at) <= carbAbsorptionTime)
		.map((meal) => ({
			...meal,
			minutesAgo: getDeltaMinutes(meal.created_at),
		}))
		.filter((meal) => meal.minutesAgo >= 0);

	logger.debug('[carbs] Active meals in absorption window:', activeMeals);

	// Define absorption times for different carb types
	const fastAbsorptionTime = carbAbsorptionTime / 6; // 60 min for default
	const slowAbsorptionTime = carbAbsorptionTime / 1.5; // 240 min for default

	// Calculate remaining carbs for each meal
	const remainingCarbs = activeMeals.map((meal) => {
		const minutesAgo = meal.minutesAgo;
		const totalCarbs = meal.carbs;

		// Split between fast and slow carbs (using same ratios as original)
		const fastCarbsPortion = Math.min(Math.random() * totalCarbs, 40);
		const remainingCarbs = totalCarbs - fastCarbsPortion;
		const fastAbsorptionRatio = Math.random() * (0.4 - 0.1) + 0.1;

		const fastCarbs = fastCarbsPortion + fastAbsorptionRatio * remainingCarbs;
		const slowCarbs = (1 - fastAbsorptionRatio) * remainingCarbs;

		logger.debug('[carbs] Carb split:', {
			totalCarbs,
			fastCarbs,
			slowCarbs,
		});

		// Calculate remaining fast carbs
		let remainingFastCarbs = 0;
		if (minutesAgo < fastAbsorptionTime) {
			if (minutesAgo < fastAbsorptionTime / 2) {
				// First half formula
				remainingFastCarbs = fastCarbs - ((2 * fastCarbs) / Math.pow(fastAbsorptionTime, 2)) * Math.pow(minutesAgo, 2);
			} else {
				// Second half formula
				remainingFastCarbs =
					2 * fastCarbs -
					((4 * fastCarbs) / fastAbsorptionTime) * (minutesAgo - Math.pow(minutesAgo, 2) / (2 * fastAbsorptionTime));
			}
		}
		remainingFastCarbs = Math.max(0, remainingFastCarbs);
		logger.debug('[carbs] Remaining fast carbs:', remainingFastCarbs);

		// Calculate remaining slow carbs
		let remainingSlowCarbs = 0;
		if (minutesAgo < slowAbsorptionTime) {
			if (minutesAgo < slowAbsorptionTime / 2) {
				// First half formula
				remainingSlowCarbs = slowCarbs - ((2 * slowCarbs) / Math.pow(slowAbsorptionTime, 2)) * Math.pow(minutesAgo, 2);
			} else {
				// Second half formula
				remainingSlowCarbs =
					2 * slowCarbs -
					((4 * slowCarbs) / slowAbsorptionTime) * (minutesAgo - Math.pow(minutesAgo, 2) / (2 * slowAbsorptionTime));
			}
		}
		remainingSlowCarbs = Math.max(0, remainingSlowCarbs);
		logger.debug('[carbs] Remaining slow carbs:', remainingSlowCarbs);

		return remainingFastCarbs + remainingSlowCarbs;
	});

	const totalCOB = remainingCarbs.reduce((total, cob) => total + cob, 0);
	logger.debug('[carbs] Total Carbs On Board:', totalCOB);

	return totalCOB;
}
