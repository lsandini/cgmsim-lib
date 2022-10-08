import moment = require('moment');
import { physicalIsf } from '../src/physical';
import { physicalLiver } from '../src/physical';
import { getFlatHeartRate } from './inputTest';
describe('Physical test', () => {


	beforeAll(() => {
		jest.useFakeTimers('modern');
		jest.setSystemTime(new Date('2001-01-01'));
	});

	afterAll(() => {
		jest.useRealTimers();
	});
	// test('ISF: physicalIsf with flat hr =0.5', () => {
	// 	const activities = getFlatHeartRate({ heartRate: 170 * 0.5, created_at: '2001-01-01T00:00:00.000Z' }, 6);
	// 	const result = physicalIsf(activities, 51, 'Male');
	// 	jest.setSystemTime(new Date('2001-01-01T06:00:00.000Z'));
	// 	expect(result).toBe(1);
	// })

	// test('test flat 5hr=0.5 1h=0.7', () => {
	// 	jest.setSystemTime(new Date('2001-01-01T06:00:00.000Z'));
	// 	const activities05 = getFlatHeartRate({ heartRate: 170 * 0.5, created_at: '2001-01-01T00:00:00.000Z' }, 5);
	// 	const activities07 = getFlatHeartRate({ heartRate: 170 * 0.7, created_at: '2001-01-01T05:00:00.000Z' }, 1);
	// 	const result = physicalIsf([...activities05, ...activities07]);
	// 	expect(result).toBe(2.076371170507074);
	// })

	describe('ISF: physicalISF with 6h0.5 + 2h0.91 + 6h0.5', () => {
		const activities05 = getFlatHeartRate({ heartRate: 170 * 0.5, created_at: '2001-01-01T00:00:00.000Z' }, 6);
		const activities07 = getFlatHeartRate({ heartRate: 170 * 0.91, created_at: '2001-01-01T06:00:00.000Z' }, 2);
		const activities05n = getFlatHeartRate({ heartRate: 170 * 0.5, created_at: '2001-01-01T08:00:00.000Z' }, 6);

		test.each([...activities05, ...activities07, ...activities05n])('%p', (t) => {
			jest.setSystemTime(new Date(t.created_at));
			const pastActivities = [...activities05, ...activities07,...activities05n].filter(a=>a.created_at<=t.created_at)
			const result = physicalIsf(pastActivities, 51, 'Male');
			expect(result).toMatchSnapshot();
		})
	});

	describe('Liver: physicalLiver with 6h0.5 + 2h0.91 + 6h0.5', () => {
		const activities05 = getFlatHeartRate({ heartRate: 170 * 0.5, created_at: '2001-01-01T00:00:00.000Z' }, 6);
		const activities07 = getFlatHeartRate({ heartRate: 170 * 0.91, created_at: '2001-01-01T06:00:00.000Z' }, 2);
		const activities05n = getFlatHeartRate({ heartRate: 170 * 0.5, created_at: '2001-01-01T08:00:00.000Z' }, 6);

		test.each([...activities05, ...activities07, ...activities05n])('%p', (t) => {
			jest.setSystemTime(new Date(t.created_at));
			const pastActivities = [...activities05, ...activities07,...activities05n].filter(a=>a.created_at<=t.created_at)
			const result = physicalLiver(pastActivities, 51, 'Male');
			expect(result).toMatchSnapshot();
		})
	});


})