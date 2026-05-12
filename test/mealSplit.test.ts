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

	describe('carbs <= 30g', () => {
		test('returns 100% fast, 0% slow', () => {
			const meal = { ...baseMeal, carbs: 20 };
			const { fastCarbs, slowCarbs } = splitMealCarbs(meal);
			expect(fastCarbs).toBe(20);
			expect(slowCarbs).toBe(0);
		});

		test('exactly 30g is all-fast', () => {
			const meal = { ...baseMeal, carbs: 30 };
			const { fastCarbs, slowCarbs } = splitMealCarbs(meal);
			expect(fastCarbs).toBe(30);
			expect(slowCarbs).toBe(0);
		});
	});

	describe('carbs > 30g', () => {
		test('fastCarbs >= 30 (the guaranteed fast portion)', () => {
			const meal = { ...baseMeal, carbs: 100 };
			const { fastCarbs } = splitMealCarbs(meal);
			expect(fastCarbs).toBeGreaterThanOrEqual(30);
		});

		test('split applies extraFastRatio to (carbs - 30)', () => {
			const meal = { ...baseMeal, carbs: 80 };
			const { fastCarbs, slowCarbs, extraFastRatio } = splitMealCarbs(meal);
			expect(fastCarbs).toBeCloseTo(30 + extraFastRatio * 50, 10);
			expect(slowCarbs).toBeCloseTo((1 - extraFastRatio) * 50, 10);
		});
	});

	describe('extraFastRatio range', () => {
		test('stays within [0.2, 0.7] across many seeds', () => {
			for (let i = 0; i < 1000; i++) {
				const minute = String(i % 60).padStart(2, '0');
				const hour = String(Math.floor(i / 60) % 24).padStart(2, '0');
				const meal = {
					...baseMeal,
					created_at: `2024-01-01T${hour}:${minute}:00.000Z` as TypeDateISO,
					carbs: 80,
				};
				const { extraFastRatio } = splitMealCarbs(meal);
				expect(extraFastRatio).toBeGreaterThanOrEqual(0.2);
				expect(extraFastRatio).toBeLessThanOrEqual(0.7);
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
