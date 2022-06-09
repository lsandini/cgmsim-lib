"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
//const logger = pino();
function default_1(sgvLast, sgv1, sgv2, sgv3) {
    const arrows = [];
    if (sgvLast && sgv1 && sgv2 && sgv3) {
        const sgvdir1 = sgvLast - sgv1;
        const sgvdir2 = sgv1 - sgv2;
        const sgvdir3 = sgv2 - sgv3;
        const sgvdir15min = (sgvdir1 + sgvdir2 + sgvdir3) / 3;
        utils_1.default.debug('this is the mean SGV 5 min variation in the last 15 minutes: %o', sgvdir15min, 'mg/dl');
        if (sgvdir15min < -10) {
            arrows.push({
                sgvdir: sgvdir15min,
                direction: 'DoubleDown'
            });
        }
        else if (sgvdir15min < -6) {
            arrows.push({
                sgvdir: sgvdir15min,
                direction: 'SingleDown'
            });
        }
        else if (sgvdir15min < -2) {
            arrows.push({
                sgvdir: sgvdir15min,
                direction: 'FortyFiveDown'
            });
        }
        else if (sgvdir15min < 2) {
            arrows.push({
                sgvdir: sgvdir15min,
                direction: 'Flat'
            });
        }
        else if (sgvdir15min < 6) {
            arrows.push({
                sgvdir: sgvdir15min,
                direction: 'FortyFiveUp'
            });
        }
        else if (sgvdir15min < 10) {
            arrows.push({
                sgvdir: sgvdir15min,
                direction: 'SingleUp'
            });
        }
        else if (sgvdir15min >= 10) {
            arrows.push({
                sgvdir: sgvdir15min,
                direction: 'DoubleUp'
            });
        }
    }
    else {
        arrows.push({
            sgvdir: 0,
            direction: 'Flat'
        });
    }
    utils_1.default.info('New Arrows status result %o', arrows);
    return arrows;
}
exports.default = default_1;
//# sourceMappingURL=arrows.js.map