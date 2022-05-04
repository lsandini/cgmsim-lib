"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
// import pump from './pump.js';
const utils_1 = require("./utils");
const utils_2 = require("./utils");
//const logger = pino();
const sgv_start = (entries, { det, gla, degludec, tou, liver, carbs, resultAct }, perls, isf) => {
    const oldSgv = entries && entries[0] ? entries[0].sgv : 90;
    const deltaMinutes = utils_2.getDeltaMinutes(entries[0].mills);
    utils_1.default.info('deltaMinutes', deltaMinutes);
    const isfMMol = isf / 18; //mmol/l/U
    //logger.info('ISF=', ISF);
    // ENABLE THIS FOR PUMP SIMULATION
    //=================================
    // logger.info('profiles', profiles);
    const pumpBasalAct = 0;
    // let pumpBasalAct = 0;
    // if (env.pumpEnabled) {
    //     pumpBasalAct = pump({
    //         treatments,
    //         profiles,
    //         pumpBasals,
    //     }, env);
    // }
    const globalBasalAct = gla + det + tou + degludec;
    const globalMealtimeAct = resultAct;
    const globalInsulinAct = globalBasalAct + globalMealtimeAct + pumpBasalAct;
    const BGI_ins = (globalInsulinAct * deltaMinutes * isfMMol) * -1;
    const today = new Date();
    const liver_bgi = liver * deltaMinutes;
    const timeSincePerlin = perls.map(entry => (Object.assign(Object.assign({}, entry), { time: (Date.now() - moment(entry.time).valueOf()) / (1000 * 60) })));
    const lastPerls = perls.filter(function (e) {
        const delta = utils_2.getDeltaMinutes(e.time);
        return delta >= 0 && delta <= 5; // keep only the latest noise value
    });
    const noise = lastPerls && lastPerls.length > 0 ? (lastPerls[0].noise * 6) : 0;
    const sgv_pump = Math.floor(oldSgv + (BGI_ins * 18) + (liver_bgi * 18) + (carbs * 18) + (noise * 18));
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
    utils_1.default.info('OLD SGV value (' + deltaMinutes + ' minutes ago):', oldSgv, 'mg/dl');
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('total BG impact of insulin for ' + deltaMinutes + ' minutes:', BGI_ins * 18, 'mg/dl');
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('total BG impact of liver for ' + deltaMinutes + ' minutes: +', liver_bgi * 18, 'mg/dl');
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('total CARBS impact of carbs for ' + deltaMinutes + ' minutes: +', carbs * 18, 'mg/dl');
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('total NOISE impact: +', noise * 18, 'mg/dl');
    utils_1.default.info('-------------------------------------------');
    utils_1.default.info('total BG impact of carbs, liver and insulin for 5 minutes: +', (BGI_ins) + (liver_bgi * 18) + (carbs * 18), 'mg/dl');
    utils_1.default.info('this is the PUMP BASAL insulin impact for ' + deltaMinutes + ' minutes:', pumpBasalAct * deltaMinutes * 18 * isfMMol);
    utils_1.default.info('this is the BASAL BOLUS  insulin impact for ' + deltaMinutes + ' minutes:', globalBasalAct * deltaMinutes * 18 * isfMMol);
    utils_1.default.info('this is the MEAL BOLUS insulin impact for ' + deltaMinutes + ' minutes:', globalMealtimeAct * deltaMinutes * 18 * isfMMol);
    return dict;
};
exports.default = sgv_start;
//# sourceMappingURL=sgv_start.js.map