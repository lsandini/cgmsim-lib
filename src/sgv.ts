import * as moment from 'moment';
// import pump from './pump.js';

import logger from './utils';
import { CGMSimParams, Sgv } from './Types';
import { getDeltaMinutes } from './utils';

/**
 * Constants for blood glucose limits in mg/dL
 */
const BG_LIMITS = {
	MAX: 400,
	MIN: 40,
};

/**
 * Calculate the next blood glucose value based on various physiological factors
 * @param entries - Previous blood glucose entries
 * @param params - Simulation parameters for different activities
 * @param isf - Insulin Sensitivity Factor
 * @returns Object containing new blood glucose value and activity contributions
 */
const calculateNextGlucose = (
	entries: Sgv[],
	{ basalActivity, liverActivity, carbsActivity, bolusActivity, cortisoneActivity, alcoholActivity }: CGMSimParams,
	isf: number,
): GlucoseResult => {
	// Get previous glucose value or use default
	const previousGlucose = entries?.[0]?.sgv ?? 90;
	const deltaMinutes = entries?.[0] ? getDeltaMinutes(entries[0].mills) : 1;

	logger.debug('Time since last reading: %o minutes', deltaMinutes);

	// Convert ISF to mmol/L
	const isfMmol = isf / 18; // (mmol/L)/U

	// Calculate activity impacts for the time period
	const basalImpact = basalActivity * deltaMinutes;
	const cortisoneImpact = cortisoneActivity ? cortisoneActivity * deltaMinutes : 0;
	const bolusImpact = bolusActivity * deltaMinutes;
	const liverImpact = liverActivity * deltaMinutes;
	const carbsImpact = carbsActivity * deltaMinutes;

	// Calculate total insulin impact
	const totalInsulinActivity = basalImpact + bolusImpact; // U/min
	const insulinGlucoseImpact = totalInsulinActivity * isfMmol * -1; // mmol/L

	// Calculate new glucose value (converting all to mg/dL)
	const newGlucose = Math.floor(
		previousGlucose + insulinGlucoseImpact * 18 + carbsImpact * 18 + cortisoneImpact * 18 + liverImpact * 18,
	);

	// Limit glucose to valid range
	const limitedGlucose = Math.min(Math.max(newGlucose, BG_LIMITS.MIN), BG_LIMITS.MAX);

	// Prepare result object with all components
	const result: GlucoseResult = {
		sgv: limitedGlucose,
		deltaMinutes,
		carbsActivity: carbsImpact * 18,
		basalActivity: basalImpact * isfMmol * 18,
		cortisoneActivity: cortisoneImpact * isfMmol * 18,
		bolusActivity: bolusImpact * isfMmol * 18,
		liverActivity: liverImpact * 18,
		alcoholActivity,
	};

	// Log detailed breakdown of glucose changes
	logGlucoseComponents(
		previousGlucose,
		deltaMinutes,
		insulinGlucoseImpact,
		liverImpact,
		cortisoneImpact,
		carbsImpact,
		basalImpact,
		bolusImpact,
		isfMmol,
	);

	return result;
};

/**
 * Interface for glucose calculation result
 */
interface GlucoseResult {
	sgv: number;
	deltaMinutes: number;
	carbsActivity: number;
	basalActivity: number;
	cortisoneActivity: number;
	bolusActivity: number;
	liverActivity: number;
	alcoholActivity: number;
}

/**
 * Log detailed breakdown of glucose calculations
 */
function logGlucoseComponents(
	previousGlucose: number,
	deltaMinutes: number,
	insulinGlucoseImpact: number,
	liverImpact: number,
	cortisoneImpact: number,
	carbsImpact: number,
	basalImpact: number,
	bolusImpact: number,
	isfMmol: number,
): void {
	logger.debug('-------------------------------------------');
	logger.debug(`Previous glucose (${deltaMinutes} minutes ago): ${previousGlucose} mg/dL`);
	logger.debug('-------------------------------------------');
	logger.debug(`Total insulin impact for ${deltaMinutes} minutes: ${insulinGlucoseImpact * 18} mg/dL`);
	logger.debug('-------------------------------------------');
	logger.debug(`Total liver impact for ${deltaMinutes} minutes: +${liverImpact * 18} mg/dL`);
	logger.debug('-------------------------------------------');
	logger.debug(`Total cortisone impact for ${deltaMinutes} minutes: +${cortisoneImpact * 18} mg/dL`);
	logger.debug('-------------------------------------------');
	logger.debug(`Total carbs impact for ${deltaMinutes} minutes: +${carbsImpact * 18} mg/dL`);
	logger.debug('-------------------------------------------');
	logger.debug(
		`Combined impact for ${deltaMinutes} minutes: ${insulinGlucoseImpact + liverImpact * 18 + carbsImpact * 18} mg/dL`,
	);
	logger.debug(`Basal insulin impact for ${deltaMinutes} minutes: ${basalImpact * 18 * isfMmol} mg/dL`);
	logger.debug(`Bolus insulin impact for ${deltaMinutes} minutes: ${bolusImpact * 18 * isfMmol} mg/dL`);
}

export default calculateNextGlucose;
