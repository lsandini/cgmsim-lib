"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const utils_1 = require("./utils");
//const logger = pino();
function default_1({ treatments }) {
    // let's read all the meals gathered by get-all.sh, and compute the total amount of carbs
    // in the 1410 last minutes (23:30 min)
    if (moment().hours() === 23) {
        const totalMeals = treatments.filter(entry => moment(entry.mills).format('YYYYMMDD') === moment().format('YYYYMMDD'));
        utils_1.default.info('totalMeals ', totalMeals);
        const totalCarbs = totalMeals.reduce(function (tot, arr) {
            return tot + arr.carbs;
        }, 0);
        utils_1.default.info(totalCarbs);
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
exports.default = default_1;
//# sourceMappingURL=surprise.js.map