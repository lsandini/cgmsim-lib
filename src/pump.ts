import logger from './utils';

 //const logger = pino();
import * as moment from 'moment';


export default function({ treatments, profiles, pumpBasals }, env) {
    const dia = parseInt(env.DIA);
    const basalAsBoluses = [];
    const endDiaAction = moment();
    const startDiaAction = moment().add(-dia, 'hour').set({ minute: 0, second: 0, millisecond: 0 });

    const lastProfile = profiles
        .filter(e => e.store.Default && e.store['Default'])
        .sort((first, second) => second.startDate - first.startDate)[0];

    if (!lastProfile) {
        return 0;
    }
    const defaultProfileBasals = lastProfile.store.Default.basal;


	const now = moment();
    const allTempBasals = treatments
        .filter(e =>
            e._id &&
            e.create_at &&
            moment(e.create_at).diff(now, 'minutes') <= (60 * dia) && // temps basals set in the last 3 hours
            e.eventType === 'Temp Basal' &&
            e.duration != 0
        )
        .sort((f, s) => {
            return moment(f.create_at).diff(s.create_at);
        });
    //compute basal from entries
    const computedTempBasal = [];
    allTempBasals.forEach((b) => {
        if (b.absolute !== undefined) {
            const start = moment(b.create_at);
            computedTempBasal.push({
                start,
                insulin: b.absolute,
                end: start.add(b.duration, 'minutes')
            });
        } else {
            const currentIndex = computedTempBasal.length - 1;
            if (currentIndex >= 0) {
                computedTempBasal[currentIndex].end = moment(b.create_at);
            }
        }
    });

    const basalsToUpdate = [];
    for (let currentAction = startDiaAction; currentAction.diff(endDiaAction) <= 0; currentAction.add(5, 'minutes')) {
        const storedBasal = pumpBasals.find(b => currentAction.diff(moment(b.date)) < 1000);
        
		if (storedBasal) {
            basalAsBoluses.push({
                ...storedBasal
            });

        } else {
            const tempBasalActives = allTempBasals
                .filter(t => {
                    t.start.diff(currentAction) <= 0 &&
                        t.end.diff(currentAction) > 0;
                });
            let basalToUpdate;
            //if there is a temp basal actives
            if (tempBasalActives.length > 0) {
                basalToUpdate = {
                    date: currentAction.toDate(),
                    time: currentAction.toDate(),
                    insulin: tempBasalActives.insulin / 12,
                };
            } else {
                const compatiblesBasalProfiles = defaultProfileBasals.filter(b => {
                    return b.time.localeCompare(currentAction.format('HH:mm')) <= 0;
                });
                const index = compatiblesBasalProfiles.length - 1;
                const currentBasal = compatiblesBasalProfiles[index];

                basalToUpdate = {
                    date: currentAction.toDate(),
                    time: currentAction.toDate(),
                    insulin: currentBasal.value / 12,
                };
            }
            basalsToUpdate.push(basalToUpdate);
            basalAsBoluses.push(basalToUpdate);
        }
    }
    pumpBasals.push(...basalsToUpdate);
    logger.info('\x1b[32m', '------------------pumpBasals %o', pumpBasals.length, '\x1b[0m');

    const td = dia * 60;
    const tp = parseInt(env.TP);
    const tau = tp * (1 - tp / td) / (1 - 2 * tp / td);
    const a = 2 * tau / td;
    const S = 1 / (1 - a + (1 + a) * Math.exp(-td / tau));

    const timeSincePumpAct = basalAsBoluses.map(entry => {
        const t = now.diff(entry.time, 'minute');
        const insulin = entry.insulin;
        return {
            ...entry,
            time: t,
            activityContrib: insulin * (S / Math.pow(tau, 2)) * t * (1 - t / td) * Math.exp(-t / tau)
        };
    });

    // logger.info('basal as boluses with detailed activities: %o', timeSincePumpAct);

    const lastPumpInsulins = timeSincePumpAct.filter(function(e) {
        return e.time <= (dia * 60 * 1000);
    });
    //  logger.info('these are the last pump basal insulins and detailed activities: %o', lastPumpInsulins);

    const resultPumpAct = lastPumpInsulins.reduce(function(tot, arr) {
        return tot + arr.activityContrib;
    }, 0);
    logger.info('this is the aggregated insulin activity from pump basal in the last dia hours: %o', resultPumpAct);

    const pumpBasalAct = JSON.stringify(resultPumpAct, null, 4);
    logger.info('the pump\'s basal activity is: %o', pumpBasalAct);

    return Math.round(resultPumpAct * 100000) / 100000;
}