import logger from './utils';
import bolus from './bolus';
import basal from './basal';
import cortisone from './cortisone';
import alcohol from './alcohol';
import carbs from './carbs';
import liverRun from './liver';
import sgv from './sgv';
import pump from './pump';
import { MainParams, SimulationResult } from './Types';
import moment = require('moment');
import { physicalIsf, physicalLiver } from './physical';
import { transformNoteTreatmentsDrug } from './drug';
/**
 * Simulation module for blood glucose data calculation.
 * @param params - Main parameters for running the simulation.
 * @returns Simulation result containing blood glucose data and other parameters.
 */
const simulator = (params: MainParams): SimulationResult => {
	const {
		patient,
		entries,
		treatments,
		profiles, //PUMP SIMULATION
		pumpEnabled,
		activities, //7-DAYS
		user,
	} = params;
	logger.info(user.nsUrl + ' Run Init CGMSim NSUrl:%o', user.nsUrl);

	if (!treatments) {
		throw new Error('treatments is ' + treatments);
	}
	if (!profiles) {
		throw new Error('profiles is ' + profiles);
	}

	const isfConstant = patient.ISF;
	const age = patient.AGE;
	const gender = patient.GENDER;
	const tz = patient?.TZ || 'UTC';

	let isfActivityDependent = isfConstant;
	let liverActivityFactor = 1;
	if (isfActivityDependent < 9) {
		throw new Error('Isf must be greater than or equal to 9');
	}
	if (activities && activities.length > 0) {
		isfActivityDependent = isfConstant * physicalIsf(activities, age, gender);
		liverActivityFactor = physicalLiver(activities, age, gender);
	}

	const weight = patient.WEIGHT;
	const dia = patient.DIA;
	const peak = patient.TP;
	const carbsAbs = patient.CARBS_ABS_TIME;
	const cr = patient.CR;

	//Find basal boluses
	const drugs = transformNoteTreatmentsDrug(treatments);

	const activeDrugTreatments = drugs.filter(function (e) {
		return e.minutesAgo <= 45 * 60; // keep only the basals from the last 45 hours
	});

	const bolusActivity = bolus(treatments, dia, peak);
	const basalBolusActivity = basal(activeDrugTreatments, weight);
	const cortisoneActivity = cortisone(activeDrugTreatments, weight);
	const alcoholActivity = alcohol(activeDrugTreatments, weight, gender);
	const basalPumpActivity = pumpEnabled
		? pump(treatments, profiles, dia, peak)
		: 0;
	const carbsActivity = carbs(treatments, carbsAbs, isfActivityDependent, cr);

	//activity calc carb
	const liverActivity = liverRun(
		isfConstant,
		cr,
		{
			physical: liverActivityFactor,
			alcohol: alcoholActivity,
		},
		weight,
		tz,
	);

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
			cortisoneActivity,
			alcoholActivity,
		},
		isfActivityDependent,
	);

	logger.info(user.nsUrl + 'this is the simulator result: %o', {
		...newSgvValue,
		physicalISF: isfActivityDependent / isfConstant,
		physicalLiver: liverActivityFactor,
	});

	// const arrows = arrowsRun([newSgvValue, ...entries]);

	return {
		...newSgvValue,
		activityFactor: liverActivityFactor,
		isf: { dynamic: isfActivityDependent, constant: isfConstant },
	};
};

export default simulator;
