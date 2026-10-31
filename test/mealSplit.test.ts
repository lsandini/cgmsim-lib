import { splitMealCarbs } from '../src/carbs';
import { TypeDateISO } from '../src/TypeDateISO';

const baseMeal = {
	eventType: 'Meal Bolus' as const,
	insulin: 0,
	created_at: '2024-01-01T12:00:00.000Z' as TypeDateISO,
};

describe('splitMealCarbs', () => {
	describe('determinism', () => {
		test('same created_at + carbs produce identical splits across repeated calls', () => {
			const meal = { ...baseMeal, carbs: 80 };
			const a = splitMealCarbs(meal);
			const b = splitMealCarbs(meal);
			const c = splitMealCarbs(meal);
			expect(a).toEqual(b);
			expect(b).toEqual(c);
		});

		test('split conserves total carbs (fast + slow = carbs)', () => {
			const meal = { ...baseMeal, carbs: 75 };
			const { fastCarbs, slowCarbs } = splitMealCarbs(meal);
			expect(fastCarbs + slowCarbs).toBeCloseTo(75, 10);
		});
	});

	describe('carbs <= 15g', () => {
		test('returns 100% fast, 0% slow', () => {
			const meal = { ...baseMeal, carbs: 10 };
			const { fastCarbs, slowCarbs } = splitMealCarbs(meal);
			expect(fastCarbs).toBe(10);
			expect(slowCarbs).toBe(0);
		});

		test('exactly 15g is all-fast', () => {
			const meal = { ...baseMeal, carbs: 15 };
			const { fastCarbs, slowCarbs } = splitMealCarbs(meal);
			expect(fastCarbs).toBe(15);
			expect(slowCarbs).toBe(0);
		});
	});

	describe('carbs > 15g', () => {
		test('fastCarbs >= 15 (the guaranteed fast portion)', () => {
			const meal = { ...baseMeal, carbs: 100 };
			const { fastCarbs } = splitMealCarbs(meal);
			expect(fastCarbs).toBeGreaterThanOrEqual(15);
		});

		test('split applies extraFastRatio to (carbs - 15)', () => {
			const meal = { ...baseMeal, carbs: 80 };
			const { fastCarbs, slowCarbs, extraFastRatio } = splitMealCarbs(meal);
			expect(fastCarbs).toBeCloseTo(15 + extraFastRatio * 65, 10);
			expect(slowCarbs).toBeCloseTo((1 - extraFastRatio) * 65, 10);
		});
	});

	describe('extraFastRatio range', () => {
		test('stays within [0.0, 0.5] across many seeds', () => {
			for (let i = 0; i < 1000; i++) {
				const minute = String(i % 60).padStart(2, '0');
				const hour = String(Math.floor(i / 60) % 24).padStart(2, '0');
				const meal = {
					...baseMeal,
					created_at: `2024-01-01T${hour}:${minute}:00.000Z` as TypeDateISO,
					carbs: 80,
				};
				const { extraFastRatio } = splitMealCarbs(meal);
				expect(extraFastRatio).toBeGreaterThanOrEqual(0.0);
				expect(extraFastRatio).toBeLessThanOrEqual(0.5);
			}
		});

		test('produces values spanning much of the range (not constant)', () => {
			const ratios = new Set<number>();
			for (let i = 0; i < 500; i++) {
				const meal = { ...baseMeal, carbs: 30 + i };
				ratios.add(splitMealCarbs(meal).extraFastRatio);
			}
			const arr = [...ratios];
			const min = Math.min(...arr);
			const max = Math.max(...arr);
			expect(max - min).toBeGreaterThan(0.3);
		});
	});

	describe('inter-meal variability', () => {
		test('different created_at produces different extraFastRatios', () => {
			const ratios = new Set<number>();
			for (let i = 0; i < 50; i++) {
				const minute = String(i).padStart(2, '0');
				const meal = {
					...baseMeal,
					created_at: `2024-01-01T12:${minute}:00.000Z` as TypeDateISO,
					carbs: 80,
				};
				ratios.add(splitMealCarbs(meal).extraFastRatio);
			}
			expect(ratios.size).toBeGreaterThan(40);
		});

		test('different carbs produces different extraFastRatios', () => {
			const ratios = new Set<number>();
			for (let i = 0; i < 50; i++) {
				const meal = { ...baseMeal, carbs: 40 + i };
				ratios.add(splitMealCarbs(meal).extraFastRatio);
			}
			expect(ratios.size).toBeGreaterThan(40);
		});
	});
});
