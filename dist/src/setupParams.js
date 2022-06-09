"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createHash } = require('crypto');
const https = require('https');
function default_1(apiSecret, isHttps = true) {
    const agent = isHttps ? new https.Agent({ rejectUnauthorized: false, }) : null;
    const hash = createHash('sha1');
    hash.update(apiSecret);
    const hash_secret = hash.digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'api-secret': hash_secret
    };
    return {
        getParams: {
            method: 'GET',
            headers,
            agent,
        },
        postParams: {
            method: 'POST',
            headers,
            agent,
        },
    };
}
exports.default = default_1;
;
//# sourceMappingURL=setupParams.js.map