import sinusRun from './sinus';
import logger from './logger';

function calculateInsulinSuppressionFactor(insulinActivity: number, weight: number): number {
	const physiologicalBasalRate = (0.01 * weight) / 60;
	const activityRatio = insulinActivity / physiologicalBasalRate;

	const maxSuppression = 0.65;
	const halfMaxRatio = 2.0;
	const hillCoeff = 1.5;

	const suppression =
		Math.pow(activityRatio, hillCoeff) / (Math.pow(halfMaxRatio, hillCoeff) + Math.pow(activityRatio, hillCoeff));

	const effectiveSuppression = suppression * maxSuppression;
	return Math.max(1 - effectiveSuppression, 0.35);
}

export default function calculateLiverGlucoseProduction(
	isf: number,
	cr: number,
	activities: { physical: number; alcohol: number; insulin?: number },
	weight: number,
	timeZone: string,
): number {
	const isfMmol = isf / 18;
	logger.debug('[liver] Insulin Sensitivity Factor: %o, Carb Ratio: %o', isf, cr);

	const physicalActivityFactor = activities?.physical ?? 1;
	const alcoholFactor = activities?.alcohol ?? 1;
	const insulinActivity = activities?.insulin || 0;

	const insulinSuppressionFactor = calculateInsulinSuppressionFactor(insulinActivity, weight);

	logger.debug('[liver] Insulin activity: %o U/min, Suppression factor: %o', insulinActivity, insulinSuppressionFactor);

	const { sinus, cosinus } = sinusRun(timeZone || 'UTC');
	logger.debug('[liver] Sine factor: %o', sinus);
	logger.debug('[liver] Cosine factor: %o', cosinus);

	const carbFactor = isfMmol / cr;
	const baseGlucosePerMinute = 0.002 * weight;

	const baseGlucoseProduction =
		alcoholFactor * physicalActivityFactor * insulinSuppressionFactor * carbFactor * baseGlucosePerMinute;

	const circadianAdjustedProduction = baseGlucoseProduction * sinus;

	logger.debug('[liver] Base glucose production: %o', baseGlucoseProduction);
	logger.debug('[liver] Circadian adjusted production: %o', circadianAdjustedProduction);
	logger.debug(
		'[liver] Suppression breakdown - Physical: %o, Alcohol: %o, Insulin: %o',
		physicalActivityFactor,
		alcoholFactor,
		insulinSuppressionFactor,
	);

	return circadianAdjustedProduction;
}
