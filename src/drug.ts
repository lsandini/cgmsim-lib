import { NSTreatment, NSTreatmentParsed, TreatmentExpParam, isAnnouncementTreatment } from './Types';
import logger, { getDeltaMinutes } from './utils';

/**
 * Drug definitions with their properties
 * Each drug has:
 * - names: array of valid identifiers
 * - peak: function to calculate peak time in minutes
 * - units: function to convert input units
 * - duration: function to calculate effect duration in minutes
 */
export const drugs = {
	GLA: {
		names: ['gla', 'Gla', 'lan', 'Lan'],
		peak: (duration: number) => duration / 2.5,
		units: (units: number) => units,
		duration: (units: number, weight: number) => (22 + (12 * units) / weight) * 60,
	},
	DET: {
		names: ['det', 'Det', 'lev', 'Lev'],
		peak: (duration: number) => duration / 3,
		units: (units: number) => units,
		duration: (units: number, weight: number) => (14 + (24 * units) / weight) * 60,
	},
	TOU: {
		names: ['Tou', 'tou'],
		peak: (duration: number) => duration / 2.5,
		units: (units: number) => units,
		duration: (units: number, weight: number) => (24 + (14 * units) / weight) * 60,
	},
	DEG: {
		names: ['deg', 'Deg', 'tre', 'Tre'],
		units: (units: number) => units,
		peak: (duration: number) => duration / 3,
		duration: () => 42 * 60,
	},
	NPH: {
		names: ['pro', 'Pro', 'nph', 'Nph'],
		peak: (duration: number) => duration / 3.5,
		units: (units: number) => units,
		duration: (units: number, weight: number) => (12 + (20 * units) / weight) * 60,
	},
	COR: {
		names: ['pre', 'Pre', 'cor', 'Cor'],
		peak: (duration: number) => duration / 3,
		units: (insulin: number) => insulin,
		duration: (insulin: number, weight: number) => (16 + (12 * insulin) / weight) * 60,
	},
	// ALC: {
	// 	names: ['alc', 'Alc'],
	// 	peak: () => 90,
	// 	duration: () => 240,
	// },
	ALC: {
		names: ['alc', 'Alc'],
		peak: (duration: number) => duration / 2.5,
		units: (drinks: number) => drinks * 12,
		duration: (drinks: number, weight: number) => {
			const _duration = ((40 * drinks) / weight) * 100;
			return _duration > 240 ? _duration : 240;
		},
	},
	BEER: {
		names: ['bee', 'Bee'],
		peak: (duration: number) => duration / 2.5,
		units: (dL: number) => (dL * 12) / 3.3,
		duration: (dL: number, weight: number) => {
			const drinks = dL / 3.3;
			const _duration = ((40 * drinks) / weight) * 100; // when beer expressed in dL, 3.3dL = 1 drink
			return _duration > 240 ? _duration : 240;
		},
	},
};

/**
 * Calculates treatment exponential parameters for a specific drug
 * @param treatments - Array of parsed treatments
 * @param weight - Patient weight in kg
 * @param drug - Drug identifier
 * @returns Array of treatment parameters with timing and units
 */
export const getTreatmentExpParam = (
	treatments: NSTreatmentParsed[],
	weight: number,
	drug: keyof typeof drugs,
): TreatmentExpParam[] => {
	const selectedDrug = drugs[drug];
	return treatments
		.filter((treatment) => selectedDrug.names.some((name) => name === treatment.drug))
		.map((treatment) => {
			const duration = selectedDrug.duration(treatment.units, weight);
			const peak = selectedDrug.peak(duration);
			const units = selectedDrug.units(treatment.units);
			const minutesAgo = treatment.minutesAgo;
			return {
				minutesAgo,
				units,
				duration,
				peak,
			};
		});
};

/**
 * Transforms treatment notes into parsed drug treatments
 * @param treatments - Array of raw treatments
 * @returns Array of parsed treatments with drug info
 */
export function transformNoteTreatmentsDrug(treatments: NSTreatment[]): NSTreatmentParsed[] {
	return treatments && treatments.length
		? treatments
				?.filter(isAnnouncementTreatment)
				.filter((treatment) => treatment.notes)
				.map((treatment) => {
					const lastSpaceIndex = treatment.notes.lastIndexOf(' ');
					logger.debug('[drug] Processing treatment units: %o', parseFloat(treatment.notes.slice(lastSpaceIndex)));
					return {
						minutesAgo: getDeltaMinutes(treatment.created_at),
						drug: treatment.notes.slice(0, 3),
						units: parseFloat(treatment.notes.slice(lastSpaceIndex)) || 0,
					};
				})
				.filter((treatment) => treatment.minutesAgo >= 0)
		: [];
}
