import logger, { getDeltaMinutes } from './utils';

import basal from './basal';
import basalProfile from './basalProfile';
import {
	MainParamsUVA,
	UvaPatientState,
	UvaDelta,
	UvaInterval,
	UvaOutput,
	UvaUserParams,
	isMealBolusTreatment,
} from './Types';
import { PatientUva } from './uva';
import RK4 from './SolverRK';
import { currentIntensity } from './physical';
import { transformNoteTreatmentsDrug } from './drug';
import { defaultPatient } from './defaultPatient';

/**
 * Simulates blood glucose levels in response to various parameters and inputs.
 * @param params - Main parameters for running the simulation.
 * @returns Simulation result containing blood glucose data and patient state.
 * @example
 * // Run a blood glucose simulation with specified parameters
 * const simulationParams = {
 *   env: {
 *     WEIGHT: "70",
 *     AGE: "35",
 *     GENDER: "Male",
 *     // ... other environment parameters ...
 *   },
 *   treatments: [
 *     // ... treatment data ...
 *   ],
 *   profiles: [
 *     // ... profile data ...
 *   ],
 *   lastState: {
 *     // ... patient state data ...
 *   },
 *   entries: [
 *     // ... blood glucose entry data ...
 *   ],
 *   pumpEnabled: true,
 *   activities: [
 *     // ... activity data ...
 *   ],
 *   user: {
 *     nsUrl: "https://nightscout.example.com",
 *     // ... other user-related data ...
 *   },
 * };
 *
 * const simulationResult = simulator(simulationParams);
 * console.log("Blood glucose simulation result:", simulationResult);
 */
const UVAsimulator = (params: MainParamsUVA) => {
	const {
		patient,
		treatments,
		profiles,
		lastState,
		pumpEnabled,
		activities,
		user,
	} = params;

	logger.debug('Run Init UVA NSUrl:%o', user.nsUrl);

	if (!treatments) {
		throw new Error('treatments is ' + treatments);
	}
	if (!profiles) {
		throw new Error('profiles is ' + profiles);
	}

	const weight = patient.WEIGHT;
	const age = patient.AGE;
	const gender = patient.GENDER;
	const drugs = transformNoteTreatmentsDrug(treatments);

	const activeDrugTreatments = drugs.filter(function (e) {
		return e.minutesAgo <= 45 * 60; // keep only the basals from the last 45 hours
	});

	const basalActivity = basal(activeDrugTreatments, weight);

	const last5MinuteTreatments = treatments.filter(
		(t) =>
			getDeltaMinutes(t.created_at) < 5 && getDeltaMinutes(t.created_at) >= 0,
	);

	const bolusActivity = last5MinuteTreatments
		.filter(isMealBolusTreatment)
		.filter((i) => i?.insulin > 0)
		.map((i) => i.insulin)
		.reduce((tot, activity) => tot + activity, 0);

	const carbsActivity = last5MinuteTreatments
		.filter(isMealBolusTreatment)
		.filter((i) => i?.carbs > 0)
		.map((i) => i.carbs)
		.reduce((tot, activity) => tot + activity, 0);

	const intensity = currentIntensity(activities, age, gender) * 100;

	const basalProfileActivity = pumpEnabled ? basalProfile(profiles) : 0;

	const patientUva = new PatientUva(defaultPatient);
	let partialMinutes = 0;
	const fiveMinutes: UvaInterval = 5;
	const oneMinute: UvaDelta = 1;

	//get last state from mongo
	let patientState: UvaPatientState = lastState
		? lastState
		: patientUva.getInitialState();

	logger.debug('basalProfileActivity:%o', basalProfileActivity * 60);
	logger.debug('basalActivity:%o', basalActivity * 60);

	let iir = basalProfileActivity * 60 + basalActivity * 60;

	let userParams: UvaUserParams = {
		iir,
		ibolus: 0,
		carbs: 0,
		intensity: 0,
	};
	//t0 result
	let result: UvaOutput = patientUva.getOutputs(
		partialMinutes,
		patientState,
		userParams,
	);
	const lastPatientState = { ...patientState };
	// start simulation
	logger.debug(user.nsUrl + ' lastPatientState:%o', lastPatientState);

	while (partialMinutes < fiveMinutes) {
		// todo: sensor dynamics
		result.G = result.Gp;

		// validity check
		if (isNaN(result.G)) {
			throw new Error('Error');
		}

		// compute controller output
		// let iir = basalActivity * 60;
		logger.debug('patientState:%o', patientState);

		// let iir = basalProfileActivity * 60 + basalActivity * 60;
		let ibolus = partialMinutes == 0 ? bolusActivity : 0;
		if (iir < 0) iir = 0;
		if (ibolus < 0) ibolus = 0;
		const carbs = carbsActivity / 5;
		// const intensity = 0;//get exercise intensity

		const userParams: UvaUserParams = { iir, ibolus, carbs, intensity };

		// this.simulationResults.push({ t, x, u, y, logData })

		// proceed one time step
		patientState = RK4(
			(time: number, state: UvaPatientState) =>
				patientUva.getDerivatives(time, state, userParams),
			partialMinutes,
			patientState,
			oneMinute,
		);
		//t partialMinutes result
		result = patientUva.getOutputs(partialMinutes, patientState, userParams);
		partialMinutes += oneMinute;
	}
	if (result.Gp > 400) {
		return { state: lastPatientState, sgv: 400 };
	}
	if (result.Gp < 40) {
		return { state: lastPatientState, sgv: 40 };
	}
	const res = { state: patientState, sgv: result.Gp };
	logger.info(user.nsUrl + ' uva output:%o', res);
	return res;
};

export default UVAsimulator;
