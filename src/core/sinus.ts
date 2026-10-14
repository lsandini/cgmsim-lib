import logger from './logger';
import { getTimeComponentsInTimezone } from './utils';

const HOURS_PER_CYCLE = 12; // 12 hours in a cycle
const AMPLITUDE_FACTOR = 0.2; // 20% amplitude

export default function calculateCircadianComponents(timezone: string) {
	const { decimalHours, hours, minutes } = getTimeComponentsInTimezone(timezone);
	logger.debug('[sinus] Current decimal time: %o', decimalHours.toFixed(2));
	logger.debug('[sinus] Time components - Hours: %o, Minutes: %o', hours, minutes);

	const cyclePosition = (decimalHours * Math.PI) / HOURS_PER_CYCLE;
	logger.debug('[sinus] Cycle position (radians): %o', cyclePosition.toFixed(2));

	const dayCycleDeg = (decimalHours * 360) / 24;
	logger.debug('[sinus] time of the day in 360 deg cycle %o', dayCycleDeg.toFixed(2));

	const sinFunction = Math.sin((dayCycleDeg * Math.PI) / 180);
	const sinCorr = sinFunction * AMPLITUDE_FACTOR + 1;

	const cosinFunction = Math.cos((dayCycleDeg * Math.PI) / 180);
	const COScorr = cosinFunction * AMPLITUDE_FACTOR + 1;

	const sinCurves = {
		sinus: sinCorr,
		cosinus: COScorr,
	};

	logger.debug('[sinus] sin cosin curves result: %o', sinCurves);

	return sinCurves;
}
