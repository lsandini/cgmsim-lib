"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_2 = require("./utils");
const utils_3 = require("./utils");
//const logger = pino();
function default_2(weight, detemirs) {
    utils_2.default.info(detemirs);
    // activities be expressed as U/min !!!
    const timeSinceDetemirAct = detemirs.map(entry => {
        const hoursAgo = entry.minutesAgo / 60;
        const insulin = entry.insulin;
        const duration = (14 + (24 * insulin / weight));
        const peak = (duration / 3);
        const { activity } = utils_3.Activity(peak, duration, hoursAgo, insulin);
        return {
            hoursAgo,
            detemirActivity: activity
        };
    });
    utils_2.default.info('these are the detemir activities: %o', timeSinceDetemirAct);
    // compute the aggregated activity of last detemirs in 30 hours
    const lastDetemirs = timeSinceDetemirAct.filter((e) => e.hoursAgo <= 30);
    utils_2.default.info('these are the last detemirs and activities: %o', lastDetemirs);
    const resultDetAct = lastDetemirs.reduce(function (tot, arr) {
        return tot + arr.detemirActivity;
    }, 0);
    utils_2.default.info(resultDetAct);
    return resultDetAct;
}
exports.default = default_2;
;
//# sourceMappingURL=detemir.js.map