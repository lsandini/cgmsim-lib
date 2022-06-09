"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
//const logger = pino();
// import perlinRun from './perlin';
// import bolus from './bolus';
const basal_1 = require("./basal");
const basalProfile_1 = require("./basalProfile");
const uva_1 = require("./uva");
const SolverRK_1 = require("./SolverRK");
utils_1.default.info('Run Init');
const simulator = ({ env, treatments, profiles: profile, lastState, entries }) => {
    const weight = parseInt(env.WEIGHT);
    // const dia = parseInt(env.DIA);
    // const tp = parseInt(env.TP);
    // const carbsAbs = parseInt(env.CARBS_ABS_TIME);
    // const cr = parseInt(env.CR);
    // const perls = perlinRun(env.SEED || 'cgmsim');
    const basalActivity = basal_1.default(treatments, weight);
    const last5MinuteTreatments = treatments.map(e => (Object.assign(Object.assign({}, e), { minutesAgo: utils_1.getDeltaMinutes(e.created_at), insulin: e.insulin })))
        .filter(t => t.minutesAgo < 5 && t.minutesAgo >= 0);
    const bolusActivity = last5MinuteTreatments
        .filter(i => i.insulin > 0)
        .map(i => i.insulin)
        .reduce((tot, activity) => tot + activity, 0);
    const carbsActivity = last5MinuteTreatments
        .filter(i => i.carbs > 0)
        .map(i => i.carbs)
        .reduce((tot, activity) => tot + activity, 0);
    const basalProfileActivity = basalProfile_1.default(profile);
    const patient = new uva_1.PatientUva({});
    let t = 0;
    const tmax = 5;
    const dt = 1;
    //get last state from mongo
    let x = lastState ? lastState : patient.getInitialState(entries && entries.length > 0 ? entries[0].sgv : null);
    let u = { meal: 0, iir: 0, ibolus: 0 };
    let y = patient.getOutputs(t, x, u);
    // start simulation
    while (t < tmax) {
        // todo: sensor dynamics
        y["G"] = y["Gp"];
        // validity check
        if (isNaN(y["G"])) {
            throw new Error('Error');
        }
        // compute controller output
        // let iir = basalActivity * 60;
        let iir = (basalProfileActivity * 60) + (basalActivity * 60);
        let ibolus = t == 0 ? bolusActivity : 0;
        if (iir < 0)
            iir = 0;
        if (ibolus < 0)
            ibolus = 0;
        const carbs = carbsActivity / 5;
        const u = { iir, ibolus, carbs, meal: NaN };
        // this.simulationResults.push({ t, x, u, y, logData })
        // proceed one time step
        x = SolverRK_1.default((t_, x_) => patient.getDerivatives(t_, x_, u), t, x, dt);
        y = patient.getOutputs(t, x, u);
        t += dt;
    }
    return { x, y };
    //save x state
};
exports.default = simulator;
//# sourceMappingURL=UVAsimulator.js.map