import { NSTreatment, NSTreatmentParsed, TreatmentExpParam, isAnnouncementTreatment } from './types';
import logger from './logger';
import { getDeltaMinutes } from './utils';

/**
 * Drug definitions with their properties
 */
export const drugs = {
	GLA: {
		names: ['gla', 'lan'],
		peak: (duration: number) => duration / 2.5,
		units: (units: number) => units,
		duration: (units: number, weight: number) => (22 + (12 * units) / weight) * 60,
	},
	DET: {
		names: ['det', 'lev'],
		peak: (duration: number) => duration / 3,
		units: (units: number) => units,
		duration: (units: number, weight: number) => (14 + (24 * units) / weight) * 60,
	},
	TOU: {
		names: ['tou'],
		peak: (duration: number) => duration / 2.5,
		units: (units: number) => units,
		duration: (units: number, weight: number) => (24 + (14 * units) / weight) * 60,
	},
	DEG: {
		names: ['deg', 'tre'],
		units: (units: number) => units,
		peak: (duration: number) => duration / 3,
		duration: () => 42 * 60,
	},
	NPH: {
		names: ['pro', 'nph'],
		peak: (duration: number) => duration / 3.5,
		units: (units: number) => units,
		duration: (units: number, weight: number) => (12 + (20 * units) / weight) * 60,
	},
	COR: {
		names: ['pre', 'cor'],
		peak: (duration: number) => duration / 3,
		units: (units: number) => units,
		duration: (units: number, weight: number) => (16 + (12 * units) / weight) * 60,
	},
	ALC: {
		names: ['alc'],
		peak: (duration: number) => duration / 2.5,
		units: (drinks: number) => drinks * 12,
		duration: (drinks: number, weight: number) => {
			const _duration = ((40 * drinks) / weight) * 100;
			return _duration > 240 ? _duration : 240;
		},
	},
	BEER: {
		names: ['bee', 'bir'],
		peak: (duration: number) => duration / 2.5,
		units: (dL: number) => (dL * 12) / 3.3,
		duration: (dL: number, weight: number) => {
			const drinks = dL / 3.3;
			const _duration = ((40 * drinks) / weight) * 100;
			return _duration > 240 ? _duration : 240;
		},
	},
};

/**
 * Transforms note treatments into parsed drug treatments
 */
export const transformNoteTreatmentsDrug = (treatments: NSTreatment[]): NSTreatmentParsed[] => {
	const drugTreatments = treatments
		?.filter(isAnnouncementTreatment)
		.filter((treatment) => {
			const notes = treatment.notes?.toLowerCase() || '';
			return Object.values(drugs).some((drug) =>
				drug.names.some((name) => notes.startsWith(name) || notes.includes(` ${name}`)),
			);
		})
		.map((treatment) => {
			const notes = treatment.notes.toLowerCase();
			const matchedDrug = Object.entries(drugs).find(([, drug]) =>
				drug.names.some((name) => notes.startsWith(name) || notes.includes(` ${name}`)),
			);

			if (!matchedDrug) return null;

			const [drugKey] = matchedDrug;
			const lastSpaceIndex = notes.lastIndexOf(' ');
			const units = parseFloat(treatment.notes.slice(lastSpaceIndex)) || 0;

			return {
				drug: drugKey,
				units,
				minutesAgo: getDeltaMinutes(treatment.created_at),
			};
		})
		.filter((treatment): treatment is NSTreatmentParsed => treatment !== null && treatment.units > 0);

	logger.debug('[drug] Transformed drug treatments:', drugTreatments);
	return drugTreatments || [];
};

/**
 * Calculates exponential treatment parameters for a specific drug
 */
export const getTreatmentExpParam = (
	treatments: NSTreatmentParsed[],
	weight: number,
	drugKey: keyof typeof drugs,
): TreatmentExpParam[] => {
	const drugConfig = drugs[drugKey];
	if (!drugConfig) {
		logger.error(`[drug] Invalid drug key: ${drugKey}`);
		return [];
	}

	return treatments
		.filter((t) => t.drug === drugKey)
		.map((t) => {
			const duration = drugConfig.duration(t.units, weight);
			const peak = drugConfig.peak(duration);
			const units = drugConfig.units(t.units);

			return {
				units,
				minutesAgo: t.minutesAgo,
				duration,
				peak,
			};
		})
		.filter((param) => param.minutesAgo <= param.duration && param.minutesAgo >= 0);
};
