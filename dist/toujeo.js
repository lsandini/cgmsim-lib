"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const utils_2 = require("./utils");
//const logger = pino();
function default_1(weight, tou) {
    utils_1.default.info(tou);
    // activities be expressed as U/min !!!
    const timeSinceToujeoAct = tou.map(entry => {
        const hoursAgo = entry.minutesAgo / 60;
        const insulin = entry.insulin;
        const duration = (24 + (14 * insulin / weight));
        const peak = (duration / 2.5);
        const { activity } = utils_2.Activity(peak, duration, hoursAgo, insulin);
        return {
            hoursAgo,
            toujeoActivity: activity
        };
    });
    utils_1.default.info('the is the accumulated toujeo activity: %o', timeSinceToujeoAct);
    // compute the aggregated activity of last toujeos in 27 hours
    const lastToujeos = timeSinceToujeoAct.filter((e) => e.hoursAgo <= 30);
    utils_1.default.info('these are the last toujeos and activities: %o', lastToujeos);
    const resultTouAct = lastToujeos.reduce(function (tot, arr) {
        return tot + arr.toujeoActivity;
    }, 0);
    utils_1.default.info(resultTouAct);
    return resultTouAct;
}
exports.default = default_1;
//# sourceMappingURL=toujeo.js.map