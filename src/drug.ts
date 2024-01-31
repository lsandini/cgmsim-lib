import {
	NSTreatment,
	NSTreatmentParsed,
	TreatmentBiexpParam,
	isAnnouncementTreatment,
} from './Types';
import getLogger, { getDeltaMinutes } from './utils';

export const drugs = {
	GLA: {
		names: ['gla', 'Gla', 'lan', 'Lan'],
		peak: (duration: number) => duration / 2.5,
		units: (units: number) => units,
		duration: (units: number, weight: number) =>
			(22 + (12 * units) / weight) * 60,
	},
	DET: {
		names: ['det', 'Det', 'lev', 'Lev'],
		peak: (duration: number) => duration / 3,
		units: (units: number) => units,
		duration: (units: number, weight: number) =>
			(14 + (24 * units) / weight) * 60,
	},
	TOU: {
		names: ['Tou', 'tou'],
		peak: (duration: number) => duration / 2.5,
		units: (units: number) => units,
		duration: (units: number, weight: number) =>
			(24 + (14 * units) / weight) * 60,
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
		duration: (units: number, weight: number) =>
			(12 + (20 * units) / weight) * 60,
	},
	COR: {
		names: ['pre', 'Pre', 'cor', 'Cor'],
		peak: (duration: number) => duration / 3,
		units: (insulin: number) => insulin,
		duration: (insulin: number, weight: number) =>
			(16 + (12 * insulin) / weight) * 60,
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

export const getTreatmentBiexpParam = (
	treatments: NSTreatmentParsed[],
	weight: number,
	drug: keyof typeof drugs,
): TreatmentBiexpParam[] => {
	const currentDrug = drugs[drug];
	return treatments
		.filter((e) => currentDrug.names.some((n) => n === e.drug))
		.map((e) => {
			const duration = currentDrug.duration(e.units, weight);
			const peak = currentDrug.peak(duration);
			const units = currentDrug.units(e.units);
			const minutesAgo = e.minutesAgo;
			return {
				minutesAgo,
				units,
				duration,
				peak,
			};
		});
};

export function transformNoteTreatmentsDrug(
	treatments: NSTreatment[],
): NSTreatmentParsed[] {
	return treatments && treatments.length
		? treatments
				?.filter(isAnnouncementTreatment)
				.filter((e) => e.notes)
				.map((e) => {
					const lastIndexEmptySpace = e.notes.lastIndexOf(' ');
					getLogger().debug(
						'treatments %o',
						parseFloat(e.notes.slice(lastIndexEmptySpace)),
					);
					return {
						minutesAgo: getDeltaMinutes(e.created_at),
						drug: e.notes.slice(0, 3),
						units: parseFloat(e.notes.slice(lastIndexEmptySpace)) || 0,
					};
				})
				.filter((e) => e.minutesAgo >= 0)
		: [];
}
