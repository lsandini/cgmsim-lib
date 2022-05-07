"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sinus_1 = require("./sinus");
const utils_2 = require("./utils");
//const logger = pino();
function default_2(isf, cr) {
    const _ISF = isf / 18;
    const _CR = cr;
    utils_2.default.info('ISF:', isf, 'CR: %o', cr);
    // the sinus and cosinus numbers vary around 1, from 0.5 to 1.5:
    // sin starts at 1.0 at midnight, is max at 6AM, is again 1 at 12 AM, and minimums at 0.5 a 6 PM
    // cosin starts at 1.5 at midnight, is 1 at 6AM, is minimus at 0.5 12 AM, and is 1 again at 6 PM
    const { sinus, cosinus } = sinus_1.default(Date.now());
    utils_2.default.info('sinus:  %o', sinus);
    utils_2.default.info('cosinus:  %o', cosinus);
    // let's simulate the carb impact of the liver, producing 10g of carbs / hour
    // if the ISF is 2 mmol/l/U,
    // and the CR is 10g/U,
    // => the the CF (carb factor) is 0.2 mmol/l/ 1g
    // so the BG increases 2 mmol/l/h, (every time 10g of carbs are delivered)
    // 0.2 mmol/l/h *10g /12 periods => bgi every 5 minutes or 0,166666 mmol/l/5min
    // by multiplying the liver_bgi by the sin function, the liver loog glucose production varies in a sinusoidal
    // form, being maximal at 6 AM and minimal ad 6 PM
    const liver = (_ISF / _CR) * (10 / 60);
    const liver_sin = liver * sinus;
    utils_2.default.info('liver:  %o', liver);
    utils_2.default.info('liver_sin:  %o', liver_sin);
    return liver_sin;
}
exports.default = default_2;
//# sourceMappingURL=liver.js.map