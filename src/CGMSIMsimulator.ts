import logger from './utils';

import bolus from './bolus';
import basal from './basal';
import cortisone from './cortisone';

import carbs from './carbs';
import arrowsRun from './arrows';
import liverRun from './liver';
import sgv from './sgv';
import pump from './pump';
import { MainParams, SimulationResult } from './Types';
import moment = require('moment');
import { physicalIsf, physicalLiver } from './physical';
/**
 * Simulation module for blood glucose data calculation.
 * @param params - Main parameters for running the simulation.
 * @returns Simulation result containing blood glucose data and other parameters.
 */
const simulator = (params: MainParams): SimulationResult => {
	const {
		env,
		entries,
		treatments,
		profiles, //PUMP SIMULATION
		pumpEnabled,
		activities, //7-DAYS
		user,
	} = params;
	logger.info('Run Init CGMSim NSUrl:%o', user.nsUrl);

	if (!treatments) {
		throw new Error('treatments is ' + treatments);
	}
	if (!profiles) {
		throw new Error('profiles is ' + profiles);
	}

	const isfConstant = parseInt(env.ISF);
	const age = parseInt(env.AGE);
	const gender = env.GENDER;

	let isfActivityDependent = isfConstant;
	let activityFactor = 1;
	if (isfActivityDependent < 9) {
		throw new Error('Isf must be greater then or equal to 9');
	}
	if (activities && activities.length > 0) {
		isfActivityDependent = isfConstant * physicalIsf(activities, age, gender);
		activityFactor = physicalLiver(activities, age, gender);
	}

	const weight = parseInt(env.WEIGHT);
	const dia = parseInt(env.DIA);
	const peak = parseInt(env.TP);
	const carbsAbs = parseInt(env.CARBS_ABS_TIME);
	const cr = parseInt(env.CR);

	const bolusActivity = bolus(treatments, dia, peak);
	const basalBolusActivity = basal(treatments, weight);
	const cortisoneActivity = cortisone(treatments, weight);
	const basalPumpActivity = pumpEnabled
		? pump(treatments, profiles, dia, peak)
		: 0;
	const carbsActivity = carbs(treatments, carbsAbs, isfActivityDependent, cr);

	// //activity calc insulin
	// const det = detemirRun(weight, lastDET);
	// const gla = glargineRun(weight, lastGLA);
	// const degludec = degludecRun(lastDEG);
	// const tou = toujeoRun(weight, lastTOU);

	//activity calc carb
	const liverActivity = liverRun(isfConstant, cr, activityFactor);
	const now = moment();
	const orderedEntries = entries
		.filter((e) => e.mills <= now.toDate().getTime())
		.sort((a, b) => b.mills - a.mills);

	const newSgvValue = sgv(
		orderedEntries,
		{
			basalActivity: basalBolusActivity + basalPumpActivity,
			liverActivity,
			carbsActivity,
			bolusActivity,
			cortisoneActivity
		},
		isfActivityDependent
	);

	logger.debug('this is the new sgv: %o', newSgvValue);
	logger.info(
		'this is the ISF multiplicator (or physicalISF): %o',
		isfActivityDependent / isfConstant
	);
	logger.info(
		'this is the liver multiplicator (or physicalLiver): %o',
		activityFactor
	);

	// const arrows = arrowsRun([newSgvValue, ...entries]);

	return {
		...newSgvValue,
		activityFactor,
		isf: { dynamic: isfActivityDependent, constant: isfConstant },
	};
};

export default simulator;
