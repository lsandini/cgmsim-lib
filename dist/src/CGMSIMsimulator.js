"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
//const logger = pino();
const perlin_1 = require("./perlin");
const bolus_1 = require("./bolus");
const basal_1 = require("./basal");
const carbs_1 = require("./carbs");
const liver_1 = require("./liver");
const sgv_1 = require("./sgv");
const moment = require("moment");
utils_1.default.debug('Run Init');
const simulator = ({ env, entries, treatments, profiles, perlinParams, pumpBasals }) => {
    const isf = parseInt(env.ISF);
    if (isf < 9) {
        throw new Error("Isf must be greater then or equal to 9");
    }
    const weight = parseInt(env.WEIGHT);
    const dia = parseInt(env.DIA);
    const tp = parseInt(env.TP);
    const carbsAbs = parseInt(env.CARBS_ABS_TIME);
    const cr = parseInt(env.CR);
    const perls = perlin_1.default(perlinParams);
    const bolusActivity = bolus_1.default(treatments, dia, tp);
    const basalActivity = basal_1.default(treatments, weight);
    const carbsActivity = carbs_1.default(treatments, carbsAbs, isf, cr);
    // //activity calc insulin
    // const det = detemirRun(weight, lastDET);
    // const gla = glargineRun(weight, lastGLA);
    // const degludec = degludecRun(lastDEG);
    // const tou = toujeoRun(weight, lastTOU);
    //activity calc carb
    const liverActivity = liver_1.default(isf, cr);
    const now = moment();
    const orderedEntries = entries.filter(e => e.mills <= now.toDate().getTime()).sort((a, b) => b.mills - a.mills);
    const newSgvValue = sgv_1.default(orderedEntries, { basalActivity, liverActivity, carbsActivity, bolusActivity }, perls, isf);
    utils_1.default.debug('this is the new sgv: %o', newSgvValue);
    // const arrows = arrowsRun([newSgvValue, ...entries]);
    return Object.assign({}, newSgvValue);
};
exports.default = simulator;
//# sourceMappingURL=CGMSIMsimulator.js.map