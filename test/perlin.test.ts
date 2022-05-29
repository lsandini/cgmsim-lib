import perlin from "../src/perlin";

import oldPerlin from "../old/oldPerlin"
import moment = require("moment");
describe('test perlin with fake timers', () => {
	beforeAll(() => {
		jest.useFakeTimers('modern');
	});

	beforeEach(() => {
		jest.setSystemTime(new Date('2001-01-01'));

	})
	afterAll(() => {
		jest.useRealTimers();
	});

	test('run twice in same day should return same array', () => {
		const perl = perlin('')
		jest.setSystemTime(new Date('2001-01-01T01:01'));
		const perl2 = perlin('')
		expect(perl[0].time).toBe(perl2[0].time)
		expect(perl[0].noise).toBe(perl2[0].noise)
	})
	test('run twice different day should return different array', () => {
		const perl = perlin('')
		jest.setSystemTime(new Date('2001-01-02T01:01'));
		const perl2 = perlin('')
		expect(perl[0].time).not.toBe(perl2[0].time)
		expect(perl[0].noise).not.toBe(perl2[0].noise)
	})

	test('run in same day should return same array', () => {
		const perl = perlin('')
		expect(perl.length).toBe(288);
		expect(perl[0]).not.toBe(perl[1])

		expect(perl).toMatchSnapshot()
	})
})

describe('test perlin with real timers', () => {

	test('run twice in same day should return same array', () => {
		const perl = perlin('')
		setTimeout(() => {
			const perl2 = perlin('')
			expect(perl[0].time).toBe(perl2[0].time)
			expect(perl[0].noise).toBe(perl2[0].noise)
		}, 100);
	})

})
describe('test comparing old perlin', () => {


	test('run in same day should return same array', () => {
		const perl = perlin(moment().toISOString())
		const oldPerl = oldPerlin()
		const countPositiveValPerl = perl.filter(p => p.noise > 0).length
		const countPositiveValOldPerl = oldPerl.filter(p => p.noise > 0).length

		const maxValPerl = perl.sort((a, b) => b.noise - a.noise)[0];
		const maxValOldPerl = oldPerl.sort((a, b) => b.noise - a.noise)[0];
		const minValPerl = perl.sort((a, b) => a.noise - b.noise)[0];
		const minValOldPerl = oldPerl.sort((a, b) => a.noise - b.noise)[0];
		const sumValPerl = perl.reduce((acc, el) => acc + el.noise, 0);
		const sumValOldPerl = oldPerl.reduce((acc, el) => acc + el.noise, 0);
		console.log("new", { countPositiveValPerl, maxValPerl, minValPerl, sumValPerl })
		console.log("old", { countPositiveValOldPerl, maxValOldPerl, minValOldPerl, sumValOldPerl })


		expect(perl.length).toBe(oldPerl.length);

	})
})