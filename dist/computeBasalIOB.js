"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
function default_1(treatments) {
    //Find basal boluses
    const basals = treatments && treatments.length ?
        treatments.filter(e => e.notes && e.insulin)
            .map(e => (Object.assign(Object.assign({}, e), { minutesAgo: (Date.now() - moment(e.mills).valueOf()) / (1000 * 60), drug: e.notes.slice(0, 3) }))) : [];
    const lastBasals = basals.filter(function (e) {
        return e.minutesAgo <= 45 * 60; // keep only the basals from the last 45 hours
    });
    const lastGLA = lastBasals.filter(function (e) {
        return e.drug === 'gla' || e.drug === 'Gla' || e.drug === 'lan' || e.drug === 'Lan'; // keep only the glas from the last 45 hours
    });
    const lastDET = lastBasals.filter(function (e) {
        return e.drug === 'det' || e.drug === 'Det' || e.drug === 'lev' || e.drug === 'Lev'; // keep only the dets from the last 45 hours
    });
    const lastTOU = lastBasals.filter(function (e) {
        return e.drug === 'tou' || e.drug === 'Tou'; // keep only the tous from the last 45 hours
    });
    const lastDEG = lastBasals.filter(function (e) {
        return e.drug === 'deg' || e.drug === 'Deg' || e.drug === 'tre' || e.drug === 'Tre'; // keep only the degs from the last 45 hours
    });
    const result = {
        lastDET,
        lastGLA,
        lastTOU,
        lastDEG,
    };
    return result;
}
exports.default = default_1;
//# sourceMappingURL=computeBasalIOB.js.map