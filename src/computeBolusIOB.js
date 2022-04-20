const logger = require('pino')();
const moment = require('moment');
module.exports = ({ treatments }, env) => {


    const insulin = treatments
        .filter(e => e.insulin)
        .map(e => ({
            time: e.created_at,
            insulin: e.insulin
        }));
    logger.info('this is the filtered treatments (insulin):', insulin);
    logger.info('length', insulin.length); // returns the number of boluses or lenghth of the array

    // dia is the duration of insulin action in hours
    const dia = parseInt(env.DIA);
    // td is the total duration of insulin action in minutes
    const td = dia * 60;
    // tp is the time to the peak insulin action in minutes
    const tp = parseInt(env.TP);



    const tau = tp * (1 - tp / td) / (1 - 2 * tp / td);
    const a = 2 * tau / td;
    const S = 1 / (1 - a + (1 + a) * Math.exp(-td / tau));

    const timeSinceBolusMin = insulin.map(entry => ({
        ...entry,
        time: (Date.now() - moment(entry.time).valueOf()) / (1000 * 60)
    }));
    logger.info('this is the trimmed down insulin and time since injection data:', timeSinceBolusMin);

    const timeSinceBolusAct = insulin.map(entry => {
        const t = (Date.now() - moment(entry.time).valueOf()) / (1000 * 60);
        const insulin = entry.insulin;
        return {
            ...entry,
            time: t,
            activityContrib: insulin * (S / Math.pow(tau, 2)) * t * (1 - t / td) * Math.exp(-t / tau),
            iobContrib: insulin * (1 - S * (1 - a) * ((Math.pow(t, 2) / (tau * td * (1 - a)) - t / tau - 1) * Math.exp(-t / tau) + 1))
        };
    });
    //logger.info(timeSinceBolusAct);

    const lastInsulins = timeSinceBolusAct.filter(function(e) {
        return e.time <= 300;
    });
    logger.info('these are the last insulins and activities:', lastInsulins);

    const resultAct = lastInsulins.reduce(function(tot, arr) {
        return tot + arr.activityContrib;
    }, 0);
	
    const resultIob = lastInsulins.reduce(function(tot, arr) {
        return tot + arr.iobContrib;
    }, 0);


    return {
        resultAct,
        resultIob
    };

};