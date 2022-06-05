import moment = require('moment');
import carbs from '../src/carbs';
import { oldCarbs } from '../old/oldCarbs';
import { assert } from 'console';
const now = '2001-01-01T07:00:00';

beforeEach(() => {
	jest.useFakeTimers('modern');
	jest.setSystemTime(new Date(now));

})
afterAll(() => {
	jest.useRealTimers();
});

const minutesAgo = (min) => moment(now).add(-min, 'minutes').toISOString();
describe('Carbs test', () => {

	test('test carbs without treatments return 0', () => {
		const r = carbs([], 360, 30, 10)
		expect(r).toBe(0);

	});
	test('test carbs with old treatments return 0', () => {
		const r = carbs([{
			carbs: 44, created_at: minutesAgo(361),
		}], 360, 30, 10)
		expect(r).toBe(0);
	});


	test('test carbs <=40 with active treatments return fix carbsActive', () => {
		const r = carbs([{
			carbs: 40, created_at: minutesAgo(45)
		}], 360, 30, 10)
		expect(r).toMatchSnapshot();

	});

	test('test carbs <=40 with active treatments return carbsActive', () => {
		const r = carbs([{
			carbs: 20, created_at: minutesAgo(1),
		}, {
			carbs: 20, created_at: minutesAgo(45),
		}], 360, 30, 10)
		expect(r).toMatchSnapshot();
	});
	test('carbs 40 min ago are more active then 60 min ago ', () => {
		const r40 = carbs([{
			carbs: 20, created_at: minutesAgo(40)
		}], 360, 30, 10)
		const r60 = carbs([{
			carbs: 20, created_at: minutesAgo(60)
		}], 360, 30, 10)
		expect(r40).toBeGreaterThan(r60);
	});

	test('carbs 5 min ago are less active then 40 min ago', () => {
		const r5 = carbs([{
			carbs: 20, created_at: minutesAgo(5)
		}], 360, 30, 10)
		const r60 = carbs([{
			carbs: 20, created_at: minutesAgo(40)
		}], 360, 30, 10)
		expect(r5).toBeLessThan(r60);
	});

	test('test carbs >40 with active treatments return carbsActive random', () => {
		const r = carbs([{
			carbs: 41, created_at: minutesAgo(1),
		}, {
			carbs: 41, created_at: minutesAgo(45),
		}], 360, 30, 10)
		expect(r).toBeGreaterThan(0.1);
	});


	it.each([
		[[2, 21]],
		[[3, 7, 21]],
		[[5, 27, 55, 98]],
		[[15, 22, 35, 83, 143]],
	])('test carb %p', (numbers: number[]) => {
		const e = numbers.map(n => ({
			carbs: 20, created_at: minutesAgo(n)
		}));
		const r = carbs(e, 360, 30, 10);
		expect(r).toMatchSnapshot();

	});
})

describe('Carbs test old compare', () => {
	beforeEach(() => {
		jest.useFakeTimers('modern');
		jest.setSystemTime(new Date(now));

	})
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
			const newCarb = carbs(treatment, carbAbs, 36, 10);
			const old = oldCarbs(treatment, carbAbs)
			newC.push(newCarb)
			oldC.push(old);
			now = now.add(1, "minutes");
			jest.setSystemTime(now.toDate());
		}
		const newT = newC.reduce((acc, i) => ((i * 5) + acc), 0)
		const oldT = oldC.reduce((acc, i) => i + acc, 0)
		expect(newT).toBeGreaterThan(oldT - 0.1)
		expect(newT).toBeLessThan(oldT + 0.1)
	})

});;