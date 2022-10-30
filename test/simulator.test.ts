import { EnvParam, PerlinParams, Sgv, Treatment } from "../src/Types";
import simulator from "../src/CGMSIMsimulator";
import moment = require("moment");
import { getPngSnapshot } from "./inputTest";
const { toMatchImageSnapshot } = require('jest-image-snapshot');

const math=global.Math;
const defaultParams: PerlinParams = {
	amplitude: 0.3,
	octaveCount: 3,
	persistence: 0.3,
	maxAbsValue: 0.05,
	seed: 'cgmsim',
	mode: 'daily'
}

describe('simulator test', () => {
	let date;
	beforeEach(() => {

		date = new Date('2022-05-29T22:10:00Z');
		expect.extend({ toMatchImageSnapshot });

		jest.useFakeTimers('modern');
		jest.setSystemTime(date);
		const mockMath = Object.create(global.Math);
		mockMath.random = () => 0.5;
		global.Math = mockMath;
		
		
	});
	
	afterAll(() => {
		jest.useRealTimers();
		global.Math = math;
	});

	test('start from 274 22:10 + 14u tou +', () => {
		let now = moment(date);


		const entries: Sgv[] = [{
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 274
		}, {
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 274
		}, {
			mills: now.add(-0, 'minutes').toDate().getTime(),
			sgv: 274
		}, {
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 274
		}
		];
		now = moment(date);
		const treatments: Treatment[] = [{
			created_at: now.toISOString(),
			notes: 'Tou 14',
			carbs: 0
		}]
		const env: EnvParam = {
			CARBS_ABS_TIME: '360',
			CR: '10',
			DIA: '6',
			ISF: '32',
			TP: '75',
			WEIGHT: '80',
			AGE: '51',
			GENDER: 'Male',
		}

		const log = []
		log.push('Tou 14U  ' + now.toISOString());
		for (let index = 0; index < (60 * 34);) {
			if (index === (7 * 60 + 30)) {
				log.push('Bolus 6U  ' + now.toISOString())
				treatments.push({
					carbs: 0,
					insulin: 6,
					created_at: now.toISOString()
				})
			}


			const result = simulator({ env, entries, treatments, profiles: [], perlinParams: defaultParams })

			entries.splice(0, 0, {
				mills: now.toDate().getTime(),
				sgv: result.sgv,
			})
			expect(result.deltaMinutes).toBeGreaterThanOrEqual(0)
			expect(result.basalActivity).toBeGreaterThanOrEqual(0)
			expect(result.bolusActivity).toBeGreaterThanOrEqual(0)
			expect(result.carbsActivity).toBeGreaterThanOrEqual(0)
			expect(result.liverActivity).toBeGreaterThanOrEqual(0)
			// console.log('Result ' + result.sgv + ' ' + now.toLocaleString())
			log.push('Result ' + result.sgv + ' ' + now.toISOString())

			now = now.add(5, "minutes");
			index = index + 5;
			jest.setSystemTime(now.toDate());
		}
		expect(log).toMatchSnapshot();


	})

	test('start from 124 15:00 + 50g tou 14', async () => {
		let now = moment('2022-06-04T13:00:00.000Z');
		jest.setSystemTime(now.toDate());
		const entries: Sgv[] = [{
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 124
		}, {
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 125
		}, {
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 126
		}, {
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 127
		}
		];
		now = moment('2022-06-04T13:00:00.000Z');
		const treatments: Treatment[] = [
			{
				created_at: now.toISOString(),
				carbs: 40
			}, {
				created_at: '2022-06-04T01:00:00.000Z',
				notes: 'tou 14',
				carbs: 0
			}]
		const env: EnvParam = {
			CARBS_ABS_TIME: '360',
			CR: '10',
			DIA: '6',
			ISF: '32',
			TP: '75',
			WEIGHT: '80',
			AGE: '51',
			GENDER: 'Male',
		}

		const log = []
		let lastSgv = 0;
		log.push('Tou 14U  2022-06-04T01:00:00.000Z');
		log.push('Meal 50g  ' + now.toISOString());

		const noiseActivities = []
		const basalActivities = []
		const bolusActivities = []
		const carbsActivities = []
		const liverActivities = []
		const sgvS = []

		for (let index = 0; index < (60 * 30);) {
			const result = simulator({ env, entries, treatments, profiles: [], })
			entries.splice(0, 0, {
				mills: now.toDate().getTime(),
				sgv: result.sgv,
			})
			sgvS.push(result.sgv)
			expect(result.deltaMinutes).toBeGreaterThanOrEqual(0)
			expect(result.noiseActivity).toBe(0)
			noiseActivities.push(result.noiseActivity)
			expect(result.basalActivity).toBeGreaterThanOrEqual(0)
			basalActivities.push(result.basalActivity)
			expect(result.bolusActivity).toBeGreaterThanOrEqual(0)
			bolusActivities.push(result.bolusActivity)
			expect(result.carbsActivity).toBeGreaterThanOrEqual(0)
			carbsActivities.push(result.carbsActivity)
			expect(result.liverActivity).toBeGreaterThanOrEqual(0)
			liverActivities.push(result.liverActivity)

			// console.log('Result ' + result.sgv + ' ' + now.toLocaleString())
			log.push('Result ' + result.sgv + ' ' + now.toISOString())
			lastSgv = result.sgv;

			now = now.add(5, "minutes");
			index = index + 5;
			jest.setSystemTime(now.toDate());
		}
		expect(lastSgv).toBeGreaterThanOrEqual(397)
		let data: any = [
			// noiseActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
			// basalActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
			// bolusActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
			// carbsActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
			// liverActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
			sgvS.map((sgv, index) => ({ key: index * 5, value: sgv })),
		]
		data.allKeys = noiseActivities.map((sgv, index) => index * 5)
		const png = await getPngSnapshot({
			type: 'single',
			values: noiseActivities.map((sgv, index) => ({ key: index, value: sgv }))
		}, { scaleY: true })
		
		expect(png).toMatchImageSnapshot();
	})

	test('start from 250 13:00Z tou 14 8U @14:00>', async () => {
		let now = moment('2022-06-04T13:00:00.000Z');
		jest.setSystemTime(now.toDate());
		const entries: Sgv[] = [{
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 250
		}, {
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 250
		}, {
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 250
		}, {
			mills: now.add(-5, 'minutes').toDate().getTime(),
			sgv: 250
		}
		];
		now = moment('2022-06-04T13:00:00.000Z');
		const treatments: Treatment[] = [
			{						
				"eventType": "Meal Bolus",
				"insulin": 5,								
				"created_at": '2022-06-04T14:00:00.000Z',
				"carbs": null
			},
			{
				created_at: '2022-06-04T10:00:00.000Z',
				notes: 'tou 14',
				carbs: 0
			},
			{
				created_at: '2022-06-05T10:00:00.000Z',
				notes: 'tou 14',
				carbs: 0
			}]
		const env: EnvParam = {
			CARBS_ABS_TIME: '360',
			CR: '10',
			DIA: '6',
			ISF: '32',
			TP: '75',
			WEIGHT: '80',
			AGE: '51',
			GENDER: 'Male',
		}

		const log = []
		let lastSgv = 0;
		log.push('Tou 14U  2022-06-04T01:00:00.000Z');


		const noiseActivities = []
		const basalActivities = []
		const bolusActivities = []
		const carbsActivities = []
		const liverActivities = []
		const sgvS = []

		for (let index = 0; index < ((60 * 4));) {
			const result = simulator({ env, entries, treatments, profiles: [], })
			entries.splice(0, 0, {
				mills: now.toDate().getTime(),
				sgv: result.sgv,
			})
			sgvS.push(result.sgv)
			expect(result.deltaMinutes).toBeGreaterThanOrEqual(0)
			expect(result.noiseActivity).toBe(0)
			noiseActivities.push(result.noiseActivity)
			expect(result.basalActivity).toBeGreaterThanOrEqual(0)
			basalActivities.push(result.basalActivity)
			expect(result.bolusActivity).toBeGreaterThanOrEqual(0)
			bolusActivities.push(result.bolusActivity)
			expect(result.carbsActivity).toBeGreaterThanOrEqual(0)
			carbsActivities.push(result.carbsActivity)
			expect(result.liverActivity).toBeGreaterThanOrEqual(0)
			liverActivities.push(result.liverActivity)

			// console.log('Result ' + result.sgv + ' ' + now.toLocaleString())
			log.push('Result ' + result.sgv + ' ' + now.toISOString())
			lastSgv = result.sgv;

			now = now.add(5, "minutes");
			index = index + 5;
			jest.setSystemTime(now.toDate());
		}
		expect(sgvS).toMatchSnapshot()
		expect(lastSgv).toMatchSnapshot()
		// let data: any = [
		// 	// noiseActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
		// 	// basalActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
		// 	// bolusActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
		// 	// carbsActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
		// 	// liverActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
		// 	sgvS.map((sgv, index) => ({ key: index * 5, value: sgv })),
		// ]
		// data.allKeys = noiseActivities.map((sgv, index) => index * 5)
		const png = await getPngSnapshot({
			type: 'single',
			values: sgvS.map((sgv, index) => ({ key: index, value: sgv }))
		}, { scaleY: true })
		
		expect(png).toMatchImageSnapshot();
		return;
	})
})