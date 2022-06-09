"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inputTest_1 = require("./inputTest");
const basal_1 = require("../src/basal");
const oldComputeBasal_1 = require("../old/oldComputeBasal");
const oldToujeo_1 = require("../old/oldToujeo");
const oldGlargine_1 = require("../old/oldGlargine");
const moment = require("moment");
describe('test computeBasalIOB', () => {
    const date = new Date('2022-05-07T11:20:00Z');
    beforeEach(() => {
        jest.useFakeTimers('modern');
        jest.setSystemTime(date);
    });
    afterAll(() => {
        jest.useRealTimers();
    });
    test('detection drug', () => {
        const result = basal_1.default(inputTest_1.treatments, 80);
        expect(result).toMatchSnapshot();
    });
});
describe('test computeBasalIOB comparing old cgmsim', () => {
    const date = new Date('2022-05-07T11:20:00Z');
    beforeEach(() => {
        jest.useFakeTimers('modern');
        jest.setSystemTime(date);
    });
    afterAll(() => {
        jest.useRealTimers();
    });
    test('compare old toujeo', () => {
        let _date = moment('2022-05-06T15:00:00.000Z');
        for (let i = 0; i < 240; i++) {
            _date = _date.add(5, 'minutes');
            jest.setSystemTime(_date.toDate());
            const { lastDET, lastGLA, lastTOU, lastDEG, } = oldComputeBasal_1.oldComputeBasal({
                entries: inputTest_1.toujeoTreatments
            });
            let oldActivity = oldToujeo_1.default(80, lastTOU);
            let result = basal_1.default(inputTest_1.toujeoTreatments, 80);
            const ROUND = 100000000;
            result = Math.round(result * ROUND) / ROUND;
            oldActivity = Math.round(oldActivity * ROUND) / ROUND;
            // console.log('\x1b[32m', '#####toujeo (after ' + i * 5 + 'minutes)' + _date.toISOString(), result, oldActivity, '\x1b[0m')
            expect(result).toBe(oldActivity);
        }
    });
    test('compare old glargine', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        let _date = moment('2022-05-06T15:00:00.000Z');
        const p = [];
        for (let i = 0; i < 30; i++) {
            _date = _date.add(5, 'minutes');
            jest.setSystemTime(_date.toDate());
            const { lastDET, lastGLA, lastTOU, lastDEG, } = oldComputeBasal_1.oldComputeBasal({
                entries: inputTest_1.glargineTreatments
            });
            let oldActivity = oldGlargine_1.default(80, lastGLA);
            let result = basal_1.default(inputTest_1.glargineTreatments, 80);
            const ROUND = 100000000;
            result = Math.round(result * ROUND) / ROUND;
            oldActivity = Math.round(oldActivity * ROUND) / ROUND;
            // console.log('activity ' + _date.toISOString(), result, oldActivity)
            expect(result).toBe(oldActivity);
            // console.log('\x1b[32m', '#####GLARGINE ' + _date.toISOString(), result, oldActivity, '\x1b[0m')
            // p.push(oldActivity);
            // await writeFile('./files/oldGLA.json', JSON.stringify(p));
        }
        // console.log(p)
    }));
});
//# sourceMappingURL=computeBasalIOB.test.js.map