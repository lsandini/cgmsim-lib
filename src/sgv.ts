import * as moment from 'moment';
// import pump from './pump.js';

import logger from './utils';
import { CGMSimParams, Sgv } from './Types';
import { getDeltaMinutes } from './utils';

//const logger = pino();
const sgv_start = (
	entries: Sgv[],
	{
		basalActivity,
		liverActivity,
		carbsActivity,
		bolusActivity,
		cortisoneActivity,
	}: CGMSimParams,
	isf: number
) => {
	const oldSgv = entries && entries[0] ? entries[0].sgv : 90;
	const deltaMinutes =
		entries && entries[0] ? getDeltaMinutes(entries[0].mills) : 1;

	logger.debug('deltaMinutes %o', deltaMinutes);

	const isfMMol = isf / 18; //(mmol/l)/U
	//logger.debug('ISF= %o', ISF);

	// ENABLE THIS FOR PUMP SIMULATION
	//=================================

	const basalDeltaMinutesActivity = basalActivity * deltaMinutes;
	const cortisoneDeltaMinutesActivity = cortisoneActivity
		? cortisoneActivity * deltaMinutes
		: 0;
	const bolusDeltaMinutesActivity = bolusActivity * deltaMinutes;

	const globalInsulinAct =
		basalDeltaMinutesActivity + bolusDeltaMinutesActivity; //U/min

	const BGI_ins = globalInsulinAct * isfMMol * -1; //mmol/l

	const liverDeltaMinutesActivity = liverActivity * deltaMinutes; //mmol/l

	const carbsDeltaMinutesActivity = carbsActivity * deltaMinutes;

	const sgv_pump = Math.floor(
		oldSgv +
			BGI_ins * 18 +
			liverDeltaMinutesActivity * 18 +
			carbsDeltaMinutesActivity * 18 +
			cortisoneDeltaMinutesActivity * 18
	);
	let limited_sgv_pump = sgv_pump;
	if (sgv_pump >= 400) {
		limited_sgv_pump = 400;
	} else if (sgv_pump <= 40) {
		limited_sgv_pump = 40;
	}
	const dict = {
		sgv: limited_sgv_pump,
		deltaMinutes,
		carbsActivity: carbsDeltaMinutesActivity * 18,
		basalActivity: basalDeltaMinutesActivity * isfMMol * 18,
		cortisoneActivity: cortisoneDeltaMinutesActivity * isfMMol * 18,
		bolusActivity: bolusDeltaMinutesActivity * isfMMol * 18,
		liverActivity: liverDeltaMinutesActivity * 18,
	};

	logger.debug('-------------------------------------------');
	logger.debug(
		'OLD SGV value (' + deltaMinutes + ' minutes ago): %o',
		oldSgv,
		'mg/dl'
	);

	logger.debug('-------------------------------------------');
	logger.debug(
		'total BG impact of insulin for ' + deltaMinutes + ' minutes: %o',
		BGI_ins * 18,
		'mg/dl'
	);

	logger.debug('-------------------------------------------');
	logger.debug(
		'total BG impact of liver for ' + deltaMinutes + ' minutes: + %o',
		liverDeltaMinutesActivity * 18,
		'mg/dl'
	);

	logger.debug('-------------------------------------------');
	logger.debug(
		'total BG impact of cortisone for 5 minutes: + %o',
		cortisoneDeltaMinutesActivity * 18,
		'mg/dl'
	);


	logger.debug('-------------------------------------------');
	logger.debug(
		'total CARBS impact of carbs for ' + deltaMinutes + ' minutes: + %o',
		carbsActivity * 18,
		'mg/dl'
	);

	logger.debug('-------------------------------------------');
	logger.debug(
		'total BG impact of carbs, liver and insulin for 5 minutes: + %o',
		BGI_ins + liverDeltaMinutesActivity * 18 + carbsActivity * 18,
		'mg/dl'
	);


	logger.debug(
		'this is the BASAL BOLUS  insulin impact for ' +
			deltaMinutes +
			' minutes: %o',
		basalActivity * deltaMinutes * 18 * isfMMol
	);
	logger.debug(
		'this is the MEAL BOLUS insulin impact for ' +
			deltaMinutes +
			' minutes: %o',
		bolusActivity * deltaMinutes * 18 * isfMMol
	);
	logger.info('this is the simulator result: %o', dict);

	return dict;
};

export default sgv_start;
