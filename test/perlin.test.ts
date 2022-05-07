import perlin from "../src/perlin";
describe('test perlin', () => {
	beforeAll(() => {
		jest.useFakeTimers('modern');
		jest.setSystemTime(new Date('2001-01-01'));
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('run in same should return same array', () => {
		const perl = perlin()
		expect(perl.length).toBe(288)
		expect(perl).toMatchSnapshot()
	})
})