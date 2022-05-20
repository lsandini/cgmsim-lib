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
		const result = computeBasalIOB(treatments as unknown as Treatment[],80);

		expect(result).toMatchSnapshot()
	})
})