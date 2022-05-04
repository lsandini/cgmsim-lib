"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const utils_2 = require("./utils");
//const logger = pino();
function default_1(treatments) {
    const meals = treatments
        .filter(e => e.carbs && utils_2.getDeltaMinutes(e.mills) > 360)
        .map(e => (Object.assign(Object.assign({}, e), { minutesAgo: utils_2.getDeltaMinutes(e.mills) })));
    utils_1.default.info('Last 6 hours meal:', meals);
    return meals;
}
exports.default = default_1;
//# sourceMappingURL=all_meals.js.map