import sinusRun from './sinus';
import logger from './utils';

export default function (
	isfConstant: number,
	cr: number,
	activities: { physical: number; alcohol: number },
	weight: number,
	timeZone: string,
): number {
	const _ISF = isfConstant / 18;
	const _CR = cr;
	logger.debug('ISF:', isfConstant, 'CR: %o', cr);
	const activityFactor = activities?.physical >= 0 ? activities.physical : 1;
	let alcoholFactor = 1 - Math.max(0, Math.min(1, activities?.alcohol || 0));
	// the sinus and cosinus numbers vary around 1, from 0.5 to 1.5:
	// sin starts at 1.0 at midnight, is max at 6AM, is again 1 at 12 AM, and minimums at 0.5 a 6 PM
	// cosin starts at 1.5 at midnight, is 1 at 6AM, is minimus at 0.5 12 AM, and is 1 again at 6 PM

	const { sinus, cosinus } = sinusRun(timeZone);
	logger.debug('sinus:  %o', sinus);
	logger.debug('cosinus:  %o', cosinus);

	const CF = _ISF / _CR;
	// let's simulate the carb impact of the liver, producing 10g of carbs / hour
	// if the ISF is 2 mmol/l/U,
	// and the CR is 10g/U,
	// => the the CF (carb factor) is 0.2 mmol/l/ 1g
	// so the BG increases 2 mmol/l/h, (every time 10g of carbs are delivered)

	// 0.2 mmol/l/h *10g /12 periods => bgi every 5 minutes or 0,166666 mmol/l/5min

	// by multiplying the liver_bgi by the sin function, the liver loog glucose production varies in a sinusoidal
	// form, being maximal at 6 AM and minimal ad 6 PM
	const glucosePerMinute = 0.002 * weight;
	const liver = alcoholFactor * activityFactor * CF * glucosePerMinute; //(mmols/l)/min

	const liver_sin = liver * sinus;
	logger.debug('liver:  %o', liver);
	logger.debug('liver_sin:  %o', liver_sin);

	return liver_sin; //(mmol/l)/min
}
