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
 * @param params - Configuration parameters for the simulation
 * @param params.patient - Patient specific parameters (ISF, age, gender, weight, etc.)
 * @param params.entries - Array of previous glucose entries
 * @param params.treatments - Array of treatments (insulin, carbs, etc.)
 * @param params.profiles - Pump profiles configuration
 * @param params.pumpEnabled - Flag indicating if insulin pump is enabled
 * @param params.activities - Physical activity data for the last 7 days
 * @param params.user - User configuration including Nightscout URL
 * @returns SimulationResult containing calculated blood glucose value and related parameters
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
	logger.info('[simulator] Run Init CGMSim NSUrl:%o', user.nsUrl);

	if (!treatments) {
		throw new Error('treatments is ' + treatments);
	}
	if (!profiles) {
		throw new Error('profiles is ' + profiles);
	}

	const baseIsf = patient.ISF;
	const age = patient.AGE;
	const gender = patient.GENDER;
	const tz = patient?.TZ || 'UTC';

	// Calculate ISF and liver factors based on physical activity
	let dynamicIsf = baseIsf;
	let physicalActivityLiverFactor = 1;
	if (dynamicIsf < 9) {
		throw new Error('Isf must be greater than or equal to 9');
	}
	if (activities && activities.length > 0) {
		dynamicIsf = baseIsf * physicalIsf(activities, age, gender);
		physicalActivityLiverFactor = physicalLiver(activities, age, gender);
	}

	const weight = patient.WEIGHT;
	const dia = patient.DIA;
	const peak = patient.TP;
	const carbsAbs = patient.CARBS_ABS_TIME;
	const cr = patient.CR;

	//Find basal boluses
	const drugs = transformNoteTreatmentsDrug(treatments);

	// Filter recent drug treatments (last 45 hours)
	const recentDrugTreatments = drugs.filter((treatment) => {
		return treatment.minutesAgo <= 45 * 60;
	});

	// Calculate various treatment effects
	const bolusEffect = bolus(treatments, dia, peak);
	const basalBolusEffect = basal(recentDrugTreatments, weight);
	const cortisoneEffect = cortisone(recentDrugTreatments, weight);
	const alcoholEffect = alcohol(recentDrugTreatments, weight, gender);
	const pumpBasalEffect = pumpEnabled ? pump(treatments, profiles, dia, peak) : 0;
	const carbsEffect = carbs(treatments, carbsAbs, dynamicIsf, cr);

	// Calculate liver glucose production
	const liverEffect = liverRun(
		baseIsf,
		cr,
		{
			physical: physicalActivityLiverFactor,
			alcohol: alcoholEffect,
		},
		weight,
		tz,
	);

	const now = moment();
	const orderedEntries = entries.filter((e) => e.mills <= now.toDate().getTime()).sort((a, b) => b.mills - a.mills);

	const newSgvValue = sgv(
		orderedEntries,
		{
			basalActivity: basalBolusEffect + pumpBasalEffect,
			liverActivity: liverEffect,
			carbsActivity: carbsEffect,
			bolusActivity: bolusEffect,
			cortisoneActivity: cortisoneEffect,
			alcoholActivity: alcoholEffect,
		},
		dynamicIsf,
	);

	logger.info('[simulator] Simulation result:', {
		...newSgvValue,
		physicalISF: dynamicIsf / baseIsf,
		physicalLiver: physicalActivityLiverFactor,
	});

	// const arrows = arrowsRun([newSgvValue, ...entries]);
	if (newSgvValue) {
		return {
			...newSgvValue,
			activityFactor,
			isf: { dynamic: isfActivityDependent, constant: isfConstant },
		};
	} else {
		logger.error('No entries found');
	}
};

export default simulator;
