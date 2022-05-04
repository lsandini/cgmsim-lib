import carbs from '../src/carbs';
describe('Carbs test', () => {

	test('test carbs without treatments return 0', () => {
		const r = carbs(360, [])
		expect(r).toBe(0);

	});
	test('test carbs with old treatments return 0', () => {
		const r = carbs(360, [{
			carbs: 44, minutesAgo: 361,
		}])
		expect(r).toBe(0);
	});


	test('test carbs <=40 with active treatments return fix carbsActive', () => {
		const r = carbs(360, [{
			carbs: 40, minutesAgo: 45,
		}])
		expect(r).toMatchSnapshot();

	});

	test('test carbs <=40 with active treatments return carbsActive', () => {
		const r = carbs(360, [{
			carbs: 20, minutesAgo: 1,
		}, {
			carbs: 20, minutesAgo: 45,
		}])
		expect(r).toMatchSnapshot();
	});
	test('carbs 40 min ago are more active then 60 min ago ', () => {
		const r40 = carbs(360, [{
			carbs: 20, minutesAgo: 40,
		} ])
		const r60 = carbs(360, [{
			carbs: 20, minutesAgo: 60,
		}])
		expect(r40).toBeGreaterThan(r60);
	});

	test('carbs 5 min ago are less active then 40 min ago', () => {
		const r5 = carbs(360, [{
			carbs: 20, minutesAgo: 5,
		} ])
		const r60 = carbs(360, [{
			carbs: 20, minutesAgo: 40,
		}])
		expect(r5).toBeLessThan(r60);
	});

	test('test carbs >40 with active treatments return carbsActive random', () => {
		const r = carbs(360, [{
			carbs: 41, minutesAgo: 1,
		}, {
			carbs: 41, minutesAgo: 45,
		}])
		expect(r).toBeGreaterThan(0.6);
	});
	it.each([
		[[2, 21]],
		[[3, 7, 21]],
		[[5, 27, 55, 98]],
		[[15, 22, 35, 83,143]],
	])('test carb %p', (numbers: number[]) => {
		const e = numbers.map(n => ({
			carbs: 20, minutesAgo: n
		}));
		const r = carbs(360, e);
		expect(r).toMatchSnapshot();

	});
})