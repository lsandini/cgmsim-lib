import sgv_start from '../src/sgv_start';
describe('Liver test', () => {

	test('nothing', () => {
		const minutes = 15;
		const sgv=90;
		const millsNow = new Date().getTime() - (1000 * 60 * minutes);
		const r = sgv_start([{ sgv, mills: millsNow }], {
			carbs: 0,
			degludec: 0,
			det: 0,
			gla: 0,
			liver: 0,
			resultAct: 0,
			tou: 0
		}, [], 30);
		expect(r.sgv).toBe(90)
	})

	test('with liver', () => {
		const minutes = 15;
		const sgv=90;
		const millsNow = new Date().getTime() - (1000 * 60 * minutes);
		const r = sgv_start([{ sgv, mills: millsNow }], {
			carbs: 0,
			degludec: 0,
			det: 0,
			gla: 0,
			liver: 0.02,
			resultAct: 0,
			tou: 0
		}, [], 30);
		expect(r.sgv).toBeGreaterThan(sgv)
	})

	test('with ins', () => {
		const minutes = 15;
		const sgv=90;
		const millsNow = new Date().getTime() - (1000 * 60 * minutes);
		const r = sgv_start([{ sgv, mills: millsNow }], {
			carbs: 0,
			degludec: 0,
			det: 0,
			gla: 0.02,
			liver: 0,
			resultAct: 0,
			tou: 0
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