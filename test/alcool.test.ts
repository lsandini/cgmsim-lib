import alcohol from '../src/alcohol';
import { diffOptions, getPngSnapshot } from './inputTest';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

describe('test alcohol', () => {
  beforeEach(() => {
    expect.extend({ toMatchImageSnapshot });
  });

  test('weight:80 Male alc:1 minutesAgo:300', () => {
    const weight = 80;
    const alcoolActivity = alcohol(
      [
        {
          units: 1,
          minutesAgo: 300,
          drug: 'Alc',
        },
      ],
      weight,
      'Male',
    );
    expect(alcoolActivity).toMatchSnapshot();
  });
  test('weight:80 Male alc:2 minutesAgo:180 should be 1', () => {
    const weight = 80;
    const alcoolActivity = alcohol(
      [
        {
          units: 2,
          minutesAgo: 180,
          drug: 'ALC',
        },
      ],
      weight,
      'Male',
    );
    expect(alcoolActivity).toBe(1);
  });
  test('weight:80 Male alc:1 all', async () => {
    const weight = 80;
    let alcoolActivity = 0;
    let alcoholArr = [];

    for (let i = 0; i < 2000; i++) {
      const _alcoolActivity = alcohol(
        [
          {
            units: 1,
            minutesAgo: i,
            drug: 'Alc',
          },
        ],
        weight,
        'Male',
      );
      alcoolActivity += _alcoolActivity > 0 ? _alcoolActivity : 0;
      alcoholArr.push(_alcoolActivity > 0 ? _alcoolActivity : 0);
    }
    expect(1 - alcoolActivity).toMatchSnapshot();
    expect(alcoholArr).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'single',
        values: alcoholArr.map((sgv, index) => ({
          key: index,
          value: sgv,
        })),
      },
      { scaleY: 1 },
    );

    expect(png).toMatchImageSnapshot(diffOptions);
  });
});
