import { TreatmentDelta } from 'src/Types';
import { computeBasalActivity,  } from '../src/basal';
import { diffOptions, getPngSnapshot } from './inputTest';
import { drugs } from '../src/drug';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

type MockTreatment = {
    units: TreatmentDelta['units'];
    minutesAgo: TreatmentDelta['minutesAgo'];
  };

describe('test degludec', () => {
  const degludec = (treatments:MockTreatment[]):number => {
    const toujeoT = treatments.map((e) => {
      const duration = drugs.DEG.duration();
      const peak = drugs.DEG.peak(duration);
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
        units:30,
        minutesAgo: 300,
      },
    ]);
    expect(insulinActive).toMatchSnapshot();
  });

  test('ins:30 hoursAgo: 44', () => {
    const insulinActive = degludec([
      {
        units:30,
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
          units:30,
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
    const units = 20;

    const r5 = degludec([
      {
        units,
        minutesAgo: 5,
      },
    ]);
    const r40 = degludec([
      {
        units,
        minutesAgo: 40,
      },
    ]);
    expect(r5).toBeLessThan(r40);
  });
  test('peak has the greatest activity', () => {
    const units = 20;
    const degludecPeakHours = 42 / 3;
    const rBeforePeak = degludec([
      {
        units,
        minutesAgo: degludecPeakHours * 60 + 10,
      },
    ]);
    const rPeak = degludec([
      {
        units,
        minutesAgo: degludecPeakHours * 60,
      },
    ]);
    const rAfterPeak = degludec([
      {
        units,
        minutesAgo: degludecPeakHours * 60 - 10,
      },
    ]);
    expect(rBeforePeak).toBeLessThan(rPeak);
    expect(rAfterPeak).toBeLessThan(rPeak);
  });
});
