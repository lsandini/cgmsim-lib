import { diffOptions, getPngSnapshot } from './inputTest';
import basal from '../src/basal';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

describe('test degludec', () => {
  const weight = 80;
  beforeEach(() => {
    expect.extend({ toMatchImageSnapshot });
  });
  test('ins:30 minutesAgo:300', () => {
    const insulinActive = basal(
      [
        {
          units: 30,
          minutesAgo: 300,
          drug: 'DEG',
        },
      ],
      weight,
    );
    expect(insulinActive).toMatchSnapshot();
  });

  test('ins:30 hoursAgo: 44', () => {
    const insulinActive = basal(
      [
        {
          units: 30,
          minutesAgo: 44 * 60,
          drug: 'DEG',
        },
      ],
      weight,
    );
    expect(insulinActive).toBe(0);
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
            drug: 'DEG',
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

    const r5 = basal(
      [
        {
          units,
          minutesAgo: 5,
          drug: 'DEG',
        },
      ],
      weight,
    );

    const r40 = basal(
      [
        {
          units,
          minutesAgo: 40,
          drug: 'DEG',
        },
      ],
      weight,
    );

    expect(r5).toBeLessThan(r40);
  });
  test('peak has the greatest activity', () => {
    const units = 20;
    const degludecPeakHours = 42 / 3;
    const rBeforePeak = basal(
      [
        {
          units,
          minutesAgo: degludecPeakHours * 60 + 10,
          drug: 'DEG',
        },
      ],
      weight,
    );

    const rPeak = basal(
      [
        {
          units,
          minutesAgo: degludecPeakHours * 60,
          drug: 'DEG',
        },
      ],
      weight,
    );

    const rAfterPeak = basal(
      [
        {
          units,
          minutesAgo: degludecPeakHours * 60 - 10,
          drug: 'DEG',
        },
      ],
      weight,
    );

    expect(rBeforePeak).toBeLessThan(rPeak);
    expect(rAfterPeak).toBeLessThan(rPeak);
  });
});
