"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basal_1 = require("../src/basal");
describe('test detemir', () => {
    const detemir = (weight, treatments) => {
        const toujeoT = treatments
            .map(e => {
            const duration = basal_1.durationBasal.DET(e.insulin, weight);
            const peak = basal_1.peakBasal.DET(duration);
            return Object.assign(Object.assign({}, e), { duration,
                peak });
        });
        return basal_1.computeBasalActivity(toujeoT);
    };
    test('weight:80 ins:30 minutesAgo:300', () => {
        const weight = 80;
        const insulinActive = detemir(weight, [{
                insulin: 30,
                minutesAgo: 300
            }]);
        expect(insulinActive).toMatchSnapshot();
    });
    test('weight:80 ins:30 all', () => {
        const weight = 80;
        let insulinActive = 0;
        let insulinArr = [];
        for (let i = 0; i < 2000; i++) {
            const _insulinActive = detemir(weight, [{
                    insulin: 30,
                    minutesAgo: i,
                }]);
            insulinActive += _insulinActive > 0 ? _insulinActive : 0;
            insulinArr.push(_insulinActive > 0 ? _insulinActive : 0);
        }
        expect(insulinActive).toMatchSnapshot();
        expect(insulinArr).toMatchSnapshot();
    });
    test('insulin 5 min ago are less active then 40 min ago', () => {
        const insulin = 20;
        const weight = 80;
        const r5 = detemir(weight, [{
                insulin,
                minutesAgo: 5
            }]);
        const r40 = detemir(weight, [{
                insulin,
                minutesAgo: 40
            }]);
        expect(r5).toBeLessThan(r40);
    });
    test('peak has the greatest activity', () => {
        const insulin = 20;
        const weight = 80;
        const detemirPeakHours = ((14 + (24 * insulin / weight))) / 3;
        const rBeforePeak = detemir(weight, [{
                insulin,
                minutesAgo: (detemirPeakHours * 60) + 10
            }]);
        const rPeak = detemir(weight, [{
                insulin,
                minutesAgo: (detemirPeakHours * 60)
            }]);
        const rAfterPeak = detemir(weight, [{
                insulin,
                minutesAgo: (detemirPeakHours * 60) - 10
            }]);
        expect(rBeforePeak).toBeLessThan(rPeak);
        expect(rAfterPeak).toBeLessThan(rPeak);
    });
});
//# sourceMappingURL=detemir.test.js.map