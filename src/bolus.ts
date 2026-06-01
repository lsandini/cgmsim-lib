import logger, { getDeltaMinutes, getExpTreatmentActivity, getExpTreatmentIOB, roundTo8Decimals } from './utils';
import { NSTreatment, isMealBolusTreatment } from './Types';

type ActiveBolusInsulin = {
	minutesAgo: number;
	insulin: number;
};

type BolusCalculation = {
	activity: number;
	iob: number;
};

function getActiveBolusInsulin(treatments: NSTreatment[]): ActiveBolusInsulin[] {
	return (
		treatments
			?.filter(isMealBolusTreatment)
			.filter((treatment) => treatment?.insulin > 0)
			.map((treatment) => ({
				minutesAgo: getDeltaMinutes(treatment.created_at),
				insulin: treatment.insulin,
			}))
			.filter((bolus) => bolus.minutesAgo <= 300 && bolus.minutesAgo >= 0) || []
	);
}

function calculateBolusActivityFromActive(activeBolusInsulin: ActiveBolusInsulin[], dia: number, peak: number): number {
	const durationInMinutes = dia * 60;
	const totalBolusActivity = activeBolusInsulin.reduce((total, bolus) => {
		return (
			total +
			getExpTreatmentActivity({
				peak,
				duration: durationInMinutes,
				minutesAgo: bolus.minutesAgo,
				units: bolus.insulin,
			})
		);
	}, 0);

	logger.debug('[bolus] Total bolus insulin activity:', totalBolusActivity);
	return roundTo8Decimals(totalBolusActivity);
}

function calculateBolusIOBFromActive(activeBolusInsulin: ActiveBolusInsulin[], dia: number, peak: number): number {
	const durationInMinutes = dia * 60;
	const totalBolusIOB = activeBolusInsulin.reduce((total, bolus) => {
		return (
			total +
			getExpTreatmentIOB({
				peak,
				duration: durationInMinutes,
				minutesAgo: bolus.minutesAgo,
				units: bolus.insulin,
			})
		);
	}, 0);

	logger.debug('[bolus] Total bolus insulin IOB:', totalBolusIOB);
	return roundTo8Decimals(totalBolusIOB);
}

export function calculateBolusActivityAndIOB(treatments: NSTreatment[], dia: number, peak: number): BolusCalculation {
	const activeBolusInsulin = getActiveBolusInsulin(treatments);

	logger.debug('[bolus] Active bolus treatments:', activeBolusInsulin);
	logger.debug('[bolus] Number of active boluses:', activeBolusInsulin.length);

	return {
		activity: calculateBolusActivityFromActive(activeBolusInsulin, dia, peak),
		iob: calculateBolusIOBFromActive(activeBolusInsulin, dia, peak),
	};
}

/**
 * Calculates the total active bolus insulin
 * @param treatments - Array of insulin treatments
 * @param dia - Duration of Insulin Action in hours
 * @param peak - Time to peak insulin activity in minutes
 * @returns Total active bolus insulin in Units
 */
export default (treatments: NSTreatment[], dia: number, peak: number): number => {
	const activeBolusInsulin = getActiveBolusInsulin(treatments);

	logger.debug('[bolus] Active bolus treatments:', activeBolusInsulin);
	logger.debug('[bolus] Number of active boluses:', activeBolusInsulin.length);

	return calculateBolusActivityFromActive(activeBolusInsulin, dia, peak);
};

// New function for IOB calculation
export function calculateBolusIOB(treatments: NSTreatment[], dia: number, peak: number): number {
	const activeBolusInsulin = getActiveBolusInsulin(treatments);

	logger.debug('[bolus] Active bolus treatments for IOB:', activeBolusInsulin);

	return calculateBolusIOBFromActive(activeBolusInsulin, dia, peak);
}
