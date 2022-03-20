const moment = require('moment');
module.exports = function(treatments) {

	//Find basal boluses
    const basal = treatments && treatments.length ? treatments.filter(e => e.notes && e.insulin && e.drug !== 'hum')
        .map(e => ({
            time: e.created_at,
            notes: e.notes,
            insulin: e.insulin,
            empty_space: e.notes.indexOf(' ')
        })) : [];

    const basals = basal.map(entry => ({
        ...entry,
        time: moment(entry.time).valueOf()
    }));
    const timeSinceBasalMin = basals.map(entry => ({
        ...entry,
        time: (Date.now() - moment(entry.time).valueOf()) / (1000 * 60 * 60),
        drug: entry.notes.slice(0, 3),
        //		insulin: parseInt(entry.notes.slice(entry.empty_space), 10)
    }));

    const lastBasals = timeSinceBasalMin.filter(function(e) {
        return e.time <= 45; // keep only the basals from the last 45 hours
    });

    const lastGLA = lastBasals.filter(function(e) {
        return e.drug === 'gla' || e.drug === 'Gla' || e.drug === 'lan' || e.drug === 'Lan'; // keep only the glas from the last 45 hours
    });

    const lastDET = lastBasals.filter(function(e) {
        return e.drug === 'det' || e.drug === 'Det' || e.drug === 'lev' || e.drug === 'Lev'; // keep only the dets from the last 45 hours
    });

    const lastTOU = lastBasals.filter(function(e) {
        return e.drug === 'tou' || e.drug === 'Tou'; // keep only the tous from the last 45 hours
    });

    const lastDEG = lastBasals.filter(function(e) {
        return e.drug === 'deg' || e.drug === 'Deg' || e.drug === 'tre' || e.drug === 'Tre'; // keep only the degs from the last 45 hours
    });

    return {
        lastDET,
        lastGLA,
        lastTOU,
        lastDEG,
    };
};