"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
//const logger = pino();
function carbs(treatments = [], carbsAbs, isf, cr) {
    const isfMMol = isf / 18; //(mmol/l)/U
    const meals = treatments
        .filter(e => e.carbs && utils_1.getDeltaMinutes(e.created_at) <= 360)
        .map(e => (Object.assign(Object.assign({}, e), { minutesAgo: utils_1.getDeltaMinutes(e.created_at) })));
    utils_1.default.debug('Last 6 hours meal: %o', meals);
    const carbs = meals || [];
    const carbAbsTime = carbsAbs; // meal absorption time in min default 360 or 6 hours
    const fast_carbAbsTime = carbAbsTime / 6; // = 1 h or 60 min
    const slow_carbAbsTime = carbAbsTime / 1.5; // = 4 h or 240 min
    const timeSinceMealAct = carbs.map(entry => {
        const minutesAgo = entry.minutesAgo;
        const carbs_g = entry.carbs;
        // the first 40g of every meal are always considered fast carbs
        const fast = Math.min(entry.carbs, 40);
        // the amount exceeding 40 grams will be randomly split into fast and slow carbs
        const rest = entry.carbs - fast;
        const FSR = (Math.random() * (0.4 - 0.1) + 0.1); // FSR = FAST RANDOM RATIO
        // all fast carbs counted together
        const fast_carbs = fast + (FSR * rest);
        // the remainder is slow carbs
        const slow_carbs = (1 - FSR) * rest;
        utils_1.default.debug('carbs_g:', carbs_g, 'fast:', fast, 'rest:', rest, 'fast_carbs:', fast_carbs, 'slow_carbs: %o', slow_carbs);
        let fast_carbrate = 0;
        let slow_carbrate = 0;
        if (minutesAgo < (fast_carbAbsTime / 2)) {
            const AT2 = Math.pow(fast_carbAbsTime, 2);
            fast_carbrate = (fast_carbs * 4 * minutesAgo) / AT2;
            //COB = (fast_carbs * 2 * Math.pow(t, 2)) / AT2;
        }
        else if (minutesAgo < (fast_carbAbsTime)) {
            fast_carbrate = (fast_carbs * 4 / fast_carbAbsTime) * (1 - (minutesAgo / fast_carbAbsTime));
            // const AAA = (4 * fast_carbs / fast_carbAbsTime);
            // const BBB = Math.pow(t, 2) / (2 * fast_carbAbsTime);
            // COB = (AAA * (t - BBB)) - fast_carbs;
        }
        else {
            fast_carbrate = 0;
            // COB = 0;
            utils_1.default.debug('fast carb absorption rate: %o', fast_carbrate);
        }
        if (minutesAgo < (slow_carbAbsTime / 2)) {
            const AT2 = Math.pow(slow_carbAbsTime, 2);
            slow_carbrate = (slow_carbs * 4 * minutesAgo) / AT2;
            //COB = (slow_carbs * 2 * Math.pow(t, 2)) / AT2;
        }
        else if (minutesAgo < (slow_carbAbsTime)) {
            slow_carbrate = (slow_carbs * 4 / slow_carbAbsTime) * (1 - (minutesAgo / slow_carbAbsTime));
            // const AAA = (4 * slow_carbs / slow_carbAbsTime);
            // const BBB = Math.pow(t, 2) / (2 * slow_carbAbsTime);
            //COB = (AAA * (t - BBB)) - slow_carbs;
        }
        else {
            slow_carbrate = 0;
            // COB = 0;
            utils_1.default.debug('slow carb absorption rate: %o', slow_carbrate);
        }
        return fast_carbrate + slow_carbrate;
    });
    utils_1.default.debug(timeSinceMealAct);
    const totalCarbRate = timeSinceMealAct.reduce((tot, carbrate) => tot + carbrate, 0);
    const DBGC = (isfMMol / cr) * totalCarbRate; //DeltaBloodGlucoseFromCarbs
    utils_1.default.debug(`CARB RATE:%o`, totalCarbRate);
    utils_1.default.info(`Delta blood Glucose From Carbs per minute:%o`, DBGC);
    return DBGC;
}
exports.default = carbs;
;
//# sourceMappingURL=carbs.js.map