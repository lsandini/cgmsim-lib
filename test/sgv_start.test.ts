import sgv_start from '../src/sgv';
describe('Liver test', () => {

	test('nothing', () => {
		const minutes = 15;
		const sgv=90;
		const millsNow = new Date().getTime() - (1000 * 60 * minutes);
		const r = sgv_start([{ sgv, mills: millsNow }], {
			carbsActivity: 0,
			basalActivity:0,
			liverActivity: 0,
			bolusActivity: 0,			
		}, [], 30);
		expect(r.sgv).toBe(90)
	})

	test('with liver', () => {
		const minutes = 15;
		const sgv=90;
		const millsNow = new Date().getTime() - (1000 * 60 * minutes);
		const r = sgv_start([{ sgv, mills: millsNow }], {
			carbsActivity:0,
			basalActivity:0,
			liverActivity: 0.02,
			bolusActivity: 0,
			
		}, [], 30);
		expect(r.sgv).toBeGreaterThan(sgv)
	})

	test('with ins', () => {
		const minutes = 15;
		const sgv=90;
		const millsNow = new Date().getTime() - (1000 * 60 * minutes);
		const r = sgv_start([{ sgv, mills: millsNow }], {
			carbsActivity: 0,
			basalActivity:0.02,
			liverActivity: 0,
			bolusActivity: 0,			
		}, [], 30);
		expect(r.sgv).toBeLessThan(sgv)
	})
	// it.each([
	// 	[[30, 10]],
	// 	[[20, 8]],
	// 	[[40, 14]],
	// ])('test liver %p', ([isf, cr]) => {

	// 	const r = liver(isf, cr);
	// 	expect(r).toMatchSnapshot();

	// });
})