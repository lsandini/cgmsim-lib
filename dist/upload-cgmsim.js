"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const utils_2 = require("./utils");
const setupParams_1 = require("./setupParams");
//const logger = pino();
function default_2(cgmsim, nsUrl, apiSecret) {
    const { postParams } = setupParams_1.default(apiSecret);
    const api_url = nsUrl + '/api/v1/entries/';
    const body_json = JSON.stringify(cgmsim);
    return node_fetch_1.default(api_url, Object.assign(Object.assign({}, postParams), { body: body_json }))
        .then(() => {
        utils_2.default.info('NIGTHSCOUT Updated');
    })
        .catch(err => {
        utils_2.default.info(err);
    });
}
exports.default = default_2;
//# sourceMappingURL=upload-cgmsim.js.map