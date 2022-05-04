import glargine from '../src/glargine';
describe('test glargine', () => {
	test('weight:80 ins:30 minutesAgo:300', () => {
		const weight = 80;
		const insulinActive = glargine(weight, [{
			insulin: 30,
			minutesAgo: 300
		}])
		expect(insulinActive).toMatchSnapshot();
	})

	test('insulin 5 min ago are less active then 40 min ago', () => {
		const insulin = 20;
		const weight = 80;

		const r5 = glargine(weight, [{
			insulin,
			minutesAgo: 5
		}])
		const r40 = glargine(weight, [{
			insulin,
			minutesAgo: 40
		}])
		expect(r5).toBeLessThan(r40);
	});
	test('peak has the greatest activity', () => {
		const insulin = 20;
		const weight = 80;

		const glarginePeakHours = (22 + (12 * insulin / weight)) / 2.5

		const rBeforePeak = glargine(weight, [{
			insulin,
			minutesAgo: (glarginePeakHours * 60) + 10
		}]);
		const rPeak = glargine(weight, [{
			insulin,
			minutesAgo: (glarginePeakHours * 60)
		}])
		const rAfterPeak = glargine(weight, [{
			insulin,
			minutesAgo: (glarginePeakHours * 60) - 10
		}])
		expect(rBeforePeak).toBeLessThan(rPeak);
		expect(rAfterPeak).toBeLessThan(rPeak);
	});
})