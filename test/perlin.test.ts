import perlin from "../src/perlin";
describe('test perlin', () => {
	beforeAll(() => {
		jest.useFakeTimers('modern');
		jest.setSystemTime(new Date('2001-01-01'));
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('run twice in same day should return same array', () => {
		const perl = perlin()
		jest.setSystemTime(new Date('2001-01-01T01:01'));
		const perl2 = perlin()
		expect(perl[0].time).toBe(perl2[0].time)
		expect(perl[0].noise).toBe(perl2[0].noise)
	})
	
	test('run in same should return same array', () => {
		const perl = perlin()
		expect(perl.length).toBe(288);
		expect(perl[0]).not.toBe(perl[1])

		expect(perl).toMatchSnapshot()
	})
})