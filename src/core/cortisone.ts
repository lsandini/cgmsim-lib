import { TreatmentExpParam, NSTreatmentParsed } from './types';
import { getTreatmentExpParam } from './drug';
import logger from './logger';
import { getExpTreatmentActivity, roundTo8Decimals } from './utils';

const calculateCortisoneActivity = (treatments: TreatmentExpParam[]): number => {
	return treatments
		.map(getExpTreatmentActivity)
		.reduce((totalActivity, currentActivity) => totalActivity + currentActivity, 0);
};

export default function calculateFinalCortisoneActivity(treatments: NSTreatmentParsed[], weightKg: number): number {
	const recentCortisoneTreatments = getTreatmentExpParam(treatments, weightKg, 'COR');
	const cortisoneActivity =
		recentCortisoneTreatments.length > 0 ? calculateCortisoneActivity(recentCortisoneTreatments) : 0;
	logger.debug('[cortisone] Recent cortisone treatments:', {
		treatments: recentCortisoneTreatments,
		activity: cortisoneActivity,
	});

	return roundTo8Decimals(cortisoneActivity / 2);
}
