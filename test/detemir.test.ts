import { computeBasalActivity } from '../src/computeBasalIOB';
describe('test detemir', () => {

	const detemir = (weight, treatments) => {
		const toujeoT = treatments
			.map(e => {
				const duration = (14 + (24 * e.insulin / weight)) * 60;
				const peak = (duration / 3);
				return {
					...e,
					duration,
					peak,
				}
			});
		return computeBasalActivity(toujeoT)
	}

	test('weight:80 ins:30 minutesAgo:300', () => {
		const weight = 80;
		const insulinActive = detemir(weight, [{
			insulin: 30,
			minutesAgo: 300
		}])
		expect(insulinActive).toMatchSnapshot();
	})

	test('insulin 5 min ago are less active then 40 min ago', () => {
		const insulin = 20;
		const weight = 80;

		const r5 = detemir(weight, [{
			insulin,
			minutesAgo: 5
		}])
		const r40 = detemir(weight, [{
			insulin,
			minutesAgo: 40
		}])
		expect(r5).toBeLessThan(r40);
	});
	test('peak has the greatest activity', () => {
		const insulin = 20;
		const weight = 80;

		const detemirPeakHours = ((14 + (24 * insulin / weight))) / 3
		const rBeforePeak = detemir(weight, [{
			insulin,
			minutesAgo: (detemirPeakHours * 60) + 10
		}]);
		const rPeak = detemir(weight, [{
			insulin,
			minutesAgo: (detemirPeakHours * 60)
		}])
		const rAfterPeak = detemir(weight, [{
			insulin,
			minutesAgo: (detemirPeakHours * 60) - 10
		}])
		expect(rBeforePeak).toBeLessThan(rPeak);
		expect(rAfterPeak).toBeLessThan(rPeak);
	});
})