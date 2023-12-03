import { TreatmentDelta } from 'src/Types';
import { computeBasalActivity, durationBasal, peakBasal } from '../src/basal';
import { diffOptions, getPngSnapshot } from './inputTest';
const { toMatchImageSnapshot } = require('jest-image-snapshot');
describe('test detemir', () => {
  beforeEach(() => {
    expect.extend({ toMatchImageSnapshot });
  });

  type MockTreatment = {
    units: TreatmentDelta['units'];
    minutesAgo: TreatmentDelta['minutesAgo'];
  };

  const detemir = (weight: number, treatments: MockTreatment[]): number => {
    const detemirT = treatments.map((e) => {
      const duration = durationBasal.DET(e.units, weight);
      const peak = peakBasal.DET(duration);
      return {
        ...e,
        duration,
        peak,
      };
    });
    return computeBasalActivity(detemirT);
  };

  test('weight:80 ins:30 minutesAgo:300', () => {
    const weight = 80;
    const insulinActive = detemir(weight, [
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
      const _insulinActive = detemir(weight, [
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

    const r5 = detemir(weight, [
      {
        units,
        minutesAgo: 5,
      },
    ]);
    const r40 = detemir(weight, [
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

    const detemirPeakHours = (14 + (24 * units) / weight) / 3;
    const rBeforePeak = detemir(weight, [
      {
        units,
        minutesAgo: detemirPeakHours * 60 + 10,
      },
    ]);
    const rPeak = detemir(weight, [
      {
        units,
        minutesAgo: detemirPeakHours * 60,
      },
    ]);
    const rAfterPeak = detemir(weight, [
      {
        units,
        minutesAgo: detemirPeakHours * 60 - 10,
      },
    ]);
    expect(rBeforePeak).toBeLessThan(rPeak);
    expect(rAfterPeak).toBeLessThan(rPeak);
  });
});
