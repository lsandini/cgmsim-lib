"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import pump from './pump.js';
const utils_1 = require("./utils");
const utils_2 = require("./utils");
//const logger = pino();
const sgv_start = (entries, { basalActivity, liverActivity, carbsActivity, bolusActivity }, perls, isf) => {
    const oldSgv = entries && entries[0] ? entries[0].sgv : 90;
    const deltaMinutes = utils_2.getDeltaMinutes(entries[0].mills);
    utils_1.default.debug('deltaMinutes %o', deltaMinutes);
    const isfMMol = isf / 18; //(mmol/l)/U
    //logger.debug('ISF= %o', ISF);
    // ENABLE THIS FOR PUMP SIMULATION
    //=================================
    // logger.debug('profiles %o', profiles);
    const pumpBasalActivity = 0;
    // let pumpBasalAct = 0;
    // if (env.pumpEnabled) {
    //     pumpBasalAct = pump({
    //         treatments,
    //         profiles,
    //         pumpBasals,
    //     }, env);
    // }
    const basalDeltaMinutesActivity = basalActivity * deltaMinutes;
    const bolusDeltaMinutesActivity = bolusActivity * deltaMinutes;
    const pumpBasalDeltaMinutesActivity = pumpBasalActivity * deltaMinutes;
    const globalInsulinAct = basalDeltaMinutesActivity + bolusDeltaMinutesActivity + pumpBasalDeltaMinutesActivity; //U/min
    const BGI_ins = (globalInsulinAct * isfMMol) * -1; //mmol/l
    const liverDeltaMinutesActivity = liverActivity * deltaMinutes; //mmol/l
    const carbsDeltaMinutesActivity = carbsActivity * deltaMinutes;
    const lastPerls = perls.filter(function (e) {
        const delta = utils_2.getDeltaMinutes(e.time);
        return delta >= 0 && delta <= 5; // keep only the latest noise value
    });
    const noiseDeltaMinutesActivity = 0; //lastPerls && lastPerls.length > 0 ? (lastPerls[0].noise * deltaMinutes) : 0;
    const sgv_pump = Math.floor(oldSgv + (BGI_ins * 18) + (liverDeltaMinutesActivity * 18) + (carbsActivity * 18) + (noiseDeltaMinutesActivity * 18));
    let limited_sgv_pump = sgv_pump;
    if (sgv_pump >= 400) {
        limited_sgv_pump = 400;
    }
    else if (sgv_pump <= 40) {
        limited_sgv_pump = 40;
    }
    const dict = {
        sgv: limited_sgv_pump,
        deltaMinutes,
        carbsActivity: carbsDeltaMinutesActivity * 18,
        basalActivity: basalDeltaMinutesActivity * isfMMol * 18,
        bolusActivity: bolusDeltaMinutesActivity * isfMMol * 18,
        noiseActivity: noiseDeltaMinutesActivity * isfMMol * 18,
        liverActivity: liverDeltaMinutesActivity * 18,
        pumpBasalActivity: pumpBasalDeltaMinutesActivity * 18,
    };
    utils_1.default.debug('-------------------------------------------');
    utils_1.default.debug('OLD SGV value (' + deltaMinutes + ' minutes ago): %o', oldSgv, 'mg/dl');
    utils_1.default.debug('-------------------------------------------');
    utils_1.default.debug('total BG impact of insulin for ' + deltaMinutes + ' minutes: %o', BGI_ins * 18, 'mg/dl');
    utils_1.default.debug('-------------------------------------------');
    utils_1.default.debug('total BG impact of liver for ' + deltaMinutes + ' minutes: + %o', liverDeltaMinutesActivity * 18, 'mg/dl');
    utils_1.default.debug('-------------------------------------------');
    utils_1.default.debug('total CARBS impact of carbs for ' + deltaMinutes + ' minutes: + %o', carbsActivity * 18, 'mg/dl');
    utils_1.default.debug('-------------------------------------------');
    utils_1.default.debug('total NOISE impact: + %o', noiseDeltaMinutesActivity * 18, 'mg/dl');
    utils_1.default.debug('-------------------------------------------');
    utils_1.default.debug('total BG impact of carbs, liver and insulin for 5 minutes: + %o', (BGI_ins) + (liverDeltaMinutesActivity * 18) + (carbsActivity * 18), 'mg/dl');
    utils_1.default.debug('this is the PUMP BASAL insulin impact for ' + deltaMinutes + ' minutes: %o', pumpBasalActivity * deltaMinutes * 18 * isfMMol);
    utils_1.default.debug('this is the BASAL BOLUS  insulin impact for ' + deltaMinutes + ' minutes: %o', basalActivity * deltaMinutes * 18 * isfMMol);
    utils_1.default.debug('this is the MEAL BOLUS insulin impact for ' + deltaMinutes + ' minutes: %o', bolusActivity * deltaMinutes * 18 * isfMMol);
    utils_1.default.info('this is the simulator result: %o', dict);
    return dict;
};
exports.default = sgv_start;
//# sourceMappingURL=sgv.js.map