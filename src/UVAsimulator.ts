import logger, { getDeltaMinutes } from './utils';

import { MainParamsUVA, UvaUserParams, isMealBolusTreatment } from './Types';
import { transformNoteTreatmentsDrug } from './drug';
import * as moduleContents from './lt1/core/models/UvaPadova_T1DMS';
import Patient, { PatientOutput, PatientState } from './lt1/types/Patient';
import ParametricModule from './lt1/types/ParametricModule';
import SolverRK1_2 from './lt1/core/solvers/SolverRK1_2';
import basalProfile from './basalProfile';
import basal from './basal';
import { calculateBasalAsBoluses } from './pump';

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
const UVASimulator = (params: MainParamsUVA) => {
	const {
		patient: cgmsimPatient,
		treatments,
		profiles,
		lastState,
		pumpEnabled,
		activities,
		user,
		entries,
		defaultPatient,
	} = params;

	logger.debug('Run Init UVA NSUrl:%o', user.nsUrl);
	const now = new Date();

	if (!treatments) {
		throw new Error('treatments is ' + treatments);
	}
	if (!profiles) {
		throw new Error('profiles is ' + profiles);
	}

	const weight = cgmsimPatient.WEIGHT;

	const drugs = transformNoteTreatmentsDrug(treatments);
	let lastSgvMills: number;
	let lastSgvDeltaMinutes: number;
	if (entries?.length > 0) {
		entries.sort((a, b) => b.mills - a.mills);
		lastSgvMills = entries[0].mills;
		lastSgvDeltaMinutes = getDeltaMinutes(lastSgvMills);
	} else {
		lastSgvMills = now.getTime() - 5 * 60 * 1000;
		lastSgvDeltaMinutes = getDeltaMinutes(lastSgvMills);
	}

	const solver = new SolverRK1_2();

	const module = <ParametricModule>new moduleContents.default(defaultPatient);

	const activeDrugTreatments = drugs.filter(function (e) {
		return e.minutesAgo <= 45 * 60; // keep only the basals from the last 45 hours
	});
	// const basalProfileActivity = pumpEnabled ? basalProfile(profiles) : 0;
	const lastTreatments = treatments
		.filter(
			(t) => getDeltaMinutes(t.created_at, now.getTime()) <= 5 && getDeltaMinutes(t.created_at, now.getTime()) >= 0,
		)
		.filter(isMealBolusTreatment)
		.filter((i) => i?.insulin > 0)
		.map((i) => ({ insulin: i.insulin, minutesAgo: getDeltaMinutes(i.created_at, now.getTime()) }));
	const lastCarbsTreatments = treatments
		.filter(
			(t) =>
				getDeltaMinutes(t.created_at, now.getTime()) < lastSgvDeltaMinutes + 15 &&
				getDeltaMinutes(t.created_at, now.getTime()) >= 0,
		)
		.filter(isMealBolusTreatment)
		.filter((i) => i?.carbs > 0)
		.map((i) => ({ carbs: i.carbs, minutesAgo: getDeltaMinutes(i.created_at, now.getTime()) }));
	const pumpBasalTreatment = pumpEnabled ? calculateBasalAsBoluses(treatments, profiles, 1, 1) : [];

	let userParams: UvaUserParams = {
		iir: 0,
		carbs: 0,
		ibolus: 0,
		intensity: 0,
	};

	let patient = module as Patient;

	let tCurrent = lastSgvMills;
	if (lastState) {
		patient.setInitialState(lastState);
	}

	patient.reset(new Date(lastSgvMills), 1, solver);

	// initialize simulation variables
	/** internal state of virtual patient compartments */
	let x: PatientState;
	/** visible physiological outputs of virtual patient */
	let y: PatientOutput;

	// start simulation
	while (tCurrent < now.getTime()) {
		patient.update(new Date(tCurrent), (t: Date) => {
			const tDeltaMinutes = getDeltaMinutes(t.getTime(), now.getTime());
			const basalActivity = basal(
				activeDrugTreatments.filter((t) => {
					return t.minutesAgo > tDeltaMinutes;
				}),
				weight,
			);

			const meal = lastCarbsTreatments
				.filter((t) => t.minutesAgo === tDeltaMinutes)
				.map((t) => t.carbs)
				.reduce((tot, activity) => tot + activity, 0);
			const carbs = lastCarbsTreatments
				.filter((t) => t.minutesAgo - tDeltaMinutes < 15 && t.minutesAgo >= tDeltaMinutes)
				.map((t) => t.carbs)
				.reduce((tot, activity) => tot + activity / 15, 0);
			const bolus = lastTreatments
				.filter((t) => t.minutesAgo === tDeltaMinutes)
				.map((t) => t.insulin)
				.reduce((tot, activity) => tot + activity * 60, 0);
			const pumpBasal = pumpBasalTreatment
				.filter((t) => t.minutesAgo === tDeltaMinutes)
				.map((t) => t.insulin)
				.reduce((tot, activity) => tot + activity, 0);

			let iir = pumpBasal * 60 + basalActivity * 60;

			return { ...userParams, meal, carbs, iir: iir + bolus };
		});
		tCurrent += 60 * 1000;
	}

	const lastPatientState = patient.getState();
	const result = patient.getOutput();

	if (result.Gp > 400) {
		return { state: lastPatientState, sgv: 400 };
	}
	if (result.Gp < 40) {
		return { state: lastPatientState, sgv: 40 };
	}
	const res = { state: lastPatientState, sgv: result.Gp };
	logger.info(user.nsUrl + ' uva output:%o', res);
	return res;
};

export default UVASimulator;
