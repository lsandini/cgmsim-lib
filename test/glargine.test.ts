import { TreatmentDelta } from 'src/Types';
import { computeBasalActivity } from '../src/basal';
import { drugs } from '../src/drug';
import { diffOptions, getPngSnapshot } from './inputTest';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

type MockTreatment = {
  units: TreatmentDelta['units'];
  minutesAgo: TreatmentDelta['minutesAgo'];
};

describe('test glargine', () => {
  beforeEach(() => {
    expect.extend({ toMatchImageSnapshot });
  });
  const glargine = (weight, treatments:MockTreatment[]): number => {
    const toujeoT = treatments.map((e) => {
      const duration = drugs.GLA.duration(e.units, weight);
      const peak = drugs.GLA.peak(duration);
      return {
        ...e,
        duration,
        peak,
      };
    });
    return computeBasalActivity(toujeoT);
  };

  test('weight:80 ins:30 minutesAgo:300', () => {
    const weight = 80;
    const insulinActive = glargine(weight, [
      {
        units: 30,
        minutesAgo: 300,
      },
    ]);
    expect(insulinActive).toMatchSnapshot();
  });
  test('weight:80 ins:30 all', async () => {
    const weight = 80;
    let insulinActive = 0;
    let insulinArr = [];

    for (let i = 0; i < 2000; i++) {
      const _insulinActive = glargine(weight, [
        {
          units: 30,
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
    const weight = 80;

    const r5 = glargine(weight, [
      {
        units,
        minutesAgo: 5,
      },
    ]);
    const r40 = glargine(weight, [
      {
        units,
        minutesAgo: 40,
      },
    ]);
    expect(r5).toBeLessThan(r40);
  });
  test('peak has the greatest activity', () => {
    const units = 20;
    const weight = 80;

    const glarginePeakHours = (22 + (12 * units) / weight) / 2.5;

    const rBeforePeak = glargine(weight, [
      {
        units,
        minutesAgo: glarginePeakHours * 60 + 10,
      },
    ]);
    const rPeak = glargine(weight, [
      {
        units,
        minutesAgo: glarginePeakHours * 60,
      },
    ]);
    const rAfterPeak = glargine(weight, [
      {
        units,
        minutesAgo: glarginePeakHours * 60 - 10,
      },
    ]);
    expect(rBeforePeak).toBeLessThan(rPeak);
    expect(rAfterPeak).toBeLessThan(rPeak);
  });
});
