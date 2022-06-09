"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perlin_1 = require("../src/perlin");
const oldPerlin_1 = require("../old/oldPerlin");
const defaultParams = {
    amplitude: 0.3,
    octaveCount: 3,
    persistence: 0.3,
    maxAbsValue: 0.05,
    seed: 'cgmsim',
    mode: 'daily'
};
describe('test perlin with fake timers', () => {
    beforeAll(() => {
        jest.useFakeTimers('modern');
    });
    beforeEach(() => {
        jest.setSystemTime(new Date('2001-01-01'));
    });
    afterAll(() => {
        jest.useRealTimers();
    });
    test('run twice in same day should return same array', () => {
        jest.setSystemTime(new Date('2022-05-30T00:01'));
        const perl = perlin_1.default(defaultParams);
        jest.setSystemTime(new Date('2022-05-30T01:01'));
        const perl2 = perlin_1.default(defaultParams);
        expect(perl[0].time).toBe(perl2[0].time);
        expect(perl[0].noise).toBe(perl2[0].noise);
    });
    test('run twice different day should return different array', () => {
        const perl = perlin_1.default(defaultParams);
        jest.setSystemTime(new Date('2001-01-02T01:01'));
        const perl2 = perlin_1.default(defaultParams);
        expect(perl[0].time).not.toBe(perl2[0].time);
        expect(perl[0].noise).not.toBe(perl2[0].noise);
    });
    test('run in same day should return same array', () => {
        const perl = perlin_1.default(defaultParams);
        expect(perl.length).toBe(288);
        expect(perl[0]).not.toBe(perl[1]);
        expect(perl).toMatchSnapshot();
    });
});
describe('test perlin with real timers', () => {
    test('run twice in same day should return same array', () => {
        const perl = perlin_1.default(defaultParams);
        setTimeout(() => {
            const perl2 = perlin_1.default(defaultParams);
            expect(perl[0].time).toBe(perl2[0].time);
            expect(perl[0].noise).toBe(perl2[0].noise);
        }, 100);
    });
});
describe('test comparing old perlin', () => {
    test('run in same day should return same array', () => {
        const perl = perlin_1.default(defaultParams);
        const oldPerl = oldPerlin_1.default();
        const countPositiveValPerl = perl.filter(p => p.noise > 0).length;
        const countPositiveValOldPerl = oldPerl.filter(p => p.noise > 0).length;
        const maxValPerl = perl.sort((a, b) => b.noise - a.noise)[0];
        const maxValOldPerl = oldPerl.sort((a, b) => b.noise - a.noise)[0];
        const minValPerl = perl.sort((a, b) => a.noise - b.noise)[0];
        const minValOldPerl = oldPerl.sort((a, b) => a.noise - b.noise)[0];
        const sumValPerl = perl.reduce((acc, el) => acc + el.noise, 0);
        const sumValOldPerl = oldPerl.reduce((acc, el) => acc + el.noise, 0);
        console.log("new", { countPositiveValPerl, maxValPerl, minValPerl, sumValPerl });
        console.log("old", { countPositiveValOldPerl, maxValOldPerl, minValOldPerl, sumValOldPerl });
        expect(perl.length).toBe(oldPerl.length);
    });
});
//# sourceMappingURL=perlin.test.js.map