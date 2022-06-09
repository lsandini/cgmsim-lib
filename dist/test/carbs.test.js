"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const carbs_1 = require("../src/carbs");
const oldCarbs_1 = require("../old/oldCarbs");
const now = '2001-01-01T07:00:00';
beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(now));
});
afterAll(() => {
    jest.useRealTimers();
});
const minutesAgo = (min) => moment(now).add(-min, 'minutes').toISOString();
describe('Carbs test', () => {
    test('test carbs without treatments return 0', () => {
        const r = carbs_1.default([], 360, 30, 10);
        expect(r).toBe(0);
    });
    test('test carbs with old treatments return 0', () => {
        const r = carbs_1.default([{
                carbs: 44, created_at: minutesAgo(361),
            }], 360, 30, 10);
        expect(r).toBe(0);
    });
    test('test carbs <=40 with active treatments return fix carbsActive', () => {
        const r = carbs_1.default([{
                carbs: 40, created_at: minutesAgo(45)
            }], 360, 30, 10);
        expect(r).toMatchSnapshot();
    });
    test('test carbs <=40 with active treatments return carbsActive', () => {
        const r = carbs_1.default([{
                carbs: 20, created_at: minutesAgo(1),
            }, {
                carbs: 20, created_at: minutesAgo(45),
            }], 360, 30, 10);
        expect(r).toMatchSnapshot();
    });
    test('carbs 40 min ago are more active then 60 min ago ', () => {
        const r40 = carbs_1.default([{
                carbs: 20, created_at: minutesAgo(40)
            }], 360, 30, 10);
        const r60 = carbs_1.default([{
                carbs: 20, created_at: minutesAgo(60)
            }], 360, 30, 10);
        expect(r40).toBeGreaterThan(r60);
    });
    test('carbs 5 min ago are less active then 40 min ago', () => {
        const r5 = carbs_1.default([{
                carbs: 20, created_at: minutesAgo(5)
            }], 360, 30, 10);
        const r60 = carbs_1.default([{
                carbs: 20, created_at: minutesAgo(40)
            }], 360, 30, 10);
        expect(r5).toBeLessThan(r60);
    });
    test('test carbs >40 with active treatments return carbsActive random', () => {
        const r = carbs_1.default([{
                carbs: 41, created_at: minutesAgo(1),
            }, {
                carbs: 41, created_at: minutesAgo(45),
            }], 360, 30, 10);
        expect(r).toBeGreaterThan(0.1);
    });
    it.each([
        [[2, 21]],
        [[3, 7, 21]],
        [[5, 27, 55, 98]],
        [[15, 22, 35, 83, 143]],
    ])('test carb %p', (numbers) => {
        const e = numbers.map(n => ({
            carbs: 20, created_at: minutesAgo(n)
        }));
        const r = carbs_1.default(e, 360, 30, 10);
        expect(r).toMatchSnapshot();
    });
});
describe('Carbs test old compare', () => {
    beforeEach(() => {
        jest.useFakeTimers('modern');
        jest.setSystemTime(new Date(now));
    });
    afterAll(() => {
        jest.useRealTimers();
    });
    test('should first', () => {
        let now = moment();
        const oldC = [];
        const newC = [];
        for (let i = 0; i < 360; i++) {
            const treatment = [{
                    carbs: 41, created_at: minutesAgo(1), time: moment(minutesAgo(1)).toDate().getTime()
                },];
            const carbAbs = 360;
            const newCarb = carbs_1.default(treatment, carbAbs, 36, 10);
            const old = oldCarbs_1.oldCarbs(treatment, carbAbs);
            newC.push(newCarb);
            oldC.push(old);
            now = now.add(1, "minutes");
            jest.setSystemTime(now.toDate());
        }
        const newT = newC.reduce((acc, i) => ((i * 5) + acc), 0);
        const oldT = oldC.reduce((acc, i) => i + acc, 0);
        expect(newT).toBeGreaterThan(oldT - 0.1);
        expect(newT).toBeLessThan(oldT + 0.1);
    });
});
;
//# sourceMappingURL=carbs.test.js.map