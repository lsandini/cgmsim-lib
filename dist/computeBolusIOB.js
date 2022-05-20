"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
exports.default = (treatments, dia, peak) => {
    const insulin = treatments
        .filter(e => e.insulin)
        .map(e => ({
        minutesAgo: utils_1.getDeltaMinutes(e.created_at),
        insulin: e.insulin
    }))
        .filter(e => e.minutesAgo <= 300);
    utils_1.default.info('this is the filtered treatments (insulin): %o', insulin);
    utils_1.default.info('length %o', insulin.length); // returns the number of boluses or length of the array
    // dia is the duration of insulin action in hours
    const duration = dia * 60;
    const insulinsBolusAct = insulin.map(entry => {
        const insulin = entry.insulin;
        return utils_1.getInsulinActivity(peak, duration, entry.minutesAgo, insulin);
    });
    utils_1.default.info('these are the last insulins and activities: %o', insulinsBolusAct);
    const bolusAct = insulinsBolusAct.reduce(function (tot, activity) {
        return tot + activity;
    }, 0);
    return bolusAct;
};
//# sourceMappingURL=computeBolusIOB.js.map