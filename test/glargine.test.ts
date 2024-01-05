import basal from '../src/basal';
import { diffOptions, getPngSnapshot } from './inputTest';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

describe('test glargine', () => {
  beforeEach(() => {
    expect.extend({ toMatchImageSnapshot });
  });

  test('weight:80 ins:30 minutesAgo:300', () => {
    const weight = 80;
    const insulinActive = basal(
      [
        {
          units: 30,
          minutesAgo: 300,
          drug: 'Gla',
        },
      ],
      weight,
    );
    expect(insulinActive).toMatchSnapshot();
  });
  test('weight:80 ins:30 all', async () => {
    const weight = 80;
    let insulinActive = 0;
    let insulinArr = [];

    for (let i = 0; i < 2000; i++) {
      const _insulinActive = basal(
        [
          {
            units: 30,
            minutesAgo: i,
            drug: 'Gla',
          },
        ],
        weight,
      );
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
      { scaleY: 1 },
    );

    expect(png).toMatchImageSnapshot(diffOptions);
  });

  test('insulin 5 min ago are less active then 40 min ago', () => {
    const units = 20;
    const weight = 80;

    const r5 = basal(
      [
        {
          units,
          minutesAgo: 5,
          drug: 'Gla',
        },
      ],
      weight,
    );
    const r40 = basal(
      [
        {
          units,
          minutesAgo: 40,
          drug: 'Gla',
        },
      ],
      weight,
    );
    expect(r5).toBeLessThan(r40);
  });
  test('peak has the greatest activity', () => {
    const units = 20;
    const weight = 80;

    const glarginePeakHours = (22 + (12 * units) / weight) / 2.5;

    const rBeforePeak = basal(
      [
        {
          units,
          minutesAgo: glarginePeakHours * 60 + 10,
          drug: 'Gla',
        },
      ],
      weight,
    );
    const rPeak = basal(
      [
        {
          units,
          minutesAgo: glarginePeakHours * 60,
          drug: 'Gla',
        },
      ],
      weight,
    );
    const rAfterPeak = basal(
      [
        {
          units,
          minutesAgo: glarginePeakHours * 60 - 10,
          drug: 'Gla',
        },
      ],
      weight,
    );
    expect(rBeforePeak).toBeLessThan(rPeak);
    expect(rAfterPeak).toBeLessThan(rPeak);
  });
});
