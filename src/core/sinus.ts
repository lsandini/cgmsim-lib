import logger from './logger';

interface TimeComponents {
	decimalHours: number;
	hours: number;
	minutes: number;
}

const HOURS_PER_CYCLE = 12; // 12 hours in a cycle
const MINUTES_PER_HOUR = 60; // 60 minutes in an hour
const AMPLITUDE_FACTOR = 0.2; // 20% amplitude

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

	const hours = parseInt(hoursString, 10);
	const minutes = parseInt(minutesString, 10);
	const decimalHours = hours + minutes / MINUTES_PER_HOUR;

	return { decimalHours, hours, minutes };
}

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
