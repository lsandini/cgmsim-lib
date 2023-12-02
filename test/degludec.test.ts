import { computeBasalActivity, durationBasal, peakBasal } from '../src/basal';
import { diffOptions, getPngSnapshot } from './inputTest';
const { toMatchImageSnapshot } = require('jest-image-snapshot');
describe('test degludec', () => {
  const degludec = (treatments) => {
    const toujeoT = treatments.map((e) => {
      const duration = durationBasal.DEG();
      const peak = peakBasal.DEG(duration);
      return {
        ...e,
        duration,
        peak,
      };
    });
    return computeBasalActivity(toujeoT);
  };
  beforeEach(() => {
    expect.extend({ toMatchImageSnapshot });
  });
  test('ins:30 minutesAgo:300', () => {
    const insulinActive = degludec([
      {
        insulin: 30,
        minutesAgo: 300,
      },
    ]);
    expect(insulinActive).toMatchSnapshot();
  });

  test('ins:30 hoursAgo: 44', () => {
    const insulinActive = degludec([
      {
        insulin: 30,
        minutesAgo: 44 * 60,
      },
    ]);
    expect(insulinActive).toBe(0);
  });

  test('weight:80 ins:30 all', async () => {
    const weight = 80;
    let insulinActive = 0;
    let insulinArr = [];

    for (let i = 0; i < 2000; i++) {
      const _insulinActive = degludec([
        {
          insulin: 30,
          minutesAgo: i,
        },
      ]);
      insulinActive += _insulinActive > 0 ? _insulinActive : 0;
      insulinArr.push(_insulinActive > 0 ? _insulinActive : 0);
    }
    expect(insulinActive).toMatchSnapshot();
    expect(insulinArr).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'single',
        values: insulinArr.map((sgv, index) => ({
          key: index,
          value: sgv,
        })),
      },
      { scaleY: 1 }
    );
    expect(png).toMatchImageSnapshot(diffOptions);
  });

  test('insulin 5 min ago are less active then 40 min ago', () => {
    const insulin = 20;

    const r5 = degludec([
      {
        insulin,
        minutesAgo: 5,
      },
    ]);
    const r40 = degludec([
      {
        insulin,
        minutesAgo: 40,
      },
    ]);
    expect(r5).toBeLessThan(r40);
  });
  test('peak has the greatest activity', () => {
    const insulin = 20;
    const degludecPeakHours = 42 / 3;
    const rBeforePeak = degludec([
      {
        insulin,
        minutesAgo: degludecPeakHours * 60 + 10,
      },
    ]);
    const rPeak = degludec([
      {
        insulin,
        minutesAgo: degludecPeakHours * 60,
      },
    ]);
    const rAfterPeak = degludec([
      {
        insulin,
        minutesAgo: degludecPeakHours * 60 - 10,
      },
    ]);
    expect(rBeforePeak).toBeLessThan(rPeak);
    expect(rAfterPeak).toBeLessThan(rPeak);
  });
});
