"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const setupParams_1 = require("./setupParams");
const node_fetch_1 = require("node-fetch");
//const logger = pino();
const downloads = (nsUrl, apiSecret) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const _nsUrl = utils_1.removeTrailingSlash(nsUrl);
    const _isHttps = utils_1.isHttps(nsUrl);
    const { getParams } = setupParams_1.default(apiSecret, _isHttps);
    const api_url = _nsUrl + '/api/v1/treatments';
    const api_profile = _nsUrl + '/api/v1/profile.json';
    const api_sgv = _nsUrl + '/api/v1/entries/sgv.json';
    const treatments = node_fetch_1.default(api_url, getParams);
    const profiles = node_fetch_1.default(api_profile, getParams);
    const entries = node_fetch_1.default(api_sgv, getParams);
    return Promise.all([treatments, profiles, entries])
        .then(([resTreatments, resProfile, resEntries]) => {
        return Promise.all([resTreatments.json(), resProfile.json(), resEntries.json()]);
    })
        .then(([treatments, profiles, entries,]) => {
        return {
            treatments,
            profiles,
            entries,
        };
    })
        .catch(err => {
        utils_1.default.error(err);
        throw new Error(err);
    });
});
exports.default = downloads;
//# sourceMappingURL=downloads.js.map