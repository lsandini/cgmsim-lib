import moment = require('moment');
import carbs from '../src/carbs';
import { calculateCarbsCOB, splitMealCarbs } from '../src/core/carbs';
import { triangularAbsorptionRate, triangularAbsorptionRemaining } from '../src/core/utils';
import { drugs } from '../src/core/drug';
import { oldCarbs } from '../old/oldCarbs';
import { diffOptions, getPngSnapshot } from './inputTest';
import { NSTreatment } from '../src/Types';
import { TypeDateISO } from '../src/TypeDateISO';

const now = '2001-01-01T07:00:00Z';
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const math = global.Math;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(now));
  expect.extend({ toMatchImageSnapshot });
  const mockMath = Object.create(global.Math);
  mockMath.random = () => 0.5;
  global.Math = mockMath;
});
afterAll(() => {
  jest.useRealTimers();
  global.Math = math;
});

const minutesAgo = (min) =>
  moment(now).add(-min, 'minutes').toISOString() as TypeDateISO;
describe('Carbs test', () => {
  test('test carbs without treatments return 0', () => {
    const r = carbs([], 360, 30, 10);
    expect(r).toBe(0);
  });
  test('test carbs with old treatments return 0', () => {
    const r = carbs(
      [
        {
          eventType: 'Meal Bolus',
          carbs: 44,
          insulin: 0,
          created_at: minutesAgo(361),
        },
      ],
      360,
      30,
      10,
    );
    expect(r).toBe(0);
  });

  test('test carbs <=40 with active treatments return fix carbsActive', () => {
    const r = carbs(
      [
        {
          eventType: 'Meal Bolus',
          carbs: 40,
          insulin: 0,
          created_at: minutesAgo(45),
        },
      ],
      360,
      30,
      10,
    );
    expect(r).toMatchSnapshot();
  });

  test('test carbs <=40 with active treatments return carbsActive', () => {
    const r = carbs(
      [
        {
          eventType: 'Meal Bolus',
          carbs: 20,
          insulin: 0,
          created_at: minutesAgo(1),
        },
        {
          eventType: 'Meal Bolus',
          carbs: 20,
          insulin: 0,
          created_at: minutesAgo(45),
        },
      ],
      360,
      30,
      10,
    );
    expect(r).toMatchSnapshot();
  });

  test('carbs 40 min ago are more active then 60 min ago ', () => {
    const r40 = carbs(
      [
        {
          eventType: 'Meal Bolus',
          carbs: 20,
          insulin: 0,
          created_at: minutesAgo(40),
        },
      ],
      360,
      30,
      10,
    );
    const r60 = carbs(
      [
        {
          eventType: 'Meal Bolus',
          carbs: 20,
          insulin: 0,
          created_at: minutesAgo(60),
        },
      ],
      360,
      30,
      10,
    );
    expect(r40).toBeGreaterThan(r60);
  });

  test('carbs 5 min ago are less active then 40 min ago', () => {
    const r5 = carbs(
      [
        {
          eventType: 'Meal Bolus',
          carbs: 20,
          insulin: 0,
          created_at: minutesAgo(5),
        },
      ],
      360,
      30,
      10,
    );
    const r60 = carbs(
      [
        {
          eventType: 'Meal Bolus',
          carbs: 20,
          insulin: 0,
          created_at: minutesAgo(40),
        },
      ],
      360,
      30,
      10,
    );
    expect(r5).toBeLessThan(r60);
  });

  test('test carbs >40 with active treatments return carbsActive random', () => {
    const r = carbs(
      [
        {
          eventType: 'Meal Bolus',
          carbs: 40,
          insulin: 0,
          created_at: minutesAgo(1),
        },
        {
          eventType: 'Meal Bolus',
          carbs: 40,
          insulin: 0,
          created_at: minutesAgo(45),
        },
      ],
      360,
      30,
      10,
    );
    expect(r).toBeGreaterThan(0);
  });

  it.each([
    [[2, 21]],
    [[3, 7, 21]],
    [[5, 27, 55, 98]],
    [[15, 22, 35, 83, 143]],
  ])('test carb %p', (numbers: number[]) => {
    const e: NSTreatment[] = numbers.map((n) => ({
      eventType: 'Meal Bolus',
      carbs: 20,
      insulin: 0,
      created_at: minutesAgo(n),
    }));
    const r = carbs(e, 360, 30, 10);
    expect(r).toMatchSnapshot();
  });
});

describe('Carbs test compare old', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(now));
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  test('should first', async () => {
    let now = moment();
    const oldC: number[] = [];
    const newC: number[] = [];
    const isf = 36;
    const cr = 10;
    //
    for (let i = 0; i < 360; i++) {
      jest.setSystemTime(now.toDate());

      const treatment = [
        {
          eventType: 'Meal Bolus',
          carbs: 40,
          insulin: 0,
          created_at: minutesAgo(1),
          time: moment(minutesAgo(1)).toDate().getTime(),
        },
      ];
      const carbAbs = 360;
      const newCarb = carbs(treatment as NSTreatment[], carbAbs, isf, cr);
      const old = oldCarbs(treatment, carbAbs);
      newC.push(newCarb); // new raw value is multiplied by isfMMol/CR  or 2/10 or 1/5 !
      oldC.push(old); // old raw value is not multiplied by CSF (isfMMol/CR)
      now = now.add(1, 'minutes');
    }
    const newT = newC.reduce((acc, i) => i * (cr / (isf / 18)) + acc, 0);
    const oldT = oldC.reduce((acc, i) => i + acc, 0);
    expect(newT.toFixed(5)).toBe(oldT.toFixed(5));
    expect(newT.toFixed(5)).toBe(oldT.toFixed(5));
    const png = await getPngSnapshot(
      {
        type: 'multiple',
        values: [
          newC.map((sgv, index) => ({ key: index, value: sgv })),
          oldC.map((sgv, index) => ({ key: index, value: sgv })),
        ],
      },
      { scaleY: true },
    );
    expect(png).toMatchImageSnapshot(diffOptions);
  });
});

describe('Dual-Wave Carb Kinetics', () => {
  it('conserves mass in triangular absorption', () => {
    const carbsAmount = 60;
    const duration = 210;
    let absorbed = 0;
    const dt = 1;

    for (let t = 0; t <= duration; t += dt) {
      const rate = triangularAbsorptionRate(carbsAmount, t, duration);
      absorbed += rate * dt;
    }

    expect(absorbed).toBeCloseTo(carbsAmount, 1);
    expect(triangularAbsorptionRemaining(carbsAmount, duration, duration)).toBe(0);
    expect(triangularAbsorptionRemaining(carbsAmount, 0, duration)).toBe(carbsAmount);
  });

  it('peaks at half of absorption duration', () => {
    const carbsAmount = 50;
    const duration = 200;
    const peak = duration / 2;

    const rateAtPeak = triangularAbsorptionRate(carbsAmount, peak, duration);
    const rateBefore = triangularAbsorptionRate(carbsAmount, peak - 5, duration);
    const rateAfter = triangularAbsorptionRate(carbsAmount, peak + 5, duration);

    expect(rateAtPeak).toBeGreaterThan(rateBefore);
    expect(rateAtPeak).toBeGreaterThan(rateAfter);
  });

  it('eliminates the 240-minute early cutoff for 360-minute meals', () => {
    const baseTime = new Date('2026-10-28T12:00:00Z');
    const meal = {
      carbs: 60,
      timestamp: baseTime.toISOString(),
      absorptionDuration: 360,
      type: 'carb' as const,
    };

    // At hour 5 (300 minutes), absorption and COB must still be active!
    const time300 = new Date(baseTime.getTime() + 300 * 60 * 1000);
    const effectAt300 = carbs([meal], 360, 45, 10, time300);
    const cobAt300 = calculateCarbsCOB(360, [meal], time300);

    expect(effectAt300).toBeGreaterThan(0);
    expect(cobAt300).toBeGreaterThan(0);

    // At 360 minutes, COB must reach 0
    const time360 = new Date(baseTime.getTime() + 360 * 60 * 1000);
    const cobAt360 = calculateCarbsCOB(360, [meal], time360);
    expect(cobAt360).toBe(0);
  });

  it('supports referenceTime parameter for forward simulation', () => {
    const baseTime = new Date('2026-10-28T08:00:00Z');
    const meal = {
      carbs: 40,
      timestamp: baseTime.toISOString(),
      absorptionDuration: 120,
      type: 'carb' as const,
    };

    const stepTime = new Date(baseTime.getTime() + 30 * 60 * 1000);
    const cobAt30 = calculateCarbsCOB(120, [meal], stepTime);
    expect(cobAt30).toBeLessThan(40);
    expect(cobAt30).toBeGreaterThan(0);
  });

  it('exports basal drugs correctly', () => {
    expect(drugs.GLA).toBeDefined();
    expect(drugs.TOU).toBeDefined();
    expect(drugs.DEG).toBeDefined();
    expect(drugs.DEG.duration()).toBe(42 * 60);
  });
});

