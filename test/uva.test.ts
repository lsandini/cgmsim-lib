import moment = require('moment');
import { Profile, Treatment } from 'src/Types';
import simulatorUVA from '../src/UVAsimulator';
beforeAll(() => {
	jest.useFakeTimers('modern');
	jest.setSystemTime(new Date('2022-05-01T11:00:00'));
});

afterAll(() => {
	jest.useRealTimers();
});

describe('uva test default PATIENT', () => {
	test('basal  0.75 from TREATMENTS should generate flat sgv', () => {
		//current treatments generate 0.75U/h
		const treatments = [{
			"_id": "627548f4a3dc0ad67616ac95",
			"eventType": "Announcement",
			"notes": "gla 30",
			"utcOffset": 0,
			"isAnnouncement": true,
			"protein": "",
			"fat": "",
			"duration": 0,
			"profile": "",
			"enteredBy": "Boss",
			"created_at": "2022-05-01T08:41:00",
			"carbs": null,
			"insulin": null
		},];
		let lastState = null;
		const yList = [];
		for (let i = 0; i < 12; i++) {

			const { x, y } = simulatorUVA({ env: { WEIGHT: '80' }, lastState, treatments, profile: [] });
			yList.push(y.Gp);
			lastState = x;
		}

		expect(lastState).toMatchSnapshot()
		expect(yList).toMatchSnapshot()

	})

	test('basal 0.75 from PROFILE should generate flat sgv', () => {

		let lastState = null;
		const yList = [];
		const profile: Profile[] = [{
			defaultProfile: 'pippo',
			startDate: '2022-01-01',
			store: {
				'pippo': {
					basal: 0.75
				}
			}
		}, {
			defaultProfile: 'pippo2',
			startDate: '2021-01-01',
			store: {
				'pippo2': {
					basal: 0.85
				}
			}
		}]
		for (let i = 0; i < 12; i++) {
			const { x, y } = simulatorUVA({ env: { WEIGHT: '80' }, lastState, treatments: [], profile });
			yList.push(y.Gp);
			lastState = x;
		}

		expect(lastState).toMatchSnapshot()
		expect(yList).toMatchSnapshot()
	})

	test('basal 0.75 from PROFILE + 50g CARBS should generate a curve', () => {

		let lastState = null;
		const yList = [];
		const profile: Profile[] = [{
			defaultProfile: 'pippo',
			startDate: '2022-01-01',
			store: {
				'pippo': {
					basal: 0.75
				}
			}
		}, {
			defaultProfile: 'pippo2',
			startDate: '2021-01-01',
			store: {
				'pippo2': {
					basal: 0.85
				}
			}
		}]
		const treatments: Treatment[] = [{
			carbs: 50,
			created_at: '2022-05-01T10:59:00',
		}]

		const now = moment('2022-05-01T11:00:00')
		let yMax = 0;
		for (let i = 0; i < 36; i++) {
			const { x, y } = simulatorUVA({ env: { WEIGHT: '80' }, lastState, treatments, profile });
			yList.push(y.Gp);
			lastState = x;
			yMax = y.Gp > yMax ? y.Gp : yMax;
			jest.setSystemTime(new Date(now.add(5, 'minutes').toISOString()));
		}


		const yAfter1h = yList[11];
		const yAfter2h = yList[23];
		const yAfter3h = yList[35];

		expect(yAfter1h).toBeLessThan(189)
		expect(yAfter1h).toBeGreaterThan(188)

		expect(yAfter2h).toBeLessThan(235)
		expect(yAfter2h).toBeGreaterThan(234)

		expect(yAfter3h).toBeLessThan(228)
		expect(yAfter3h).toBeGreaterThan(227)
		
		expect(yMax).toBeLessThan(234.9)
		expect(yMax).toBeGreaterThan(234.8)
		
		
		expect(lastState).toMatchSnapshot()
		expect(yList).toMatchSnapshot()
	})

	test('basal 0.75 from PROFILE + 50g CARBS + 5U should generate a curve', () => {

		let lastState = null;
		const yList = [];
		const profile: Profile[] = [{
			defaultProfile: 'pippo',
			startDate: '2022-01-01',
			store: {
				'pippo': {
					basal: 0.75
				}
			}
		}]
		const treatments: Treatment[] = [{
			carbs: 50,
			created_at: '2022-05-01T11:30:00',
		},{
			carbs: 0,
			insulin: 7.5,
			created_at: '2022-05-01T11:15:00',
		}]

		const now = moment('2022-05-01T11:00:00')
		let yMax = 0;
		for (let i = 0; i < 36; i++) {
			const { x, y } = simulatorUVA({ env: { WEIGHT: '80' }, lastState, treatments, profile });
			yList.push(y.Gp);
			lastState = x;
			yMax = y.Gp > yMax ? y.Gp : yMax;
			jest.setSystemTime(new Date(now.add(5, 'minutes').toISOString()));
		}


		const yAfter1h = yList[11];
		const yAfter2h = yList[23];
		const yAfter3h = yList[35];

		expect(yAfter1h).toBeLessThan(119)
		expect(yAfter1h).toBeGreaterThan(118)

		expect(yAfter2h).toBeLessThan(164)
		expect(yAfter2h).toBeGreaterThan(163)

		expect(yAfter3h).toBeLessThan(124)
		expect(yAfter3h).toBeGreaterThan(123)
		
		expect(yMax).toBeLessThan(165.6)
		expect(yMax).toBeGreaterThan(165.5)
		
		
		expect(lastState).toMatchSnapshot()
		expect(yList).toMatchSnapshot()
	})

})