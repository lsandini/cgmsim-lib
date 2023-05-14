// this computes a sinusoidal curve from midnight to midnight, oscillating between 5 and 6 mmol/l
import logger from './utils';

//const logger = pino();

export default function (now: number) {
	//timestamp in milliseconds;
	logger.debug('timestamp in milliseconds %o', now);

	// timestamp in days;
	logger.debug('timestamp in days %o', now / 86400000);

	// timestamp in days rounded;
	logger.debug('timestamp in days rounded %o', Math.floor(now / 86400000));

	//timestamp in fraction of a day;
	logger.debug(
		'timestamp in fraction of a day %o',
		now / 86400000 - Math.floor(now / 86400000)
	);

	//fraction of a day in hours;
	logger.debug(
		'fraction of a day in hours %o',
		(now / 86400000 - Math.floor(now / 86400000)) * 24
	);

	//fraction of a day in hours adding 2 for UTC+2;
	logger.debug(
		'fraction of a day in hours adding 2 for UTC+2 %o',
		(now / 86400000 - Math.floor(now / 86400000)) * 24 + 2
	);

	// time of the day in hours - decimals, not minutes
	const hours = (now / 86400000 - Math.floor(now / 86400000)) * 24 + 2;
	logger.debug(
		'time of the day in hours - using decimals, not minutes:  %o',
		hours.toFixed(2)
	);

	// express minutes also;
	const hoursAbs = Math.floor(hours);
	const minutes = (hours - hoursAbs) * 60;
	logger.debug(
		'express minutes in minutes also: %o',
		minutes.toFixed(),
		'minutes'
	);

	// time of the day in 2 pi cycle;
	const daycycle = (hours * Math.PI) / 12;
	logger.debug('time of the day in 2 pi cycle %o', daycycle.toFixed(2));

	// time of the day in 360 deg cycle;
	const dayCycleDeg = (hours * 360) / 24;
	logger.debug('time of the day in 360 deg cycle %o', dayCycleDeg.toFixed(2));

	// value of the sin function according to hours, oscillating from -1 to +1;
	const SIN = Math.sin((dayCycleDeg * Math.PI) / 180);
	logger.debug(
		'value of the sin function according to hours, oscillating from -1 to +1:  %o',
		SIN.toFixed(2)
	);

	// value of the sin function oscillating between 0 and 2;
	const sinInterm = Math.sin((dayCycleDeg * Math.PI) / 180) + 1;
	logger.debug(
		'value of the sin function oscillating between 0 and 2:  %o',
		sinInterm.toFixed(2)
	);

	//==========================================================================================
	// value of the sin function oscillating around 1, +/- 20 %
	//==========================================================================================
	const sinFunction = Math.sin((dayCycleDeg * Math.PI) / 180);
	const sinCorr = sinFunction / 5 + 1;
	logger.debug(
		'value of the sin function oscillating around 1, +/- 20 %, starting from 1 and ending in 1:  %o',
		sinCorr.toFixed(2)
	);
	logger.debug(
		'When the time of day is ' +
			hours.toFixed() +
			' hours and ' +
			minutes.toFixed() +
			' minutes, the sinusoidal value is: ' +
			sinCorr.toFixed(3)
	);

	//==========================================================================================
	// value of the cos function oscillating around 1, +/- 20 %
	//==========================================================================================
	const cosinFunction = Math.cos((dayCycleDeg * Math.PI) / 180);
	const COScorr = cosinFunction / 5 + 1;
	logger.debug(
		'value of the cos function oscillating around 1, +/- 0.5, starting from 1.5 and ending in 1.5: :  %o',
		COScorr.toFixed(2)
	);
	logger.debug(
		'When the time of day is ' +
			hours.toFixed() +
			' hours and ' +
			minutes.toFixed() +
			' minutes, the cosinusoidal value is: ' +
			COScorr.toFixed(3)
	);

	const sinCurves = {
		sinus: sinCorr,
		cosinus: COScorr,
	};

	logger.info('sin cosin curves result: %o', sinCurves);

	return sinCurves;
}
