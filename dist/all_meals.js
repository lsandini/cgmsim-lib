"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_2 = require("./utils");
const utils_3 = require("./utils");
//const logger = pino();
function default_2(treatments) {
    const meals = treatments
<<<<<<< HEAD
        .filter(e => e.carbs && utils_3.getDeltaMinutes(e.created_at) > 360)
        .filter(e => e.carbs && utils_3.getDeltaMinutes(e.created_at) <= 360)
        .map(e => (Object.assign(Object.assign({}, e), { minutesAgo: utils_3.getDeltaMinutes(e.created_at) })));
    utils_2.default.info('Last 6 hours meal: %o', meals);
=======
        .filter(e => e.carbs && utils_2.getDeltaMinutes(e.created_at) <= 360)
        .map(e => (Object.assign(Object.assign({}, e), { minutesAgo: utils_2.getDeltaMinutes(e.created_at) })));
    utils_1.default.info('Last 6 hours meal: %o', meals);
>>>>>>> d08e246e4ae22d06b600934b6c5536b408e30940
    return meals;
}
exports.default = default_2;
//# sourceMappingURL=all_meals.js.map