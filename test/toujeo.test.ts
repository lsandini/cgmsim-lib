import { computeBasalActivity, durationBasal, peakBasal } from "../src/basal";

describe('test toujeo', () => {

	const toujeo=(weight,treatments)=>{
		const toujeoT=treatments
		.map(e => {
			const duration = durationBasal.TOU(e.insulin,weight);
			const peak = peakBasal.TOU(duration);
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
		const insulinActive = toujeo(weight, [{
			insulin: 30,
			minutesAgo: 300
		}])
		expect(insulinActive).toMatchSnapshot();
	})

	test('weight:80 ins:30 all', () => {
		const weight = 80;
		let insulinActive = 0;
		let insulinArr = [];

		for (let i = 0; i < 2000; i++) {
			const _insulinActive = toujeo(weight, [{
				insulin: 30,
				minutesAgo: i,
			}])
			insulinActive += _insulinActive > 0 ? _insulinActive : 0;
			insulinArr.push(_insulinActive > 0 ? _insulinActive : 0)

		}
		expect(insulinActive).toMatchSnapshot();
		expect(insulinArr).toMatchSnapshot();
	})


	test('insulin 5 min ago are less active then 40 min ago', () => {
		const insulin = 20;
		const weight = 80;

		const r5 = toujeo(weight, [{
			insulin,
			minutesAgo: 5
		}])
		const r40 = toujeo(weight, [{
			insulin,
			minutesAgo: 40
		}])
		expect(r5).toBeLessThan(r40);
	});
	test('peak has the greatest activity', () => {
		const insulin = 20;
		const weight = 80;

		const toujeoPeakHours = (24 + (14 * insulin / weight)) / 2.5

		const rBeforePeak = toujeo(weight, [{
			insulin,
			minutesAgo: (toujeoPeakHours * 60) + 10
		}]);
		const rPeak = toujeo(weight, [{
			insulin,
			minutesAgo: (toujeoPeakHours * 60)
		}])
		const rAfterPeak = toujeo(weight, [{
			insulin,
			minutesAgo: (toujeoPeakHours * 60) - 10
		}])
		expect(rBeforePeak).toBeLessThan(rPeak);
		expect(rAfterPeak).toBeLessThan(rPeak);
	});
})