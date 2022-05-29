"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import pump from './pump.js';
const utils_1 = require("./utils");
const utils_2 = require("./utils");
//const logger = pino();
const sgv_start = (entries, { basalActivity, liver, carbsActivity, bolusActivity }, perls, isf) => {
    const oldSgv = entries && entries[0] ? entries[0].sgv : 90;
    const deltaMinutes = utils_2.getDeltaMinutes(entries[0].mills);
    utils_1.default.info('deltaMinutes %o', deltaMinutes);
    const isfMMol = isf / 18; //(mmol/l)/U
    //logger.info('ISF= %o', ISF);
    // ENABLE THIS FOR PUMP SIMULATION
    //=================================
    // logger.info('profiles %o', profiles);
    const pumpBasalAct = 0;
    // let pumpBasalAct = 0;
    // if (env.pumpEnabled) {
    //     pumpBasalAct = pump({
    //         treatments,
    //         profiles,
    //         pumpBasals,
    //     }, env);
    // }
    const globalInsulinAct = basalActivity + bolusActivity + pumpBasalAct; //U/min
    const BGI_ins = (globalInsulinAct * deltaMinutes * isfMMol) * -1; //mmol/l
    const today = new Date();
    const liver_bgi = liver * deltaMinutes; //mmol/l
    const lastPerls = perls.filter(function (e) {
        const delta = utils_2.getDeltaMinutes(e.time);
        return delta >= 0 && delta <= 5; // keep only the latest noise value
    });
    const noise = lastPerls && lastPerls.length > 0 ? (lastPerls[0].noise * 6) : 0;
    const sgv_pump = Math.floor(oldSgv + (BGI_ins * 18) + (liver_bgi * 18) + (carbsActivity * 18) + (noise * 18));
    let limited_sgv_pump = sgv_pump;
    if (sgv_pump >= 400) {
        limited_sgv_pump = 400;
    }
    else if (sgv_pump <= 40) {
        limited_sgv_pump = 40;
    }
    const dict = {
        dateString: today,
        sgv: limited_sgv_pump,
        type: 'sgv',
        date: Date.now(),
    };
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('OLD SGV value (' + deltaMinutes + ' minutes ago): %o', oldSgv, 'mg/dl');
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('total BG impact of insulin for ' + deltaMinutes + ' minutes: %o', BGI_ins * 18, 'mg/dl');
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('total BG impact of liver for ' + deltaMinutes + ' minutes: + %o', liver_bgi * 18, 'mg/dl');
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('total CARBS impact of carbs for ' + deltaMinutes + ' minutes: + %o', carbsActivity * 18, 'mg/dl');
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('total NOISE impact: + %o', noise * 18, 'mg/dl');
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('total BG impact of carbs, liver and insulin for 5 minutes: + %o', (BGI_ins) + (liver_bgi * 18) + (carbsActivity * 18), 'mg/dl');
    utils_1.default.info('this is the PUMP BASAL insulin impact for ' + deltaMinutes + ' minutes: %o', pumpBasalAct * deltaMinutes * 18 * isfMMol);
    utils_1.default.info('this is the BASAL BOLUS  insulin impact for ' + deltaMinutes + ' minutes: %o', basalActivity * deltaMinutes * 18 * isfMMol);
    utils_1.default.info('this is the MEAL BOLUS insulin impact for ' + deltaMinutes + ' minutes: %o', bolusActivity * deltaMinutes * 18 * isfMMol);
    return dict;
};
exports.default = sgv_start;
//# sourceMappingURL=sgv.js.map