"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const utils_2 = require("./utils");
//const logger = pino();
function default_1(treatments) {
    const meals = treatments
        .filter(e => e.carbs && (0, utils_2.getDeltaMinutes)(e.created_at) > 360)
        .map(e => (Object.assign(Object.assign({}, e), { minutesAgo: (0, utils_2.getDeltaMinutes)(e.created_at) })));
    utils_1.default.info('Last 6 hours meal: %o', meals);
    return meals;
}
exports.default = default_1;
//# sourceMappingURL=all_meals.js.map