// this computes a sinusoidal curve from midnight to midnight, oscillating between 5 and 6 mmol/l
import logger from './utils';

//const logger = pino();

function getCurrentHourDecimalInTimezone(timezone) {
	const now = Date.now();
	const hours = new Date(now).toLocaleString('en-US', {
		timeZone: timezone,
		hour: 'numeric',
		hour12: false,
	});
	const minutes = new Date(now).toLocaleString('en-US', {
		timeZone: timezone,
		minute: 'numeric',
	});
	const time = parseFloat(hours) + parseFloat(minutes) / 60;
	return { time, hours: parseInt(hours), minutes: parseInt(minutes) };
}

export default function (timezone: string) {
	// time of the day in hours - decimals, not minutes
	const { time, minutes, hours } = getCurrentHourDecimalInTimezone(timezone);
	logger.debug(
		'time of the day in hours - using decimals, not minutes:  %o',
		time.toFixed(2),
	);

	// express minutes also;
	// const hoursAbs = Math.floor(hours);
	// const minutes = (hours - hoursAbs) * 60;

	logger.debug('express hours: %o', hours.toFixed(), 'minutes');
	logger.debug(
		'express minutes in minutes also: %o',
		minutes.toFixed(),
		'minutes',
	);

	// time of the day in 2 pi cycle;
	const dayCycle = (time * Math.PI) / 12;
	logger.debug('time of the day in 2 pi cycle %o', dayCycle.toFixed(2));

	// time of the day in 360 deg cycle;
	const dayCycleDeg = (time * 360) / 24;
	logger.debug('time of the day in 360 deg cycle %o', dayCycleDeg.toFixed(2));

	// value of the sin function according to hours, oscillating from -1 to +1;
	const SIN = Math.sin((dayCycleDeg * Math.PI) / 180);
	logger.debug(
		'value of the sin function according to hours, oscillating from -1 to +1:  %o',
		SIN.toFixed(2),
	);

	// value of the sin function oscillating between 0 and 2;
	const sinInterm = Math.sin((dayCycleDeg * Math.PI) / 180) + 1;
	logger.debug(
		'value of the sin function oscillating between 0 and 2:  %o',
		sinInterm.toFixed(2),
	);

	//==========================================================================================
	// value of the sin function oscillating around 1, +/- 20 %
	//==========================================================================================
	const sinFunction = Math.sin((dayCycleDeg * Math.PI) / 180);
	const sinCorr = sinFunction / 5 + 1;
	logger.debug(
		'value of the sin function oscillating around 1, +/- 20 %, starting from 1 and ending in 1:  %o',
		sinCorr.toFixed(2),
	);
	logger.debug(
		'When the time of day is ' +
			time.toFixed() +
			' hours and ' +
			minutes.toFixed() +
			' minutes, the sinusoidal value is: ' +
			sinCorr.toFixed(3),
	);

	//==========================================================================================
	// value of the cos function oscillating around 1, +/- 20 %
	//==========================================================================================
	const cosinFunction = Math.cos((dayCycleDeg * Math.PI) / 180);
	const COScorr = cosinFunction / 5 + 1;
	logger.debug(
		'value of the cos function oscillating around 1, +/- 0.5, starting from 1.5 and ending in 1.5: :  %o',
		COScorr.toFixed(2),
	);
	logger.debug(
		'When the time of day is ' +
			time.toFixed() +
			' hours and ' +
			minutes.toFixed() +
			' minutes, the cosinusoidal value is: ' +
			COScorr.toFixed(3),
	);

	const sinCurves = {
		sinus: sinCorr,
		cosinus: COScorr,
	};

	logger.debug('sin cosin curves result: %o', sinCurves);

	return sinCurves;
}
