import logger, { getDeltaMinutes } from './utils';

//const logger = pino();

// import perlinRun from './perlin';
// import bolus from './bolus';
import basal from './basal';
import basalProfile from './basalProfile';

// import carbs from './carbs';
// import arrowsRun from './arrows';
// import liverRun from './liver';
// import sgvStartRun from './sgv';
import {
	MainParamsUVA,
	UvaPatientState,
	UvaDelta,
	UvaInterval,
	UvaOutput,
	UvaUserParams,
} from './Types';
import { PatientUva } from './uva';
import RK4 from './SolverRK';
import { currentIntensity } from './physical';

logger.info('Run Init');

const simulator = ({
	env,
	treatments,
	profiles,
	lastState,
	entries,
	pumpEnabled,
	activities,
}: MainParamsUVA) => {
	if (!treatments) {
		throw new Error('treatments is ' + treatments);
	}
	if (!profiles) {
		throw new Error('profiles is ' + profiles);
	}

	const weight = parseInt(env.WEIGHT);
	const age = parseInt(env.AGE);
	const gender = env.GENDER;

	// const dia = parseInt(env.DIA);
	// const tp = parseInt(env.TP);
	// const carbsAbs = parseInt(env.CARBS_ABS_TIME);
	// const cr = parseInt(env.CR);
	// const perls = perlinRun(env.SEED || 'cgmsim');
	const basalActivity = basal(treatments, weight);

	const last5MinuteTreatments = treatments
		.map((e) => ({
			...e,
			minutesAgo: getDeltaMinutes(e.created_at),
			insulin: e.insulin,
		}))
		.filter((t) => t.minutesAgo < 5 && t.minutesAgo >= 0);

	const bolusActivity = last5MinuteTreatments
		.filter((i) => i.insulin > 0)
		.map((i) => i.insulin)
		.reduce((tot, activity) => tot + activity, 0);

	const carbsActivity = last5MinuteTreatments
		.filter((i) => i.carbs > 0)
		.map((i) => i.carbs)
		.reduce((tot, activity) => tot + activity, 0);

	const intensity = currentIntensity(activities, age, gender) * 100;

	const basalProfileActivity = pumpEnabled ? basalProfile(profiles) : 0;

	const patient = new PatientUva({});
	let partialMinutes = 0;
	const fiveMinutes: UvaInterval = 5;
	const oneMinute: UvaDelta = 1;

	//get last state from mongo
	let patientState: UvaPatientState = lastState
		? lastState
		: patient.getInitialState();
	let userParams: UvaUserParams = {
		iir: 0,
		ibolus: 0,
		carbs: 0,
		intensity: 0,
	};
	//t0 result
	let result: UvaOutput = patient.getOutputs(
		partialMinutes,
		patientState,
		userParams
	);
	const lastPatientState = { ...patientState };
	// start simulation
	while (partialMinutes < fiveMinutes) {
		// todo: sensor dynamics
		result.G = result.Gp;

		// validity check
		if (isNaN(result.G)) {
			throw new Error('Error');
		}

		// compute controller output
		// let iir = basalActivity * 60;
		let iir = basalProfileActivity * 60 + basalActivity * 60;
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
				patient.getDerivatives(time, state, userParams),
			partialMinutes,
			patientState,
			oneMinute
		);
		//t partialMinutes result
		result = patient.getOutputs(partialMinutes, patientState, userParams);
		partialMinutes += oneMinute;
	}
	if (result.Gp > 400) {
		return { state: lastPatientState, sgv: 400 };
	}
	if (result.Gp < 40) {
		return { state: lastPatientState, sgv: 40 };
	}
	return { state: patientState, sgv: result.Gp };
};

export default simulator;
