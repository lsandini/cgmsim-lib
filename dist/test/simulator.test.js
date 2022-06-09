"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CGMSIMsimulator_1 = require("../src/CGMSIMsimulator");
const moment = require("moment");
const defaultParams = {
    amplitude: 0.3,
    octaveCount: 3,
    persistence: 0.3,
    maxAbsValue: 0.05,
    seed: 'cgmsim',
    mode: 'daily'
};
describe('simulator test', () => {
    let date;
    beforeEach(() => {
        date = new Date('2022-05-29T22:10:00Z');
        jest.useFakeTimers('modern');
        jest.setSystemTime(date);
    });
    afterAll(() => {
        jest.useRealTimers();
    });
    test('start from 274 22:10 + 14u tou +', () => {
        let now = moment(date);
        const entries = [{
                mills: now.add(-5, 'minutes').toDate().getTime(),
                sgv: 274
            }, {
                mills: now.add(-5, 'minutes').toDate().getTime(),
                sgv: 274
            }, {
                mills: now.add(-0, 'minutes').toDate().getTime(),
                sgv: 274
            }, {
                mills: now.add(-5, 'minutes').toDate().getTime(),
                sgv: 274
            }
        ];
        now = moment(date);
        const treatments = [{
                created_at: now.toISOString(),
                notes: 'Tou 14',
                carbs: 0
            }];
        const env = {
            CARBS_ABS_TIME: '360',
            CR: '10',
            DIA: '6',
            ISF: '32',
            TP: '75',
            WEIGHT: '80',
        };
        const log = [];
        log.push('Tou 14U  ' + now.toISOString());
        for (let index = 0; index < (60 * 34);) {
            if (index === (7 * 60 + 30)) {
                log.push('Bolus 6U  ' + now.toISOString());
                treatments.push({
                    carbs: 0,
                    insulin: 6,
                    created_at: now.toISOString()
                });
            }
            const result = CGMSIMsimulator_1.default({ env, entries, treatments, profiles: [], perlinParams: defaultParams });
            entries.splice(0, 0, {
                mills: now.toDate().getTime(),
                sgv: result.sgv,
            });
            expect(result.deltaMinutes).toBeGreaterThanOrEqual(0);
            expect(result.basalActivity).toBeGreaterThanOrEqual(0);
            expect(result.bolusActivity).toBeGreaterThanOrEqual(0);
            expect(result.carbsActivity).toBeGreaterThanOrEqual(0);
            expect(result.liverActivity).toBeGreaterThanOrEqual(0);
            expect(result.pumpBasalActivity).toBeGreaterThanOrEqual(0);
            // console.log('Result ' + result.sgv + ' ' + now.toLocaleString())
            log.push('Result ' + result.sgv + ' ' + now.toISOString());
            now = now.add(5, "minutes");
            index = index + 5;
            jest.setSystemTime(now.toDate());
        }
        expect(log).toMatchSnapshot();
    });
    test('start from 124 15:00 + 50g tou 14', () => {
        let now = moment('2022-06-04T13:00:00.000Z');
        jest.setSystemTime(now.toDate());
        const entries = [{
                mills: now.add(-5, 'minutes').toDate().getTime(),
                sgv: 124
            }, {
                mills: now.add(-5, 'minutes').toDate().getTime(),
                sgv: 125
            }, {
                mills: now.add(-5, 'minutes').toDate().getTime(),
                sgv: 126
            }, {
                mills: now.add(-5, 'minutes').toDate().getTime(),
                sgv: 127
            }
        ];
        now = moment('2022-06-04T13:00:00.000Z');
        const treatments = [
            {
                created_at: now.toISOString(),
                carbs: 50
            }, {
                created_at: '2022-06-04T01:00:00.000Z',
                notes: 'tou 14',
                carbs: 0
            }
        ];
        const env = {
            CARBS_ABS_TIME: '360',
            CR: '10',
            DIA: '6',
            ISF: '32',
            TP: '75',
            WEIGHT: '80',
        };
        const log = [];
        let lastSgv = 0;
        log.push('Tou 14U  2022-06-04T01:00:00.000Z');
        log.push('Meal 50g  ' + now.toISOString());
        for (let index = 0; index < (60 * 30);) {
            const result = CGMSIMsimulator_1.default({ env, entries, treatments, profiles: [], });
            entries.splice(0, 0, {
                mills: now.toDate().getTime(),
                sgv: result.sgv,
            });
            expect(result.deltaMinutes).toBeGreaterThanOrEqual(0);
            expect(result.noiseActivity).toBe(0);
            expect(result.basalActivity).toBeGreaterThanOrEqual(0);
            expect(result.bolusActivity).toBeGreaterThanOrEqual(0);
            expect(result.carbsActivity).toBeGreaterThanOrEqual(0);
            expect(result.liverActivity).toBeGreaterThanOrEqual(0);
            expect(result.pumpBasalActivity).toBeGreaterThanOrEqual(0);
            // console.log('Result ' + result.sgv + ' ' + now.toLocaleString())
            log.push('Result ' + result.sgv + ' ' + now.toISOString());
            lastSgv = result.sgv;
            now = now.add(5, "minutes");
            index = index + 5;
            jest.setSystemTime(now.toDate());
        }
        expect(lastSgv).toBeGreaterThanOrEqual(397);
    });
});
//# sourceMappingURL=simulator.test.js.map