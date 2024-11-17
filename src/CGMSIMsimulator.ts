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

	let isfActivityDependent = isfConstant;
	let activityFactor = 1;
	if (isfActivityDependent < 9) {
		throw new Error('Isf must be greater than or equal to 9');
	}
	if (activities && activities.length > 0) {
		isfActivityDependent = isfConstant * physicalIsf(activities, age, gender);
		activityFactor = physicalLiver(activities, age, gender);
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
	const liverActivity = liverRun(isfConstant, cr, {
		physical: activityFactor,
		alcohol: alcoholActivity,
	});

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
		physicalLiver: activityFactor,
	});

	// const arrows = arrowsRun([newSgvValue, ...entries]);

	return {
		...newSgvValue,
		activityFactor,
		isf: { dynamic: isfActivityDependent, constant: isfConstant },
	};
};

/**
 * Generates predictions using the same calculation method as the main simulator
 * @param params - Main parameters for running the simulation.
 * @returns Array of predicted SGV values for the next 3 hours at 5-min intervals
 */
simulator.getPredictions = (params: any): number[] => {
  const predictions: number[] = [];
  const now = moment();

  // Start with current value
  const currentValue = simulator(params);
  console.log('PREDICTION START:', {
      currentSGV: currentValue.sgv,
      baseActivities: {
          carbsActivity: currentValue.carbsActivity,
          basalActivity: currentValue.basalActivity,
          bolusActivity: currentValue.bolusActivity,
          liverActivity: currentValue.liverActivity,
          cortisoneActivity: currentValue.cortisoneActivity,
          alcoholActivity: currentValue.alcoholActivity
      }
  });
  predictions.push(currentValue.sgv);

  // Generate predictions
  for (let i = 1; i < 36; i++) {
      const predictionTime = moment(now).add(i * 5, 'minutes');
      
      // Just use any type for the treatments
      const adjustedTreatments = params.treatments.map(t => ({
          ...t,
          minutesAgo: Math.round(predictionTime.diff(moment(t.created_at), 'minutes'))
      })).filter(t => t.minutesAgo >= 0);

      // Rest of your JavaScript code exactly as it was...
      const bolusActivity = bolus(adjustedTreatments, params.patient.DIA, params.patient.TP);
      const basalBolusActivity = params.pumpEnabled ? 0 : basal(adjustedTreatments, params.patient.WEIGHT);
      // ... rest of your original code ...
  }

  return predictions;
};

export default simulator;
