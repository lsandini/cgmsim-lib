import { TreatmentDrug } from './Types';

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
	COR: {
		names: ['pre', 'Pre', 'cor', 'Cor'],
		peak: (duration: number) => duration / 3,
		duration: (insulin: number, weight: number) =>
			(16 + (12 * insulin) / weight) * 60,
	},
};

export const getDrugActivity = (
	treatments: TreatmentDrug[],
	weight: number,
	drug: keyof typeof drugs
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
