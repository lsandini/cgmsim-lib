"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBasalActivity = exports.durationBasal = exports.peakBasal = void 0;
const utils_1 = require("./utils");
exports.peakBasal = {
    GLA: (duration) => duration / 2.5,
    DET: (duration) => duration / 3,
    TOU: (duration) => duration / 2.5,
    DEG: (duration) => duration / 3,
};
exports.durationBasal = {
    GLA: (insulin, weight) => (22 + (12 * insulin / weight)) * 60,
    DET: (insulin, weight) => (14 + (24 * insulin / weight)) * 60,
    TOU: (insulin, weight) => (24 + (14 * insulin / weight)) * 60,
    DEG: () => 42 * 60,
};
const computeBasalActivity = (treatments) => {
    // activities be expressed as U/min !!!
    const treatmentsActivity = treatments.map(e => {
        const minutesAgo = e.minutesAgo;
        const insulin = e.insulin;
        const activity = utils_1.getInsulinActivity(e.peak, e.duration, minutesAgo, insulin);
        return activity > 0 ? activity : 0;
    });
    utils_1.default.debug('these are the last Slow INSULINS: %o', treatmentsActivity);
    const resultAct = treatmentsActivity.reduce((tot, activity) => {
        return tot + activity;
    }, 0);
    return resultAct;
};
exports.computeBasalActivity = computeBasalActivity;
function default_1(treatments, weight) {
    //Find basal boluses
    const basals = treatments && treatments.length ?
        treatments.filter(e => e.notes)
            .map(e => {
            const lastIndexEmptySpace = e.notes.lastIndexOf(' ');
            return Object.assign(Object.assign({}, e), { minutesAgo: utils_1.getDeltaMinutes(e.created_at), drug: e.notes.slice(0, 3), 
                // insulin: parseInt(e.notes.slice(-2)) 
                insulin: parseInt(e.notes.slice(lastIndexEmptySpace), 10) });
        })
            .filter(e => e.minutesAgo >= 0) : [];
    const lastBasals = basals.filter(function (e) {
        return e.minutesAgo <= 45 * 60; // keep only the basals from the last 45 hours
    });
    const lastGLA = lastBasals
        .filter((e) => {
        return e.drug === 'gla' || e.drug === 'Gla' || e.drug === 'lan' || e.drug === 'Lan'; // keep only the glas from the last 45 hours
    }).map(e => {
        const duration = exports.durationBasal.GLA(e.insulin, weight);
        const peak = exports.peakBasal.GLA(duration);
        return Object.assign(Object.assign({}, e), { duration,
            peak });
    });
    utils_1.default.debug('these are the last GLA: %o', lastGLA);
    const activityGLA = lastGLA.length > 0 ? exports.computeBasalActivity(lastGLA) : 0;
    utils_1.default.info('these is the total GLA activity: %o', activityGLA);
    const lastDET = lastBasals.filter(function (e) {
        return e.drug === 'det' || e.drug === 'Det' || e.drug === 'lev' || e.drug === 'Lev'; // keep only the dets from the last 45 hours
    }).map(e => {
        const duration = exports.durationBasal.DET(e.insulin, weight);
        const peak = exports.peakBasal.DET(duration);
        return Object.assign(Object.assign({}, e), { duration,
            peak });
    });
    utils_1.default.debug('these are the last DET: %o', lastDET);
    const activityDET = lastDET.length ? exports.computeBasalActivity(lastDET) : 0;
    utils_1.default.info('these is the total DET activity: %o', activityDET);
    const lastTOU = lastBasals.filter(function (e) {
        return e.drug === 'tou' || e.drug === 'Tou'; // keep only the tous from the last 45 hours
    })
        .map(e => {
        const duration = exports.durationBasal.TOU(e.insulin, weight);
        const peak = exports.peakBasal.TOU(duration);
        return Object.assign(Object.assign({}, e), { duration,
            peak });
    });
    utils_1.default.debug('these are the last TOU: %o', lastTOU);
    const activityTOU = lastTOU.length ? exports.computeBasalActivity(lastTOU) : 0;
    utils_1.default.info('these is the total TOU activity: %o', activityTOU);
    const lastDEG = lastBasals.filter(function (e) {
        return e.drug === 'deg' || e.drug === 'Deg' || e.drug === 'tre' || e.drug === 'Tre'; // keep only the degs from the last 45 hours
    }).map(e => {
        const duration = exports.durationBasal.DEG();
        const peak = exports.peakBasal.DEG(duration);
        return Object.assign(Object.assign({}, e), { duration,
            peak });
    });
    utils_1.default.debug('these are the last deg: %o', lastDEG);
    const activityDEG = lastDEG.length ? exports.computeBasalActivity(lastDEG) : 0;
    utils_1.default.info('these is the total deg activity: %o', activityDEG);
    return activityDEG + activityDET + activityGLA + activityTOU;
}
exports.default = default_1;
//# sourceMappingURL=basal.js.map