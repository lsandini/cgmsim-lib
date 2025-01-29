import sinusRun from './sinus';
import logger from './utils';

/**
 * Calculates liver glucose production based on various factors
 * @param isf - Insulin Sensitivity Factor constant
 * @param cr - Carb Ratio (g/U)
 * @param activities - Object containing physical activity and alcohol factors
 * @param weight - Patient weight in kg
 * @param timeZone - Timezone string for circadian rhythm calculation
 * @returns Liver glucose production in (mmol/l)/min
 */
export default function calculateLiverGlucoseProduction(
	isf: number,
	cr: number,
	activities: { physical: number; alcohol: number },
	weight: number,
	timeZone: string,
): number {
	const isfMmol = isf / 18; // Convert ISF to (mmol/L)/U
	logger.debug('[liver] Insulin Sensitivity Factor:', isf, 'Carb Ratio:', cr);

	const physicalActivityFactor = activities?.physical;
	const alcoholFactor = activities?.alcohol;

	// Circadian rhythm factors:
	// Sine wave varies between 0.5 and 1.5, centered at 1.0
	// - At midnight: sine = 1.0, cosine = 1.5
	// - At 6 AM: sine = 1.5, cosine = 1.0
	// - At noon: sine = 1.0, cosine = 0.5
	// - At 6 PM: sine = 0.5, cosine = 1.0
	const { sinus, cosinus } = sinusRun(timeZone);
	logger.debug('[liver] Sine factor: %o', sinus);
	logger.debug('[liver] Cosine factor: %o', cosinus);

	// Calculate Carb Factor (CF) = ISF/CR
	// Example: If ISF = 2 mmol/l/U and CR = 10g/U
	// Then CF = 0.2 mmol/l/g
	const carbFactor = isfMmol / cr;

	// Base glucose production rate per minute based on weight
	const baseGlucosePerMinute = 0.002 * weight;

	// Calculate liver glucose production adjusted for alcohol and activity
	const baseGlucoseProduction = alcoholFactor * physicalActivityFactor * carbFactor * baseGlucosePerMinute;

	// Apply circadian rhythm using sine wave
	const circadianAdjustedProduction = baseGlucoseProduction * sinus;

	logger.debug('[liver] Base glucose production: %o', baseGlucoseProduction);
	logger.debug('[liver] Circadian adjusted production: %o', circadianAdjustedProduction);

	return circadianAdjustedProduction;
}
