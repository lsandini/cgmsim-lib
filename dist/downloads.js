"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const setupParams_1 = require("./setupParams");
//const logger = pino();
const fetch = require('node-fetch');
const downloads = (nsUrl, apiSecret) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { getParams } = setupParams_1.default(apiSecret);
    const api_url = nsUrl + '/api/v1/treatments';
    const api_profile = nsUrl + '/api/v1/profile.json';
    const api_sgv = nsUrl + '/api/v1/entries/sgv.json';
    const treatments = yield fetch(api_url, getParams)
        .then(resTreatments => resTreatments.json())
        .catch(err => utils_1.default.error(err));
    const profiles = yield fetch(api_profile, getParams)
        .then(resProfile => resProfile.json());
    const entries = yield fetch(api_sgv, getParams)
        .then(resSGV => resSGV.json());
    return {
        treatments,
        profiles,
        entries,
    };
});
exports.default = downloads;
//# sourceMappingURL=downloads.js.map