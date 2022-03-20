const moment = require('moment');
const pump = require('./pump.js');

const sgv_start = ({ entries, det, gla, degludec, tou, liver, carbs, resultAct, perls, pumpBasals, profiles, treatments, }, env) => {

    const oldSgv = entries && entries[0] ? entries[0].sgv : 90;
    const oldTime = entries && entries[0] ? moment(entries[0].mills) : moment().add(-5, 'minutes');

    const deltaMinutes = Math.round(moment().diff(oldTime, 'seconds') / 60);
    console.log('deltaMinutes', deltaMinutes);

    const ISF = parseInt(env.ISF) / 18; //mmol/l/U
    //console.log('ISF=', ISF);

    // ENABLE THIS FOR PUMP SIMULATION
    //=================================

    console.log('profiles', profiles);
    let pumpBasalAct = 0;
    if (env.pumpEnabled) {
        pumpBasalAct = pump({
            treatments,
            profiles,
            pumpBasals,
        }, env);
    }

    const globalBasalAct = gla + det + tou + degludec;

    const globalMealtimeAct = resultAct;

    const globalInsulinAct = globalBasalAct + globalMealtimeAct + pumpBasalAct;

    const BGI_ins = (globalInsulinAct * deltaMinutes * ISF) * -1;

    const today = new Date();

    const liver_bgi = liver * deltaMinutes;

    const timeSincePerlin = perls.map(entry => ({
        ...entry,
        time: (Date.now() - moment(entry.time).valueOf()) / (1000 * 60)
    }));

    const lastPerls = timeSincePerlin.filter(function(e) {
        return e.time >= 0 && e.time <= 5; // keep only the latest noise value
    });

    const noise = lastPerls && lastPerls.length > 0 ? (lastPerls[0].noise * 6) : 0;

    const sgv_pump = Math.floor(oldSgv + (BGI_ins * 18) + (liver_bgi * 18) + (carbs * 18) + (noise * 18));
    let limited_sgv_pump = sgv_pump;
    if (sgv_pump >= 400) {
        limited_sgv_pump = 400;
    } else if (sgv_pump <= 40) {
        limited_sgv_pump = 40;
    }
    const dict = {
        dateString: today,
        sgv: limited_sgv_pump,
        type: 'sgv',
        date: Date.now(),
    };

    console.log('-------------------------------------------');
    console.log('OLD SGV value (' + deltaMinutes + ' minutes ago):', oldSgv, 'mg/dl');

    console.log('-------------------------------------------');
    console.log('total BG impact of insulin for ' + deltaMinutes + ' minutes:', BGI_ins * 18, 'mg/dl');
    
    console.log('-------------------------------------------');
    console.log('total BG impact of liver for ' + deltaMinutes + ' minutes: +', liver_bgi * 18, 'mg/dl');
    
    console.log('-------------------------------------------');
    console.log('total CARBS impact of carbs for ' + deltaMinutes + ' minutes: +', carbs * 18, 'mg/dl');
    
	console.log('-------------------------------------------');
    console.log('total NOISE impact: +', noise * 18, 'mg/dl');

    console.log('-------------------------------------------');
    console.log('total BG impact of carbs, liver and insulin for 5 minutes: +', (BGI_ins) + (liver_bgi * 18) + (carbs * 18), 'mg/dl');
    
    console.log('this is the PUMP BASAL insulin impact for ' + deltaMinutes + ' minutes:', pumpBasalAct * deltaMinutes * 18 * ISF);
    console.log('this is the BASAL BOLUS  insulin impact for ' + deltaMinutes + ' minutes:', globalBasalAct * deltaMinutes * 18 * ISF);
    console.log('this is the MEAL BOLUS insulin impact for ' + deltaMinutes + ' minutes:', globalMealtimeAct * deltaMinutes * 18 * ISF);
    
    return dict;
};

module.exports = sgv_start;