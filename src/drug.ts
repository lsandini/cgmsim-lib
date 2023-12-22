import { Treatment, TreatmentDrug } from './Types';
import logger, { getDeltaMinutes } from './utils';

export const drugs = {
	GLA: {
		names: ['gla', 'Gla', 'lan', 'Lan'],
		peak: (duration: number) => duration / 2.5,
		duration: (units: number, weight: number) =>
			(22 + (12 * units) / weight) * 60,
	},
	DET: {
		names: ['det', 'Det', 'lev', 'Lev'],
		peak: (duration: number) => duration / 3,
		duration: (units: number, weight: number) =>
			(14 + (24 * units) / weight) * 60,
	},
	TOU: {
		names: ['Tou', 'tou'],
		peak: (duration: number) => duration / 2.5,
		duration: (units: number, weight: number) =>
			(24 + (14 * units) / weight) * 60,
	},
	DEG: {
		names: ['deg', 'Deg', 'tre', 'Tre'],
		peak: (duration: number) => duration / 3,
		duration: () => 42 * 60,
	},
	NPH: {
		names: ['pro', 'Pro', 'nph', 'Nph'],
		peak: (duration: number) => duration / 3.5,
		duration: (units: number, weight: number) =>
			(12 + (20 * units) / weight) * 60,
	},
	COR: {
		names: ['pre', 'Pre', 'cor', 'Cor'],
		peak: (duration: number) => duration / 3,
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
		duration: (drinks: number, weight: number) => {
			const _duration = ((40 * drinks) / weight) * 100;
			return _duration > 240 ? _duration : 240;
		},
	},
  BEER: {
		names: ['bee', 'Bee'],
		peak: (duration: number) => duration / 2.5,
		duration: (dL: number, weight: number) => {
			const drinks=dL/3.3;
			const _duration = ((40 * drinks) / weight) * 100; // when beer expressed in dL, 3.3dL = 1 drink
			return _duration > 240 ? _duration : 240;
		},
	},
};

export const getDrugActivity = (
	treatments: TreatmentDrug[],
	weight: number,
	drug: keyof typeof drugs,
) => {
	const currentDrug = drugs[drug];
	return treatments
		.filter((e) => currentDrug.names.some((n) => n === e.drug))
		.map((e) => {
			const duration = currentDrug.duration(e.units, weight);
			const peak = currentDrug.peak(duration);
			return {
				...e,
				units: e.units,
				duration,
				peak,
			};
		});
};
export function transformNoteTreatmentsDrug(
	treatments: Treatment[],
): TreatmentDrug[] {
	return treatments && treatments.length
		? treatments
				.filter((e) => e.notes)
				.map((e) => {
					const lastIndexEmptySpace = e.notes.lastIndexOf(' ');
					logger.debug(
						'treatments %o',
						parseInt(e.notes.slice(lastIndexEmptySpace), 10),
					);
					return {
						minutesAgo: getDeltaMinutes(e.created_at),
						drug: e.notes.slice(0, 3),
						units: parseInt(e.notes.slice(lastIndexEmptySpace), 10) || 0,
					};
				})
				.filter((e) => e.minutesAgo >= 0)
		: [];
}
