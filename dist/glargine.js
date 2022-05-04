"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const utils_2 = require("./utils");
//const logger = pino();
function default_1(weight, glargines) {
    // const jsongla = JSON.stringify(glargines);
    // const glargines = JSON.parseWithDate(jsongla);
    utils_2.default.info(glargines);
    // activities be expressed as U/min !!!
    const timeSinceGlargineAct = glargines.map(entry => {
        const hoursAgo = entry.minutesAgo / 60;
        const insulin = entry.insulin;
        const duration = (22 + (12 * insulin / weight));
        const peak = (duration / 2.5);
        const { activity } = utils_1.Activity(peak, duration, hoursAgo, insulin);
        return {
            hoursAgo,
            glargineActivity: activity
        };
    });
    utils_2.default.info('the is the accumulated glargine activity:', timeSinceGlargineAct);
    // compute the aggregated activity of last glargines in 27 hours
    const lastGlargines = timeSinceGlargineAct.filter((e) => e.hoursAgo <= 30);
    utils_2.default.info('these are the last glargines and activities:', lastGlargines);
    const resultGlaAct = lastGlargines.reduce(function (tot, arr) {
        return tot + arr.glargineActivity;
    }, 0);
    utils_2.default.info(resultGlaAct);
    return resultGlaAct;
}
exports.default = default_1;
//# sourceMappingURL=glargine.js.map