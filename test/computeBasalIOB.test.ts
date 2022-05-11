import { treatments } from "./inputTest";
import computeBasalIOB from "../src/computeBasalIOB";
import { Treatment } from "../src/Types";

describe('test computeBasalIOB', () => {

	beforeAll(() => {
		jest.useFakeTimers('modern');
		jest.setSystemTime(new Date('2022-05-07T11:20:00'));
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('detection drug', () => {
		const result = computeBasalIOB(treatments as unknown as Treatment[]);

		expect(result.lastGLA.length).toBe(1);
		expect(result.lastDEG.length).toBe(0);
		expect(result.lastDET.length).toBe(0);
		expect(result.lastTOU.length).toBe(0);
	})
	test('detection insulin', () => {
		const result = computeBasalIOB(treatments as unknown as Treatment[]);

		expect(result.lastGLA.length).toBe(1);
		expect(result.lastGLA[0].insulin).toBe(10);
		expect(result.lastDEG.length).toBe(0);
		expect(result.lastDET.length).toBe(0);
		expect(result.lastTOU.length).toBe(0);
	})


})