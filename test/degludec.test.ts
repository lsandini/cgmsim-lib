import degludec from '../src/degludec';
describe('test degludec', () => {
	test('ins:30 minutesAgo:300', () => {
		const insulinActive = degludec([{
			insulin: 30,
			minutesAgo: 300
		}])
		expect(insulinActive).toMatchSnapshot();

	})

	test('insulin 5 min ago are less active then 40 min ago', () => {
		const insulin = 20;

		const r5 = degludec([{
			insulin,
			minutesAgo: 5
		}])
		const r40 = degludec([{
			insulin,
			minutesAgo: 40
		}])
		expect(r5).toBeLessThan(r40);
	});
	test('peak has the greatest activity', () => {
		const insulin = 20;
		const degludecPeakHours = 42 / 3
		const rBeforePeak = degludec([{
			insulin,
			minutesAgo: (degludecPeakHours * 60) + 10
		}]);
		const rPeak = degludec([{
			insulin,
			minutesAgo: (degludecPeakHours * 60)
		}])
		const rAfterPeak = degludec([{
			insulin,
			minutesAgo: (degludecPeakHours * 60) - 10
		}])
		expect(rBeforePeak).toBeLessThan(rPeak);
		expect(rAfterPeak).toBeLessThan(rPeak);
	});
})