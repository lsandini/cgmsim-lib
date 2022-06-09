"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const liver_1 = require("../src/liver");
describe('Liver test', () => {
    beforeAll(() => {
        jest.useFakeTimers('modern');
        jest.setSystemTime(new Date('2001-01-01'));
    });
    afterAll(() => {
        jest.useRealTimers();
    });
    it.each([
        [[30, 10]],
        [[20, 8]],
        [[40, 14]],
    ])('test liver %p', ([isf, cr]) => {
        const r = liver_1.default(isf, cr);
        expect(r).toMatchSnapshot();
    });
});
//# sourceMappingURL=liver.test.js.map