import { TreatmentExpParam, NSTreatmentParsed } from './types';
import { getTreatmentExpParam } from './drug';
import logger from './logger';
import { getExpTreatmentActivity, getExpTreatmentIOB, roundTo8Decimals } from './utils';

const calculateBasalActivityPerMinute = (treatments: TreatmentExpParam[]): number => {
	return treatments.map(getExpTreatmentActivity).reduce((total, activity) => total + activity, 0);
};

const calculateBasalIOB = (treatments: TreatmentExpParam[]): number => {
	return treatments.map(getExpTreatmentIOB).reduce((total, iob) => total + iob, 0);
};

export default function calculateTotalBasalActivity(treatments: NSTreatmentParsed[], weight: number): number {
	const lastGlargine = getTreatmentExpParam(treatments, weight, 'GLA');
	const glargineActivity = lastGlargine.length ? calculateBasalActivityPerMinute(lastGlargine) : 0;
	logger.debug('[basal] Glargine insulin activity:', {
		activeGlargineTreatments: lastGlargine,
		totalGlargineActivity: glargineActivity,
	});

	const lastDetemir = getTreatmentExpParam(treatments, weight, 'DET');
	const detemirActivity = lastDetemir.length ? calculateBasalActivityPerMinute(lastDetemir) : 0;
	logger.debug('[basal] Detemir insulin activity:', {
		activeDetemirTreatments: lastDetemir,
		totalDetemirActivity: detemirActivity,
	});

	const lastToujeo = getTreatmentExpParam(treatments, weight, 'TOU');
	const toujeoActivity = lastToujeo.length ? calculateBasalActivityPerMinute(lastToujeo) : 0;
	logger.debug('[basal] Toujeo insulin activity:', {
		activeToujeoTreatments: lastToujeo,
		totalToujeoActivity: toujeoActivity,
	});

	const lastDegludec = getTreatmentExpParam(treatments, weight, 'DEG');
	const degludecActivity = lastDegludec.length ? calculateBasalActivityPerMinute(lastDegludec) : 0;
	logger.debug('[basal] Degludec insulin activity:', {
		activeDegludecTreatments: lastDegludec,
		totalDegludecActivity: degludecActivity,
	});

	const lastNPH = getTreatmentExpParam(treatments, weight, 'NPH');
	const nphActivity = lastNPH.length ? calculateBasalActivityPerMinute(lastNPH) : 0;
	logger.debug('[basal] NPH insulin activity:', {
		activeNPHTreatments: lastNPH,
		totalNPHActivity: nphActivity,
	});

	return roundTo8Decimals(degludecActivity + detemirActivity + glargineActivity + toujeoActivity + nphActivity);
}

export function calculateTotalBasalIOB(treatments: NSTreatmentParsed[], weight: number): number {
	const lastGlargine = getTreatmentExpParam(treatments, weight, 'GLA');
	const glargineIOB = lastGlargine.length ? calculateBasalIOB(lastGlargine) : 0;
	logger.debug('[basal] Glargine insulin IOB:', {
		activeGlargineTreatments: lastGlargine,
		glargineIOB,
	});

	const lastDetemir = getTreatmentExpParam(treatments, weight, 'DET');
	const detemirIOB = lastDetemir.length ? calculateBasalIOB(lastDetemir) : 0;
	logger.debug('[basal] Detemir insulin IOB:', {
		activeDetemirTreatments: lastDetemir,
		detemirIOB,
	});

	const lastToujeo = getTreatmentExpParam(treatments, weight, 'TOU');
	const toujeoIOB = lastToujeo.length ? calculateBasalIOB(lastToujeo) : 0;
	logger.debug('[basal] Toujeo insulin IOB:', {
		activeToujeoTreatments: lastToujeo,
		toujeoIOB,
	});

	const lastDegludec = getTreatmentExpParam(treatments, weight, 'DEG');
	const degludecIOB = lastDegludec.length ? calculateBasalIOB(lastDegludec) : 0;
	logger.debug('[basal] Degludec insulin IOB:', {
		activeDegludecTreatments: lastDegludec,
		degludecIOB,
	});

	const lastNPH = getTreatmentExpParam(treatments, weight, 'NPH');
	const nphIOB = lastNPH.length ? calculateBasalIOB(lastNPH) : 0;
	logger.debug('[basal] NPH insulin IOB:', {
		activeNPHTreatments: lastNPH,
		nphIOB,
	});

	const totalIOB = roundTo8Decimals(degludecIOB + detemirIOB + glargineIOB + toujeoIOB + nphIOB);
	logger.debug('[basal] Total basal insulin IOB:', totalIOB);

	return totalIOB;
}
