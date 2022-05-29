import { treatments, toujeoTreatments, glargineTreatments } from "./inputTest";
import computeBasalIOB from "../src/basal";
import { Treatment } from "../src/Types";

import { oldComputeBasal } from '../old/oldComputeBasal'
import oldToujeoRun from '../old/oldToujeo'
import oldGlargine from '../old/oldGlargine'
import moment = require("moment");
import { writeFile } from 'fs/promises';


describe('test computeBasalIOB', () => {

	const date = new Date('2022-05-07T11:20:00');

	beforeAll(() => {
		jest.useFakeTimers('modern');
	});
	beforeEach(() => {
		jest.setSystemTime(date);
	})

	afterAll(() => {
		jest.useRealTimers();
	});

	test('detection drug', () => {
		const result = computeBasalIOB(treatments as unknown as Treatment[], 80);

		expect(result).toMatchSnapshot()
	})


	test('compare old toujeo', () => {
		let _date = moment('2022-05-06T15:00:00.000Z');
		for (let i = 0; i < 300; i++) {
			_date = _date.add(5, 'minutes');
			jest.setSystemTime(_date.toDate());

			const {
				lastDET,
				lastGLA,
				lastTOU,
				lastDEG,
			} = oldComputeBasal({
				entries: toujeoTreatments
			});

			let oldTouActivity = oldToujeoRun(80, lastTOU);
			let result = computeBasalIOB(toujeoTreatments as unknown as Treatment[], 80);
			const ROUND = 100000000;
			result = Math.round(result * ROUND) / ROUND;
			oldTouActivity = Math.round(oldTouActivity * ROUND) / ROUND;
			// console.log('toujeo ' + _date.toISOString(), result, oldTouActivity)
			expect(result).toBe(oldTouActivity);
		}
	})

	test('compare old toujeo', () => {
		let _date = moment('2022-05-06T15:00:00.000Z');
		for (let i = 0; i < 300; i++) {
			_date = _date.add(5, 'minutes');
			jest.setSystemTime(_date.toDate());

			const {
				lastDET,
				lastGLA,
				lastTOU,
				lastDEG,
			} = oldComputeBasal({
				entries: toujeoTreatments
			});

			let oldTouActivity = oldToujeoRun(80, lastTOU);
			let result = computeBasalIOB(toujeoTreatments as unknown as Treatment[], 80);
			const ROUND = 100000000;
			result = Math.round(result * ROUND) / ROUND;
			oldTouActivity = Math.round(oldTouActivity * ROUND) / ROUND;
			// console.log('toujeo ' + _date.toISOString(), result, oldTouActivity)
			expect(result).toBe(oldTouActivity);
		}
	})

	test('compare old glargine', async () => {
		let _date = moment('2022-05-06T15:00:00.000Z');
		const p = []
		for (let i = 0; i < 300; i++) {
			_date = _date.add(5, 'minutes');
			jest.setSystemTime(_date.toDate());

			const {
				lastDET,
				lastGLA,
				lastTOU,
				lastDEG,
			} = oldComputeBasal({
				entries: glargineTreatments
			});

			let oldActivity = oldGlargine(80, lastGLA);
			let result = computeBasalIOB(toujeoTreatments as unknown as Treatment[], 80);
			const ROUND = 100000000;
			result = Math.round(result * ROUND) / ROUND;
			oldActivity = Math.round(oldActivity * ROUND) / ROUND;
			// console.log('activity ' + _date.toISOString(), result, oldActivity)
			//expect(result).toBe(oldActivity);
			// console.log(oldActivity);
			p.push(oldActivity);
			await writeFile('./files/oldGLA.json', JSON.stringify(p));

		}
		console.log(p)
	})
})