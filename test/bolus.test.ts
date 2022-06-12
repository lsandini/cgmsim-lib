import { bolusTreatments } from "./inputTest";
import bolus from "../src/bolus";
import { Treatment } from "../src/Types";

import moment = require("moment");

const dia=6;
const peak=90;


describe('test bolus', () => {

	const date = new Date('2022-05-07T11:20:00Z');

	beforeEach(() => {
		jest.useFakeTimers('modern');
		jest.setSystemTime(date);
	})

	afterAll(() => {
		jest.useRealTimers();
	});

	test('detection bolus', () => {
		let _date = moment('2022-05-06T16:30:00.000Z');
		jest.setSystemTime(_date.toDate());

		const result = bolus(bolusTreatments as unknown as Treatment[], dia,peak);

		expect(result).toMatchSnapshot()
	})
	test('non negative bolus', () => {
		let _date = moment('2022-05-06T15:00:00.000Z');

		for (let t = 0; t < 200; t++) {
			_date = _date.add(5, 'minutes');
			jest.setSystemTime(_date.toDate());
			const result = bolus(bolusTreatments as unknown as Treatment[], dia,peak);
			expect(result).toBeGreaterThanOrEqual(0);
		}
	})
})

