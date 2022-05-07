"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_2 = require("./utils");
const utils_3 = require("./utils");
//const logger = pino();
function default_2(degludecs) {
    utils_2.default.info(degludecs);
    // activities be expressed as U/min !!!
    const timeSinceDegludecAct = degludecs.map(entry => {
        const hoursAgo = entry.minutesAgo / 60;
        const insulin = entry.insulin;
        const duration = 42;
        const peak = (duration / 3);
        const { activity } = utils_3.Activity(peak, duration, hoursAgo, insulin);
        return {
            hours: hoursAgo,
            degludecActivity: activity,
        };
    });
    utils_2.default.info('these are the degludec activities: %o', timeSinceDegludecAct);
    // compute the aggregated activity of last degludecs in 45 hours
    const lastDegludecs = timeSinceDegludecAct.filter((e) => e.hours <= 45);
    utils_2.default.info('these are the last degludecs and activities: %o', lastDegludecs);
    const resultDegAct = lastDegludecs.reduce((tot, arr) => tot + arr.degludecActivity, 0);
    utils_2.default.info(resultDegAct);
    return resultDegAct;
}
exports.default = default_2;
;
//# sourceMappingURL=degludec.js.map