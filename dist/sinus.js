"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// this computes a sinusoidal curve from midnight to midnight, oscillating between 5 and 6 mmol/l
const utils_1 = require("./utils");
//const logger = pino();
function default_1(now) {
    //timestamp in milliseconds;
    utils_1.default.info('timestamp in milliseconds %o', now);
    // timestamp in days;
    utils_1.default.info('timestamp in days %o', now / 86400000);
    // timestamp in days rounded;
    utils_1.default.info('timestamp in days rounded %o', Math.floor(now / 86400000));
    //timestamp in fraction of a day;
    utils_1.default.info('timestamp in fraction of a day %o', (now / 86400000) - (Math.floor(now / 86400000)));
    //fraction of a day in hours;
    utils_1.default.info('fraction of a day in hours %o', ((now / 86400000) - (Math.floor(now / 86400000))) * 24);
    //fraction of a day in hours adding 2 for UTC+2;
    utils_1.default.info('fraction of a day in hours adding 2 for UTC+2 %o', (((now / 86400000) - (Math.floor(now / 86400000))) * 24) + 2);
    // time of the day in hours - decimals, not minutes
    const hours = ((((now / 86400000) - (Math.floor(now / 86400000))) * 24) + 2);
    utils_1.default.info('time of the day in hours - using decimals, not minutes:  %o', hours.toFixed(2));
    // express minutes also;
    const hoursAbs = Math.floor(hours);
    const minutes = (hours - hoursAbs) * 60;
    utils_1.default.info('express minutes in minutes also: %o', minutes.toFixed(), 'minutes');
    // time of the day in 2 pi cycle;
    const daycycle = ((hours * Math.PI) / 12);
    utils_1.default.info('time of the day in 2 pi cycle %o', daycycle.toFixed(2));
    // time of the day in 360 deg cycle;
    const dayCycleDeg = ((hours * 360) / 24);
    utils_1.default.info('time of the day in 360 deg cycle %o', dayCycleDeg.toFixed(2));
    // value of the sin function according to hours, oscillating from -1 to +1;
    const SIN = Math.sin(dayCycleDeg * Math.PI / 180);
    utils_1.default.info('value of the sin function according to hours, oscillating from -1 to +1:  %o', SIN.toFixed(2));
    // value of the sin function oscillating between 0 and 2;
    const sinInterm = (Math.sin(dayCycleDeg * Math.PI / 180) + 1);
    utils_1.default.info('value of the sin function oscillating between 0 and 2:  %o', sinInterm.toFixed(2));
    //==========================================================================================
    // value of the sin function oscillating around 1, +/- 20 %
    //==========================================================================================
    const sinFunction = (Math.sin(dayCycleDeg * Math.PI / 180));
    const sinCorr = (sinFunction / 5) + 1;
    utils_1.default.info('value of the sin function oscillating around 1, +/- 20 %, starting from 1 and ending in 1:  %o', sinCorr.toFixed(2));
    utils_1.default.info('When the time of day is ' + hours.toFixed() + ' hours and ' + minutes.toFixed() + ' minutes, the sinusoidal value is: ' + sinCorr.toFixed(3));
    //==========================================================================================
    // value of the cos function oscillating around 1, +/- 20 %
    //==========================================================================================
    const cosinFunction = (Math.cos(dayCycleDeg * Math.PI / 180));
    const COScorr = (cosinFunction / 5) + 1;
    utils_1.default.info('value of the cos function oscillating around 1, +/- 0.5, starting from 1.5 and ending in 1.5: :  %o', COScorr.toFixed(2));
    utils_1.default.info('When the time of day is ' + hours.toFixed() + ' hours and ' + minutes.toFixed() + ' minutes, the cosinusoidal value is: ' + COScorr.toFixed(3));
    const sinCurves = {
        sinus: sinCorr,
        cosinus: COScorr
    };
    return sinCurves;
}
exports.default = default_1;
//# sourceMappingURL=sinus.js.map