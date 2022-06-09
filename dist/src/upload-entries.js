"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const moment = require("moment");
function default_1(cgmsim, nsUrl, apiSecret) {
    const _nsUrl = utils_1.removeTrailingSlash(nsUrl);
    const api_url = _nsUrl + '/api/v1/entries/';
    const now = moment();
    const entry = Object.assign(Object.assign({}, cgmsim), { type: 'sgv', dateString: now.toISOString(), date: now.toDate().getTime() });
    return utils_1.uploadBase(entry, api_url, apiSecret);
}
exports.default = default_1;
//# sourceMappingURL=upload-entries.js.map