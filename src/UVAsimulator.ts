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
import { InputPatientUvaState, MainParams, MainParamsUVA, Treatment, TreatmentDelta } from './Types';
import { PatientUva } from './uva';
import RK4 from './SolverRK';

logger.info('Run Init');

const simulator = ({
	env,
	treatments,
	profile,
	lastState,
}: MainParamsUVA) => {

	const weight = parseInt(env.WEIGHT);
	// const dia = parseInt(env.DIA);
	// const tp = parseInt(env.TP);
	// const carbsAbs = parseInt(env.CARBS_ABS_TIME);
	// const cr = parseInt(env.CR);
	// const perls = perlinRun(env.SEED || 'cgmsim');
	const basalActivity = basal(treatments, weight);

	const last5MinuteTreatments = treatments.map(e => ({
		...e,
		minutesAgo: getDeltaMinutes(e.created_at),
		insulin: e.insulin
	})).filter(t => t.minutesAgo <= 5)

	const bolusActivity = last5MinuteTreatments
		.filter(i => i.insulin > 0)
		.map(i => i.insulin)
		.reduce((tot, activity) => tot + activity, 0);

	const carbsActivity = last5MinuteTreatments
		.filter(i => i.carbs > 0)
		.map(i => i.insulin)
		.reduce((tot, activity) => tot + activity, 0);

	const basalProfileActivity = basalProfile(profile)



	const patient = new PatientUva({})
	let t = 0
	const tmax = 5

	const dt = 1
	//get last state from mongo
	let x = lastState ? lastState : patient.getInitialState()
	let u = { meal: 0, iir: patient.IIReq, ibolus: 0 }
	let y = patient.getOutputs(t, x, u)

	// start simulation
	while (t < tmax) {
		// todo: sensor dynamics
		y["G"] = y["Gp"];

		// validity check
		if (isNaN(y["G"])) {
			throw new Error('Error')
		}

		// compute controller output
		// let iir = basalActivity * 60;
		let iir = basalProfileActivity + (basalActivity * 60);
		let ibolus = t == 0 ? bolusActivity : 0;
		if (iir < 0) iir = 0
		if (ibolus < 0) ibolus = 0
		const carbs = carbsActivity / 5;

		const u: InputPatientUvaState = { iir, ibolus, carbs, meal: NaN }

		// this.simulationResults.push({ t, x, u, y, logData })

		// proceed one time step
		x = RK4((t_, x_) => patient.getDerivatives(t_, x_, u), t, x, dt)
		y = patient.getOutputs(t, x, u)
		t += dt
	}
	return { x, y }

	//save x state





};

export default simulator;