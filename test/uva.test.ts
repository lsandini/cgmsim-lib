import simulatorUVA from '../src/UVAsimulator';
beforeAll(() => {
	jest.useFakeTimers('modern');
	jest.setSystemTime(new Date('2022-05-01T11:00:00'));
});

afterAll(() => {
	jest.useRealTimers();
});

describe('uva test', () => {
	test('default params basal  0.75 flat sgv', () => {
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

			const { x, y } = simulatorUVA({ env: { WEIGHT: '80' }, lastState, treatments });
			yList.push(y);
			lastState = x;
		}
		
		expect(lastState).toMatchSnapshot()
		expect(yList).toMatchSnapshot()

	})
})