"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
//const logger = pino();
const perlin_1 = require("./perlin");
const computeBolusIOB_js_1 = require("./computeBolusIOB.js");
const computeBasalIOB_js_1 = require("./computeBasalIOB.js");
const detemir_js_1 = require("./detemir.js");
const glargine_js_1 = require("./glargine.js");
const degludec_js_1 = require("./degludec.js");
const toujeo_js_1 = require("./toujeo.js");
const all_meals_js_1 = require("./all_meals.js");
const carbs_js_1 = require("./carbs.js");
const arrows_js_1 = require("./arrows.js");
const liver_js_1 = require("./liver.js");
const sgv_start_js_1 = require("./sgv_start.js");
utils_1.default.info('Run Init');
const perls = (0, perlin_1.default)();
const main = ({ env, entries, treatments, profiles, pumpBasals }) => {
    const weight = parseInt(env.WEIGHT);
    const dia = parseInt(env.DIA);
    const tp = parseInt(env.TP);
    const carbsAbs = parseInt(env.CARBS_ABS_TIME);
    const isf = parseInt(env.ISF);
    const cr = parseInt(env.CR);
    // if (!perls || perls.length === 0) {
    //     perls = perlinRun();
    // }
    const { resultAct } = (0, computeBolusIOB_js_1.default)(treatments, dia, tp);
    const { lastDET, lastGLA, lastTOU, lastDEG } = (0, computeBasalIOB_js_1.default)(treatments);
    const lastMeals = (0, all_meals_js_1.default)(treatments);
    const det = (0, detemir_js_1.default)(weight, lastDET);
    const gla = (0, glargine_js_1.default)(weight, lastGLA);
    const degludec = (0, degludec_js_1.default)(lastDEG);
    const tou = (0, toujeo_js_1.default)(weight, lastTOU);
    const carbs = (0, carbs_js_1.default)(carbsAbs, lastMeals);
    const liver = (0, liver_js_1.default)(isf, cr);
    const cgmsim = (0, sgv_start_js_1.default)(entries, { det, gla, degludec, tou, liver, carbs, resultAct }, perls, isf);
    utils_1.default.info('this is the new sgv: %o', cgmsim);
    const arrows = (0, arrows_js_1.default)([cgmsim, ...entries]);
    return Object.assign(Object.assign({}, cgmsim), { direction: arrows[0].direction });
};
exports.default = main;
//# sourceMappingURL=main.js.map