"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBase = exports.getDeltaMinutes = exports.getInsulinActivity = void 0;
const node_fetch_1 = require("node-fetch");
const moment = require("moment");
const pino_1 = require("pino");
const setupParams_1 = require("./setupParams");
const logger = pino_1.default({
    level: process.env.LOG_LEVEL,
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});
exports.default = logger;
function getInsulinActivity(peakMin, durationMin, timeMin, insulin) {
    const tau = peakMin * (1 - peakMin / durationMin) / (1 - 2 * peakMin / durationMin);
    const a = 2 * tau / durationMin;
    const S = 1 / (1 - a + (1 + a) * Math.exp(-durationMin / tau));
    const activity = (insulin * (S / Math.pow(tau, 2)) * timeMin * (1 - timeMin / durationMin) * Math.exp(-timeMin / tau));
    return activity;
}
exports.getInsulinActivity = getInsulinActivity;
const getDeltaMinutes = (mills) => Math.round(moment().diff(moment(mills), 'seconds') / 60);
exports.getDeltaMinutes = getDeltaMinutes;
function uploadBase(cgmsim, api_url, apiSecret) {
    const { postParams } = setupParams_1.default(apiSecret);
    const body_json = JSON.stringify(cgmsim);
    return node_fetch_1.default(api_url, Object.assign(Object.assign({}, postParams), { body: body_json }))
        .then(() => {
        logger.debug('NIGTHSCOUT Updated');
    })
        .catch(err => {
        logger.debug(err);
    });
}
exports.uploadBase = uploadBase;
//# sourceMappingURL=utils.js.map