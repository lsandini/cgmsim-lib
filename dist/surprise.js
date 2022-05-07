"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const utils_2 = require("./utils");
//const logger = pino();
function default_2({ treatments }) {
    // let's read all the meals gathered by get-all.sh, and compute the total amount of carbs
    // in the 1410 last minutes (23:30 min)
    if (moment().hours() === 23) {
        const totalMeals = treatments.filter(entry => moment(entry.mills).format('YYYYMMDD') === moment().format('YYYYMMDD'));
        utils_2.default.info('totalMeals  %o', totalMeals);
        const totalCarbs = totalMeals.reduce(function (tot, arr) {
            return tot + arr.carbs;
        }, 0);
        utils_2.default.info(totalCarbs);
        if (totalCarbs < 200) {
            return {
                time: Date.now(),
                carbs: (200 - totalCarbs).toString(),
                enteredBy: 'surprise_Meal_Generator',
            };
        }
        return null;
    }
    else {
        return null;
    }
}
exports.default = default_2;
//# sourceMappingURL=surprise.js.map