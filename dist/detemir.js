"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const utils_2 = require("./utils");
//const logger = pino();
function default_1(weight, detemirs) {
    utils_1.default.info(detemirs);
    // activities be expressed as U/min !!!
    const timeSinceDetemirAct = detemirs.map(entry => {
        const hoursAgo = entry.minutesAgo / 60;
        const insulin = entry.insulin;
        const duration = (14 + (24 * insulin / weight));
        const peak = (duration / 3);
        const { activity } = utils_2.InsulinActivity(peak, duration, hoursAgo, insulin);
        return {
            hoursAgo,
            detemirActivity: activity
        };
    });
    utils_1.default.info('these are the detemir activities: %o', timeSinceDetemirAct);
    // compute the aggregated activity of last detemirs in 30 hours
    const lastDetemirs = timeSinceDetemirAct.filter((e) => e.hoursAgo <= 30);
    utils_1.default.info('these are the last detemirs and activities: %o', lastDetemirs);
    const resultDetAct = lastDetemirs.reduce(function (tot, arr) {
        return tot + arr.detemirActivity;
    }, 0);
    utils_1.default.info(resultDetAct);
    return resultDetAct;
}
exports.default = default_1;
;
//# sourceMappingURL=detemir.js.map