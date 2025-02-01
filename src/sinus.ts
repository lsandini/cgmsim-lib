// this computes a sinusoidal curve from midnight to midnight, oscillating between 5 and 6 mmol/l
import logger from './utils';

interface TimeComponents {
	decimalHours: number;
	hours: number;
	minutes: number;
}

/**
 * Constants for circadian rhythm calculations
 */

const HOURS_PER_CYCLE = 12; //	12 hours in a cycle
const MINUTES_PER_HOUR = 60; // 60 minutes in an hour
const AMPLITUDE_FACTOR = 0.2; // 20% amplitude

/**
 * Converts current time to decimal hours in specified timezone
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Object containing time components
 */
function getTimeComponentsInTimezone(timezone: string): TimeComponents {
	const currentTime = Date.now();
	const hoursString = new Date(currentTime).toLocaleString('en-US', {
		timeZone: timezone,
		hour: 'numeric',
		hour12: false,
	});
	const minutesString = new Date(currentTime).toLocaleString('en-US', {
		timeZone: timezone,
		minute: 'numeric',
	});

	const hours = parseInt(hoursString);
	const minutes = parseInt(minutesString);
	const decimalHours = hours + minutes / MINUTES_PER_HOUR;

	return { decimalHours, hours, minutes };
}

/**
 * Calculates circadian rhythm components for glucose modeling
 * @param timezone - IANA timezone string
 * @returns Object containing sinus and cosinus values
 */
export default function calculateCircadianComponents(timezone: string) {
	// Get current time components
	const { decimalHours, hours, minutes } = getTimeComponentsInTimezone(timezone);
	logger.debug('[sinus] Current decimal time: %o', decimalHours.toFixed(2));
	logger.debug('[sinus] Time components - Hours: %o, Minutes: %o', hours, minutes);

	// Calculate 2π cycle position (24 hours = 2π)
	const cyclePosition = (decimalHours * Math.PI) / HOURS_PER_CYCLE;
	logger.debug('[sinus] Cycle position (radians): %o', cyclePosition.toFixed(2));

	// time of the day in 360 deg cycle;
	const dayCycleDeg = (decimalHours * 360) / 24;
	logger.debug('[sinus] time of the day in 360 deg cycle %o', dayCycleDeg.toFixed(2));

	//==========================================================================================
	// value of the sin function oscillating around 1, +/- 20 %
	//==========================================================================================
	const sinFunction = Math.sin((dayCycleDeg * Math.PI) / 180);
	const sinCorr = sinFunction * AMPLITUDE_FACTOR + 1;
	logger.debug(
		'[sinus] value of the sin function oscillating around 1, +/- 20 %, starting from 1 and ending in 1: %o',
		sinCorr.toFixed(2),
	);
	logger.debug(
		'[sinus] When the time of day is ' +
			decimalHours.toFixed() +
			' hours and ' +
			minutes.toFixed() +
			' minutes, the sinusoidal value is: ' +
			sinCorr.toFixed(3),
	);

	//==========================================================================================
	// value of the cos function oscillating around 1, +/- 20 %
	//==========================================================================================
	const cosinFunction = Math.cos((dayCycleDeg * Math.PI) / 180);
	const COScorr = cosinFunction * AMPLITUDE_FACTOR + 1;
	logger.debug(
		'[sinus] value of the cos function oscillating around 1, +/- 0.5, starting from 1.5 and ending in 1.5: %o',
		COScorr.toFixed(2),
	);
	logger.debug(
		'[sinus] When the time of day is ' +
			decimalHours.toFixed() +
			' hours and ' +
			minutes.toFixed() +
			' minutes, the cosinusoidal value is: ' +
			COScorr.toFixed(3),
	);

	const sinCurves = {
		sinus: sinCorr,
		cosinus: COScorr,
	};

	logger.debug('[sinus] sin cosin curves result: %o', sinCurves);

	return sinCurves;
}
