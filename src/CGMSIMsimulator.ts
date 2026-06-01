import logger from './utils';
import { calculateBolusActivityAndIOB } from './bolus';
import { calculateTotalBasalActivityAndIOB } from './basal';
import { calculateFinalCortisoneActivityFromParams } from './cortisone';
import { calculateTotalActivityFromParams } from './alcohol';
import { calculateCarbEffectAndCOB } from './carbs';
import liverRun from './liver';
import sgv from './sgv';
import { calculateBasalAsBoluses, calculatePumpActivityFromBoluses, calculatePumpIOBFromBoluses } from './pump';
import { MainParams, SimulationResult } from './Types';
import moment = require('moment');
import { physicalIsf, physicalLiver } from './physical';
import { groupTreatmentExpParams, transformNoteTreatmentsDrug } from './drug';
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
	const drugParams = groupTreatmentExpParams(recentDrugTreatments, weight);
	const bolusCalculation = calculateBolusActivityAndIOB(treatments, dia, peak);
	const basalCalculation = calculateTotalBasalActivityAndIOB(drugParams);
	const carbCalculation = calculateCarbEffectAndCOB(treatments, carbsAbs, dynamicIsf, cr);
	const pumpBasalBoluses = pumpEnabled ? calculateBasalAsBoluses(treatments, profiles, dia, 5) : [];
	const profileBasalBoluses = pumpEnabled ? calculateBasalAsBoluses([], profiles, dia, 5) : [];

	const bolusEffect = bolusCalculation.activity;
	const basalBolusEffect = basalCalculation.activity;
	const cortisoneEffect = calculateFinalCortisoneActivityFromParams(drugParams);
	const alcoholEffect = calculateTotalActivityFromParams(drugParams, weight, gender);
	const pumpBasalEffect = pumpEnabled ? calculatePumpActivityFromBoluses(pumpBasalBoluses, dia, peak) : 0;
	const carbsEffect = carbCalculation.effect;
	const carbsOnBoard = carbCalculation.cob;
	const bolusIOB = bolusCalculation.iob;
	const pumpBasalIOB = pumpEnabled ? calculatePumpIOBFromBoluses(pumpBasalBoluses, dia, peak) : 0;
	const profileBasalIOB = pumpEnabled ? calculatePumpIOBFromBoluses(profileBasalBoluses, dia, peak) : 0;
	const basalIOB = basalCalculation.iob;

	logger.debug('[simulator] Insulin calculations:', {
		bolusEffect,
		bolusIOB,
		basalBolusEffect,
		pumpBasalEffect,
		pumpBasalIOB,
		profileBasalIOB,
		basalIOB,
	});

	// Calculate total insulin activity for liver suppression
	// Different calculation based on deviceType (MDI vs Pump)
	const totalInsulinActivity = pumpEnabled
		? pumpBasalEffect + bolusEffect // Pump users (deviceType 2,3): basal-as-bolus + bolus
		: basalBolusEffect + bolusEffect; // MDI users (deviceType 0,1): long-acting + bolus

	logger.debug('[simulator] Total insulin activity for liver suppression: %o U/min', totalInsulinActivity);

	// Calculate liver glucose production with insulin suppression
	const liverEffect = liverRun(
		baseIsf,
		cr,
		{
			physical: physicalActivityLiverFactor,
			alcohol: alcoholEffect,
			insulin: totalInsulinActivity, // NEW: Pass insulin activity
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

	logger.info('[simulator] Simulation result: %o', {
		...newSgvValue,
		physicalISF: dynamicIsf / baseIsf,
		physicalLiver: physicalActivityLiverFactor,
	});

	// const arrows = arrowsRun([newSgvValue, ...entries]);
	if (newSgvValue) {
		return {
			...newSgvValue,
			activityFactor: physicalActivityLiverFactor,
			isf: { dynamic: dynamicIsf, constant: baseIsf },
			cob: carbsOnBoard,
			bolusIOB: bolusIOB,
			pumpBasalIOB: pumpBasalIOB,
			profileBasalIOB: profileBasalIOB,
			basalIOB: basalIOB,
		};
	} else {
		logger.error('No entries found');
	}
};

export default simulator;
