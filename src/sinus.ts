// this computes a sinusoidal curve from midnight to midnight, oscillating between 5 and 6 mmol/l
import logger from './utils';

//const logger = pino();

export default function (now: number) {
	
	//timestamp in milliseconds;
	logger.info('timestamp in milliseconds', now);

	// timestamp in days;
	logger.info('timestamp in days', now / 86400000);

	// timestamp in days rounded;
	logger.info('timestamp in days rounded', Math.floor(now / 86400000));

	//timestamp in fraction of a day;
	logger.info('timestamp in fraction of a day', (now / 86400000) - (Math.floor(now / 86400000)));

	//fraction of a day in hours;
	logger.info('fraction of a day in hours', ((now / 86400000) - (Math.floor(now / 86400000))) * 24);

	//fraction of a day in hours adding 2 for UTC+2;
	logger.info('fraction of a day in hours adding 2 for UTC+2', (((now / 86400000) - (Math.floor(now / 86400000))) * 24) + 2);

	// time of the day in hours - decimals, not minutes
	const hours = ((((now / 86400000) - (Math.floor(now / 86400000))) * 24) + 2);
	logger.info('time of the day in hours - using decimals, not minutes: ', hours.toFixed(2));

	// express minutes also;
	const hoursAbs = Math.floor(hours);
	const minutes = (hours - hoursAbs) * 60;
	logger.info('express minutes in minutes also:', minutes.toFixed(), 'minutes');

	// time of the day in 2 pi cycle;
	const daycycle = ((hours * Math.PI) / 12);
	logger.info('time of the day in 2 pi cycle', daycycle.toFixed(2));

	// time of the day in 360 deg cycle;
	const dayCycleDeg = ((hours * 360) / 24);
	logger.info('time of the day in 360 deg cycle', dayCycleDeg.toFixed(2));

	// value of the sin function according to hours, oscillating from -1 to +1;
	const SIN = Math.sin(dayCycleDeg * Math.PI / 180);
	logger.info('value of the sin function according to hours, oscillating from -1 to +1: ', SIN.toFixed(2));

	// value of the sin function oscillating between 0 and 2;
	const sinInterm = (Math.sin(dayCycleDeg * Math.PI / 180) + 1);
	logger.info('value of the sin function oscillating between 0 and 2: ', sinInterm.toFixed(2));





	//==========================================================================================
	// value of the sin function oscillating around 1, +/- 20 %
	//==========================================================================================
	const sinFunction = (Math.sin(dayCycleDeg * Math.PI / 180));
	const sinCorr = (sinFunction / 5) + 1;
	logger.info('value of the sin function oscillating around 1, +/- 20 %, starting from 1 and ending in 1: ', sinCorr.toFixed(2));
	logger.info('When the time of day is ' + hours.toFixed() + ' hours and ' + minutes.toFixed() + ' minutes, the sinusoidal value is: ' + sinCorr.toFixed(3));



	//==========================================================================================
	// value of the cos function oscillating around 1, +/- 20 %
	//==========================================================================================
	const cosinFunction = (Math.cos(dayCycleDeg * Math.PI / 180));
	const COScorr = (cosinFunction / 5) + 1;
	logger.info('value of the cos function oscillating around 1, +/- 0.5, starting from 1.5 and ending in 1.5: : ', COScorr.toFixed(2));
	logger.info('When the time of day is ' + hours.toFixed() + ' hours and ' + minutes.toFixed() + ' minutes, the cosinusoidal value is: ' + COScorr.toFixed(3));

	const sinCurves = {
		sinus: sinCorr,
		cosinus: COScorr
	};

	return sinCurves;
}