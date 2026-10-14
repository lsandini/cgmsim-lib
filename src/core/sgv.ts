import logger from './logger';
import { CGMSimParams, Sgv } from './types';
import { getDeltaMinutes, mgdlToMmol, mmolToMgdl } from './utils';

const BG_LIMITS = {
	MAX: 400,
	MIN: 40,
};

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

function logGlucoseComponents({
	previousGlucose,
	deltaMinutes,
	insulinGlucoseImpact,
	liverImpact,
	cortisoneImpact,
	carbsImpact,
	basalImpact,
	bolusImpact,
	isfMmol,
}: {
	previousGlucose: number;
	deltaMinutes: number;
	insulinGlucoseImpact: number;
	liverImpact: number;
	cortisoneImpact: number;
	carbsImpact: number;
	basalImpact: number;
	bolusImpact: number;
	isfMmol: number;
}): void {
	logger.debug(`[sgv] Previous glucose (${deltaMinutes} minutes ago): ${previousGlucose} mg/dL`);
	logger.debug(`[sgv] Total insulin impact for ${deltaMinutes} minutes: ${mmolToMgdl(insulinGlucoseImpact)} mg/dL`);
	logger.debug(`[sgv] Total liver impact for ${deltaMinutes} minutes: +${mmolToMgdl(liverImpact)} mg/dL`);
	logger.debug(`[sgv] Total cortisone impact for ${deltaMinutes} minutes: +${mmolToMgdl(cortisoneImpact)} mg/dL`);
	logger.debug(`[sgv] Total carbs impact for ${deltaMinutes} minutes: +${mmolToMgdl(carbsImpact)} mg/dL`);
	logger.debug(
		`[sgv] Combined impact for ${deltaMinutes} minutes: ${
			insulinGlucoseImpact + mmolToMgdl(liverImpact) + mmolToMgdl(carbsImpact)
		} mg/dL`,
	);
	logger.debug(`[sgv] Basal insulin impact for ${deltaMinutes} minutes: ${mmolToMgdl(basalImpact * isfMmol)} mg/dL`);
	logger.debug(`[sgv] Bolus insulin impact for ${deltaMinutes} minutes: ${mmolToMgdl(bolusImpact * isfMmol)} mg/dL`);
}

export const calculateNextGlucose = (
	entries: Sgv[],
	{ basalActivity, liverActivity, carbsActivity, bolusActivity, cortisoneActivity, alcoholActivity }: CGMSimParams,
	isf: number,
): GlucoseResult => {
	let deltaMinutes = 1;
	let lastSgv: number;

	if (entries?.length > 0) {
		lastSgv = entries[0].sgv;
		deltaMinutes = getDeltaMinutes(entries[0].mills);
	} else if (entries?.length === 0) {
		lastSgv = 90;
		logger.warn('Empty entries, using 90 as last sgv');
	} else {
		logger.error('No entries found');
		return null;
	}

	logger.debug('[sgv] Time since last reading: %o minutes', deltaMinutes);

	const isfMmol = mgdlToMmol(isf);

	const basalImpact = basalActivity * deltaMinutes;
	const cortisoneImpact = cortisoneActivity ? cortisoneActivity * deltaMinutes : 0;
	const bolusImpact = bolusActivity * deltaMinutes;
	const liverImpact = liverActivity * deltaMinutes;
	const carbsImpact = carbsActivity * deltaMinutes;

	const totalInsulinActivity = basalImpact + bolusImpact;
	const insulinGlucoseImpact = totalInsulinActivity * isfMmol * -1;

	const newGlucose = Math.floor(
		lastSgv +
			mmolToMgdl(insulinGlucoseImpact) +
			mmolToMgdl(carbsImpact) +
			mmolToMgdl(cortisoneImpact) +
			mmolToMgdl(liverImpact),
	);

	const limitedGlucose = Math.min(Math.max(newGlucose, BG_LIMITS.MIN), BG_LIMITS.MAX);

	const result: GlucoseResult = {
		sgv: limitedGlucose,
		deltaMinutes,
		carbsActivity: mmolToMgdl(carbsImpact),
		basalActivity: mmolToMgdl(basalImpact * isfMmol),
		cortisoneActivity: mmolToMgdl(cortisoneImpact * isfMmol),
		bolusActivity: mmolToMgdl(bolusImpact * isfMmol),
		liverActivity: mmolToMgdl(liverImpact),
		alcoholActivity,
	};

	logGlucoseComponents({
		previousGlucose: lastSgv,
		deltaMinutes,
		insulinGlucoseImpact,
		liverImpact,
		cortisoneImpact,
		carbsImpact,
		basalImpact,
		bolusImpact,
		isfMmol,
	});

	return result;
};

export default calculateNextGlucose;
