import { TreatmentExpParam, NSTreatmentParsed } from './Types';
import { getTreatmentExpParam } from './drug';
import logger, { getExpTreatmentActivity, getExpTreatmentIOB, roundTo8Decimals } from './utils';

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

/**
 * Calculates the total basal insulin activity from all active insulin types
 * @param treatments - Array of parsed insulin treatments
 * @param weight - Patient's weight
 * @returns Total basal activity in Units/minute, rounded to 8 decimal places
 */
export default function calculateTotalBasalActivity(treatments: NSTreatmentParsed[], weight: number): number {
	// Calculate activity for Glargine insulin
	const lastGlargine = getTreatmentExpParam(treatments, weight, 'GLA');
	const glargineActivity = lastGlargine.length ? calculateBasalActivityPerMinute(lastGlargine) : 0;
	logger.debug('[basal] Glargine insulin activity:', {
		activeGlargineTreatments: lastGlargine,
		totalGlargineActivity: glargineActivity,
	});

	// Calculate activity for Detemir insulin
	const lastDetemir = getTreatmentExpParam(treatments, weight, 'DET');
	const detemirActivity = lastDetemir.length ? calculateBasalActivityPerMinute(lastDetemir) : 0;
	logger.debug('[basal] Detemir insulin activity:', {
		activeDetemirTreatments: lastDetemir,
		totalDetemirActivity: detemirActivity,
	});

	// Calculate activity for Toujeo insulin
	const lastToujeo = getTreatmentExpParam(treatments, weight, 'TOU');
	const toujeoActivity = lastToujeo.length ? calculateBasalActivityPerMinute(lastToujeo) : 0;
	logger.debug('[basal] Toujeo insulin activity:', {
		activeToujeoTreatments: lastToujeo,
		totalToujeoActivity: toujeoActivity,
	});

	// Calculate activity for Degludec insulin
	const lastDegludec = getTreatmentExpParam(treatments, weight, 'DEG');
	const degludecActivity = lastDegludec.length ? calculateBasalActivityPerMinute(lastDegludec) : 0;
	logger.debug('[basal] Degludec insulin activity:', {
		activeDegludecTreatments: lastDegludec,
		totalDegludecActivity: degludecActivity,
	});

	// Calculate activity for NPH insulin
	const lastNPH = getTreatmentExpParam(treatments, weight, 'NPH');
	const nphActivity = lastNPH.length ? calculateBasalActivityPerMinute(lastNPH) : 0;
	logger.debug('[basal] NPH insulin activity:', {
		activeNPHTreatments: lastNPH,
		totalNPHActivity: nphActivity,
	});

	// Sum and round all insulin activities
	return roundTo8Decimals(degludecActivity + detemirActivity + glargineActivity + toujeoActivity + nphActivity);
}


// New function for total basal IOB
export function calculateTotalBasalIOB(treatments: NSTreatmentParsed[], weight: number): number {
  // Get IOB for each insulin type
  const lastGlargine = getTreatmentExpParam(treatments, weight, 'GLA');
  const glargineIOB = lastGlargine.length ? calculateBasalIOB(lastGlargine) : 0;
  logger.debug('[basal] Glargine insulin IOB:', {
      activeGlargineTreatments: lastGlargine,
      glargineIOB
  });

  const lastDetemir = getTreatmentExpParam(treatments, weight, 'DET');
  const detemirIOB = lastDetemir.length ? calculateBasalIOB(lastDetemir) : 0;
  logger.debug('[basal] Detemir insulin IOB:', {
      activeDetemirTreatments: lastDetemir,
      detemirIOB
  });

  const lastToujeo = getTreatmentExpParam(treatments, weight, 'TOU');
  const toujeoIOB = lastToujeo.length ? calculateBasalIOB(lastToujeo) : 0;
  logger.debug('[basal] Toujeo insulin IOB:', {
      activeToujeoTreatments: lastToujeo,
      toujeoIOB
  });

  const lastDegludec = getTreatmentExpParam(treatments, weight, 'DEG');
  const degludecIOB = lastDegludec.length ? calculateBasalIOB(lastDegludec) : 0;
  logger.debug('[basal] Degludec insulin IOB:', {
      activeDegludecTreatments: lastDegludec,
      degludecIOB
  });

  const lastNPH = getTreatmentExpParam(treatments, weight, 'NPH');
  const nphIOB = lastNPH.length ? calculateBasalIOB(lastNPH) : 0;
  logger.debug('[basal] NPH insulin IOB:', {
      activeNPHTreatments: lastNPH,
      nphIOB
  });

  const totalIOB = roundTo8Decimals(degludecIOB + detemirIOB + glargineIOB + toujeoIOB + nphIOB);
  logger.debug('[basal] Total basal insulin IOB:', totalIOB);
  
  return totalIOB;
}