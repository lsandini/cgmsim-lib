import { treatments } from "./inputTest";
import all_meals from '../src/all_meals';
import { Treatment } from "src/Types";
import moment = require("moment");
describe('all meals', () => {
	test('test conversion all meals with old carbs', () => {
		const trets = [...treatments] as unknown as Treatment[];
		trets.forEach(ts => {
			ts.created_at =moment().add(-361, 'minutes').format();
		})

		const t = all_meals(trets);
		expect(t.length).toBe(0)

	});
	test('test conversion all meals with old carbs', () => {
		const ts = [...treatments] as unknown as Treatment[];
		ts.forEach(ts => {
			ts.created_at = moment().format();
		})

		const t = all_meals(ts);
		expect(t.length).toBe(2)

	});
})