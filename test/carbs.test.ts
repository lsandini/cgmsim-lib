import moment = require('moment');
import carbs from '../src/carbs';
import { oldCarbs } from '../old/oldCarbs';
import { diffOptions, getPngSnapshot } from './inputTest';
import { NSTreatment } from '../src/Types';
import { TypeDateISO } from '../src/TypeDateISO';

const now = '2001-01-01T07:00:00';
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const math = global.Math;

beforeEach(() => {
  jest.useFakeTimers('modern');
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

const isf = 30 / 18;

const minutesAgo = (min) =>
  moment(now).add(-min, 'minutes').toISOString() as TypeDateISO;
describe('Carbs test', () => {
  test('test carbs without treatments return 0', () => {
    const r = carbs([], 360, isf, 10);
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
      isf,
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
      isf,
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
      isf,
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
      isf,
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
      isf,
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
      isf,
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
      isf,
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
      isf,
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
    const r = carbs(e, 360, isf, 10);
    expect(r).toMatchSnapshot();
  });
});

describe('Carbs test compare old', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(now));
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  test('should first', async () => {
    let now = moment();
    const oldC: number[] = [];
    const newC: number[] = [];
    const isf = 36 / 18;
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
    const newT = newC.reduce((acc, i) => i * (cr / isf) + acc, 0);
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
