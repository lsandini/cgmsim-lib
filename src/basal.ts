import { TreatmentExpParam, NSTreatmentParsed } from './Types';
import { TreatmentExpParamGroups, groupTreatmentExpParams } from './drug';
import logger, { getExpTreatmentActivity, getExpTreatmentIOB, roundTo8Decimals } from './utils';

type BasalCalculation = {
	activity: number;
	iob: number;
};

const basalDrugKeys = ['GLA', 'DET', 'TOU', 'DEG', 'NPH'] as const;

/**
 * Calculates the basal insulin activity per minute for a given set of treatments
 * @param treatments - Array of insulin treatments
 * @returns Total basal activity in Units/minute
 */
const calculateBasalActivityPerMinute = (treatments: TreatmentExpParam[]): number => {
	// Calculate total activity by summing up individual treatment activities
	return treatments.map(getExpTreatmentActivity).reduce((total, activity) => total + activity, 0);
};

// New function for IOB calculation
const calculateBasalIOB = (treatments: TreatmentExpParam[]): number => {
	return treatments.map(getExpTreatmentIOB).reduce((total, iob) => total + iob, 0);
};

export function calculateTotalBasalActivityAndIOB(drugParams: TreatmentExpParamGroups): BasalCalculation {
	const totals = basalDrugKeys.reduce(
		(total, drug) => {
			const treatments = drugParams[drug];
			const activity = treatments.length ? calculateBasalActivityPerMinute(treatments) : 0;
			const iob = treatments.length ? calculateBasalIOB(treatments) : 0;

			logger.debug(`[basal] ${drug} insulin calculation:`, {
				activeTreatments: treatments,
				activity,
				iob,
			});

			return {
				activity: total.activity + activity,
				iob: total.iob + iob,
			};
		},
		{ activity: 0, iob: 0 },
	);

	return {
		activity: roundTo8Decimals(totals.activity),
		iob: roundTo8Decimals(totals.iob),
	};
}

/**
 * Calculates the total basal insulin activity from all active insulin types
 * @param treatments - Array of parsed insulin treatments
 * @param weight - Patient's weight
 * @returns Total basal activity in Units/minute, rounded to 8 decimal places
 */
export default function calculateTotalBasalActivity(treatments: NSTreatmentParsed[], weight: number): number {
	return calculateTotalBasalActivityAndIOB(groupTreatmentExpParams(treatments, weight)).activity;
}

// New function for total basal IOB
export function calculateTotalBasalIOB(treatments: NSTreatmentParsed[], weight: number): number {
	return calculateTotalBasalActivityAndIOB(groupTreatmentExpParams(treatments, weight)).iob;
}
