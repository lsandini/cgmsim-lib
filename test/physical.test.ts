import { physicalIsf } from '../src/physical';
import { HRFlatActivities as HRFlatLess06Activities } from './inputTest';
describe('Physical test', () => {


	beforeAll(() => {
		jest.useFakeTimers('modern');
		jest.setSystemTime(new Date('2001-01-01'));
	});
	
	afterAll(() => {
		jest.useRealTimers();
	});
	test('test flat hr',()=>{
		const activities= HRFlatLess06Activities;
		const result =physicalIsf(activities);
		jest.setSystemTime(new Date('2001-01-01T06:00:00.000Z'));
		expect(result).toBe(1);
	})



})