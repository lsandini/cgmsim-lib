"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
function default_1(profile) {
    let lastProfile = null;
    let lastProfiles = profile
        .sort((first, second) => moment(second.startDate).diff(-moment(first.startDate)));
    if (!lastProfiles || lastProfiles.length === 0) {
        return 0;
    }
    lastProfile = lastProfiles[0];
    const defaultProfile = lastProfile.defaultProfile;
    const defaultProfileBasals = lastProfile.store[defaultProfile].basal;
    return defaultProfileBasals / 60;
}
exports.default = default_1;
//# sourceMappingURL=basalProfile.js.map