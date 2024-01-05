import basal from '../src/basal';
import { diffOptions, getPngSnapshot } from './inputTest';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

describe('test toujeo', () => {
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
          drug: 'Tou',
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
            drug: 'Tou',
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
          drug: 'Tou',
        },
      ],
      weight,
    );
    const r40 = basal(
      [
        {
          units,
          minutesAgo: 40,
          drug: 'Tou',
        },
      ],
      weight,
    );
    expect(r5).toBeLessThan(r40);
  });
  test('peak has the greatest activity', () => {
    const units = 20;
    const weight = 80;

    const toujeoPeakHours = (24 + (14 * units) / weight) / 2.5;

    const rBeforePeak = basal(
      [
        {
          units,
          minutesAgo: toujeoPeakHours * 60 + 10,
          drug: 'Tou',
        },
      ],
      weight,
    );
    const rPeak = basal(
      [
        {
          units,
          minutesAgo: toujeoPeakHours * 60,
          drug: 'Tou',
        },
      ],
      weight,
    );
    const rAfterPeak = basal(
      [
        {
          units,
          minutesAgo: toujeoPeakHours * 60 - 10,
          drug: 'Tou',
        },
      ],
      weight,
    );
    expect(rBeforePeak).toBeLessThan(rPeak);
    expect(rAfterPeak).toBeLessThan(rPeak);
  });
  test('20g activity after 5h 6h 7h should be >0.1 ', () => {
    const units = 20;
    const weight = 80;

    const sixHoursActivity = basal(
      [
        {
          units,
          minutesAgo: 60 * 6,
          drug: 'Tou',
        },
      ],
      weight,
    );
    const fiveHoursActivity = basal(
      [
        {
          units,
          minutesAgo: 60 * 6,
          drug: 'Tou',
        },
      ],
      weight,
    );
    const sevenHoursActivity = basal(
      [
        {
          units,
          minutesAgo: 60 * 7,
          drug: 'Tou',
        },
      ],
      weight,
    );

    expect(fiveHoursActivity).toBeGreaterThan(0.01);
    expect(sixHoursActivity).toBeGreaterThan(0.01);
    expect(sevenHoursActivity).toBeGreaterThan(0.01);

    expect(fiveHoursActivity).toMatchSnapshot();
    expect(sixHoursActivity).toMatchSnapshot();
    expect(sevenHoursActivity).toMatchSnapshot();
  });
});
