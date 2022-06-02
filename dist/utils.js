"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBase = exports.getDeltaMinutes = exports.getInsulinActivity = exports.removeTrailingSlash = exports.isHttps = void 0;
const node_fetch_1 = require("node-fetch");
const moment = require("moment");
const pino_1 = require("pino");
const setupParams_1 = require("./setupParams");
const logger = pino_1.default({
    level: (_a = process.env.LOG_LEVEL) !== null && _a !== void 0 ? _a : 'error',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});
exports.default = logger;
function isHttps(str) {
    var _a;
    return ((_a = str.match(/^https/)) === null || _a === void 0 ? void 0 : _a.length) > 0;
}
exports.isHttps = isHttps;
function removeTrailingSlash(str) {
    return str.endsWith('/') ? str.slice(0, -1) : str;
}
exports.removeTrailingSlash = removeTrailingSlash;
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
function uploadBase(cgmsim, nsUrlApi, apiSecret) {
    const _isHttps = isHttps(nsUrlApi);
    const { postParams } = setupParams_1.default(apiSecret, _isHttps);
    const body_json = JSON.stringify(cgmsim);
    return node_fetch_1.default(nsUrlApi, Object.assign(Object.assign({}, postParams), { body: body_json }))
        .then(() => {
        logger.debug('NIGTHSCOUT Updated');
    })
        .catch(err => {
        logger.debug(err);
    });
}
exports.uploadBase = uploadBase;
//# sourceMappingURL=utils.js.map