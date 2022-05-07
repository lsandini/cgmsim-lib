"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const utils_1 = require("./utils");
const setupParams_1 = require("./setupParams");
//const logger = pino();
function default_1(cgmsim, nsUrl, apiSecret) {
    const { postParams } = (0, setupParams_1.default)(apiSecret);
    const api_url = nsUrl + '/api/v1/entries/';
    const body_json = JSON.stringify(cgmsim);
    return (0, node_fetch_1.default)(api_url, Object.assign(Object.assign({}, postParams), { body: body_json }))
        .then(() => {
        utils_1.default.info('NIGTHSCOUT Updated');
    })
        .catch(err => {
        utils_1.default.info(err);
    });
}
exports.default = default_1;
//# sourceMappingURL=upload-cgmsim.js.map