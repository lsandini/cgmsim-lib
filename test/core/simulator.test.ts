import {
	simulateGlucose,
	calculateTrendArrow,
	calculateExponentialIOB,
	calculateCOB,
	CorePatient,
	CoreTreatment,
	CoreGlucoseEntry,
} from '../../src/core';

describe('Core Simulation Engine (@lsandini/cgmsim-lib/core)', () => {
	const mockPatient: CorePatient = {
		isf: 50,
		cr: 10,
		dia: 5,
		tp: 75,
		weight: 75,
		age: 35,
		gender: 'male',
		carbsAbsTime: 360,
	};

	test('simulateGlucose produces deterministic, valid glucose result', () => {
		const now = Date.now();

		const recentEntries: CoreGlucoseEntry[] = [
			{ timestamp: now - 5 * 60000, sgv: 120 },
			{ timestamp: now - 10 * 60000, sgv: 115 },
			{ timestamp: now - 15 * 60000, sgv: 110 },
			{ timestamp: now - 20 * 60000, sgv: 105 },
		];

		const treatments: CoreTreatment[] = [
			{
				timestamp: now - 30 * 60000,
				type: 'bolus',
				units: 5,
			},
			{
				timestamp: now - 25 * 60000,
				type: 'carb',
				carbs: 40,
			},
		];

		const basalProfile = Array.from({ length: 24 }, (_, hour) => ({ hour, rate: 0.8 }));

		const result = simulateGlucose({
			patient: mockPatient,
			treatments,
			recentEntries,
			basalProfile,
			targetTime: now,
		});

		expect(result).toBeDefined();
		expect(typeof result.sgv).toBe('number');
		expect(result.sgv).toBeGreaterThanOrEqual(40);
		expect(result.sgv).toBeLessThanOrEqual(400);
		expect(typeof result.iob).toBe('number');
		expect(result.iob).toBeGreaterThan(0);
		expect(typeof result.cob).toBe('number');
		expect(result.cob).toBeGreaterThan(0);
		expect(typeof result.direction).toBe('string');
		expect(typeof result.activity).toBe('number');
		expect(result.timestamp).toBe(now);
	});

	test('calculateTrendArrow calculates directions correctly', () => {
		const now = Date.now();
		const risingEntries: CoreGlucoseEntry[] = [
			{ timestamp: now, sgv: 140 },
			{ timestamp: now - 5 * 60000, sgv: 130 },
			{ timestamp: now - 10 * 60000, sgv: 120 },
			{ timestamp: now - 15 * 60000, sgv: 110 },
		];

		const direction = calculateTrendArrow(risingEntries);
		expect(direction).toBe('DoubleUp');

		const flatEntries: CoreGlucoseEntry[] = [
			{ timestamp: now, sgv: 100 },
			{ timestamp: now - 5 * 60000, sgv: 100 },
			{ timestamp: now - 10 * 60000, sgv: 100 },
			{ timestamp: now - 15 * 60000, sgv: 100 },
		];

		expect(calculateTrendArrow(flatEntries)).toBe('Flat');
	});

	test('calculateExponentialIOB calculates active IOB correctly', () => {
		const now = Date.now();
		const treatments: CoreTreatment[] = [
			{
				timestamp: now - 60 * 60000,
				type: 'bolus',
				units: 10,
			},
		];

		const iob = calculateExponentialIOB(treatments, 5, 75);
		expect(iob).toBeGreaterThan(0);
		expect(iob).toBeLessThan(10);
	});

	test('calculateCOB calculates remaining carbs correctly', () => {
		const now = Date.now();
		const treatments: CoreTreatment[] = [
			{
				timestamp: now - 30 * 60000,
				type: 'carb',
				carbs: 60,
			},
		];

		const cob = calculateCOB(360, treatments);
		expect(cob).toBeGreaterThan(0);
		expect(cob).toBeLessThan(60);
	});
});
