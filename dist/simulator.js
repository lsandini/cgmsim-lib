"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
//const logger = pino();
const perlin_1 = require("./perlin");
const computeBolusIOB_js_1 = require("./computeBolusIOB.js");
const computeBasalIOB_js_1 = require("./computeBasalIOB.js");
const all_meals_js_1 = require("./all_meals.js");
const carbs_js_1 = require("./carbs.js");
const arrows_js_1 = require("./arrows.js");
const liver_js_1 = require("./liver.js");
const sgv_start_js_1 = require("./sgv_start.js");
utils_1.default.info('Run Init');
const main = ({ env, entries, treatments, profiles, pumpBasals }) => {
    const weight = parseInt(env.WEIGHT);
    const dia = parseInt(env.DIA);
    const tp = parseInt(env.TP);
    const carbsAbs = parseInt(env.CARBS_ABS_TIME);
    const isf = parseInt(env.ISF);
    const cr = parseInt(env.CR);
    const perls = perlin_1.default(env.SEED || 'cgmsim');
    const bolusActivity = computeBolusIOB_js_1.default(treatments, dia, tp);
    const basalActivity = computeBasalIOB_js_1.default(treatments, weight);
    const lastMeals = all_meals_js_1.default(treatments);
    // //activity calc insulin
    // const det = detemirRun(weight, lastDET);
    // const gla = glargineRun(weight, lastGLA);
    // const degludec = degludecRun(lastDEG);
    // const tou = toujeoRun(weight, lastTOU);
    //activity calc carb
    const carbs = carbs_js_1.default(carbsAbs, lastMeals);
    const liver = liver_js_1.default(isf, cr);
    const cgmsim = sgv_start_js_1.default(entries, { basalActivity, liver, carbs, bolusActivity }, perls, isf);
    utils_1.default.info('this is the new sgv: %o', cgmsim);
    const arrows = arrows_js_1.default([cgmsim, ...entries]);
    return Object.assign(Object.assign({}, cgmsim), { direction: arrows[0].direction });
};
exports.default = main;
//# sourceMappingURL=simulator.js.map