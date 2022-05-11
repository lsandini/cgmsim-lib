import * as moment from 'moment';
// import pump from './pump.js';

import logger from './utils';
import { CGMSimParams, Perlin, Sgv } from './Types';
import { getDeltaMinutes } from './utils';

//const logger = pino();
const sgv_start = (entries: Sgv[], { det, gla, degludec, tou, liver, carbs, resultAct }: CGMSimParams, perls: Perlin[], isf: number) => {

	const oldSgv = entries && entries[0] ? entries[0].sgv : 90;
	const deltaMinutes = getDeltaMinutes(entries[0].mills);

	logger.info('deltaMinutes %o', deltaMinutes);

	const isfMMol = isf / 18; //mmol/l/U
	//logger.info('ISF= %o', ISF);

	// ENABLE THIS FOR PUMP SIMULATION
	//=================================

	// logger.info('profiles %o', profiles);
	const pumpBasalAct = 0;
	// let pumpBasalAct = 0;
	// if (env.pumpEnabled) {
	//     pumpBasalAct = pump({
	//         treatments,
	//         profiles,
	//         pumpBasals,
	//     }, env);
	// }

	const globalBasalAct = gla + det + tou + degludec;

	const globalMealtimeAct = resultAct;

	const globalInsulinAct = globalBasalAct + globalMealtimeAct + pumpBasalAct;

	const BGI_ins = (globalInsulinAct * deltaMinutes * isfMMol) * -1;

	const today = new Date();

	const liver_bgi = liver * deltaMinutes;

	const lastPerls = perls.filter(function (e) {
		const delta =getDeltaMinutes(e.time);
		return delta >= 0 && delta <= 5; // keep only the latest noise value
	});

	const noise = lastPerls && lastPerls.length > 0 ? (lastPerls[0].noise * 6) : 0;

	const sgv_pump = Math.floor(oldSgv + (BGI_ins * 18) + (liver_bgi * 18) + (carbs * 18) + (noise * 18));
	let limited_sgv_pump = sgv_pump;
	if (sgv_pump >= 400) {
		limited_sgv_pump = 400;
	} else if (sgv_pump <= 40) {
		limited_sgv_pump = 40;
	}
	const dict = {
		dateString: today,
		sgv: limited_sgv_pump,
		type: 'sgv',
		date: Date.now(),
	};

	logger.info('-------------------------------------------');
	logger.info('OLD SGV value (' + deltaMinutes + ' minutes ago): %o', oldSgv, 'mg/dl');

	logger.info('-------------------------------------------');
	logger.info('total BG impact of insulin for ' + deltaMinutes + ' minutes: %o', BGI_ins * 18, 'mg/dl');

	logger.info('-------------------------------------------');
	logger.info('total BG impact of liver for ' + deltaMinutes + ' minutes: + %o', liver_bgi * 18, 'mg/dl');

	logger.info('-------------------------------------------');
	logger.info('total CARBS impact of carbs for ' + deltaMinutes + ' minutes: + %o', carbs * 18, 'mg/dl');

	logger.info('-------------------------------------------');
	logger.info('total NOISE impact: + %o', noise * 18, 'mg/dl');

	logger.info('-------------------------------------------');
	logger.info('total BG impact of carbs, liver and insulin for 5 minutes: + %o', (BGI_ins) + (liver_bgi * 18) + (carbs * 18), 'mg/dl');

	logger.info('this is the PUMP BASAL insulin impact for ' + deltaMinutes + ' minutes: %o', pumpBasalAct * deltaMinutes * 18 * isfMMol);
	logger.info('this is the BASAL BOLUS  insulin impact for ' + deltaMinutes + ' minutes: %o', globalBasalAct * deltaMinutes * 18 * isfMMol);
	logger.info('this is the MEAL BOLUS insulin impact for ' + deltaMinutes + ' minutes: %o', globalMealtimeAct * deltaMinutes * 18 * isfMMol);

	return dict;
};

export default sgv_start;