"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function default_1(notes, nsUrl, apiSecret) {
    const api_url = nsUrl + '/api/v1/treatments/';
    const noteTreatment = { type: 'Note', notes };
    return utils_1.uploadBase(noteTreatment, api_url, apiSecret);
}
exports.default = default_1;
//# sourceMappingURL=upload-notes.js.map