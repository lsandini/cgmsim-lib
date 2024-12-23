import sinusRun from './sinus';
import logger from './utils';

export default function (
	isfConstant: number,
	cr: number,
	activities: { physical: number; alcohol: number },
	weight: number,
	timeZone: string,
): number {
	const _ISF = isfConstant;
	const _CR = cr;
	const activityFactor = activities?.physical >= 0 ? activities.physical : 1;
	const alcoholFactor = activities?.alcohol >= 0 ? activities.alcohol : 1;
	const { sinus } = sinusRun(timeZone);
	const CF = _ISF / _CR;
	const glucosePerMinute = 0.002 * weight;
	const liver = alcoholFactor * activityFactor * CF * glucosePerMinute; //(mmols/l)/min

	const liver_sin = liver * sinus;
	logger.debug('liver:  %o', liver);
	logger.debug('liver_sin:  %o', liver_sin);

	return liver_sin; //(mmol/l)/min
}
