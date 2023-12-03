import { TreatmentDelta } from 'src/Types';
import { computeBasalActivity } from '../src/basal';
import { drugs } from '../src/drug';

import { diffOptions, getPngSnapshot } from './inputTest';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

type MockTreatment = {
    units: TreatmentDelta['units'];
    minutesAgo: TreatmentDelta['minutesAgo'];
  };

describe('test toujeo', () => {
  beforeEach(() => {
    expect.extend({ toMatchImageSnapshot });
  });

  const toujeo = (weight, treatments:MockTreatment[]) => {
    const toujeoT = treatments.map((e) => {
      const duration = drugs.TOU.duration(e.units, weight);
      const peak = drugs.TOU.peak(duration);
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
    const insulinActive = toujeo(weight, [
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
      const _insulinActive = toujeo(weight, [
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
      { scaleY: 1}
    );

    expect(png).toMatchImageSnapshot(diffOptions);
  });

  test('insulin 5 min ago are less active then 40 min ago', () => {
    const units = 20;
    const weight = 80;

    const r5 = toujeo(weight, [
      {
        units,
        minutesAgo: 5,
      },
    ]);
    const r40 = toujeo(weight, [
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

    const toujeoPeakHours = (24 + (14 * units) / weight) / 2.5;

    const rBeforePeak = toujeo(weight, [
      {
        units,
        minutesAgo: toujeoPeakHours * 60 + 10,
      },
    ]);
    const rPeak = toujeo(weight, [
      {
        units,
        minutesAgo: toujeoPeakHours * 60,
      },
    ]);
    const rAfterPeak = toujeo(weight, [
      {
        units,
        minutesAgo: toujeoPeakHours * 60 - 10,
      },
    ]);
    expect(rBeforePeak).toBeLessThan(rPeak);
    expect(rAfterPeak).toBeLessThan(rPeak);
  });
  test('20g activity after 5h 6h 7h should be >0.1 ', () => {
    const units = 20;
    const weight = 80;

    const sixHoursActivity = toujeo(weight, [
      {
        units,
        minutesAgo: 60 * 6,
      },
    ]);
    const fiveHoursActivity = toujeo(weight, [
      {
        units,
        minutesAgo: 60 * 6,
      },
    ]);
    const sevenHoursActivity = toujeo(weight, [
      {
        units,
        minutesAgo: 60 * 7,
      },
    ]);

    expect(fiveHoursActivity).toBeGreaterThan(0.01);
    expect(sixHoursActivity).toBeGreaterThan(0.01);
    expect(sevenHoursActivity).toBeGreaterThan(0.01);

    expect(fiveHoursActivity).toMatchSnapshot();
    expect(sixHoursActivity).toMatchSnapshot();
    expect(sevenHoursActivity).toMatchSnapshot();
  });
});
