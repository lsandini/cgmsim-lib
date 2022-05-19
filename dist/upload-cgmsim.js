"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function default_1(cgmsim, nsUrl, apiSecret) {
    const api_url = nsUrl + '/api/v1/entries/';
    return utils_1.uploadBase(cgmsim, api_url, apiSecret);
}
exports.default = default_1;
//# sourceMappingURL=upload-cgmsim.js.map