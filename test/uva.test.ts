import { Profile } from 'src/Types';
import simulatorUVA from '../src/UVAsimulator';
beforeAll(() => {
	jest.useFakeTimers('modern');
	jest.setSystemTime(new Date('2022-05-01T11:00:00'));
});

afterAll(() => {
	jest.useRealTimers();
});

describe('uva test', () => {
	test('default params basal  0.75 from treatments should generate flat sgv', () => {
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

	test('default params basal  0.75 from profile should generate flat sgv', () => {

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
})