import { diffOptions, getPngSnapshot, testGenerator } from './inputTest';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

const math = global.Math;

describe('simulatorAlcohol test', () => {
  let date;
  const nsUrl = 'testUser';

  beforeEach(() => {
    date = new Date('2022-05-29T22:10:00Z');
    expect.extend({ toMatchImageSnapshot });

    jest.useFakeTimers('modern');
    jest.setSystemTime(date);
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.5;
    global.Math = mockMath;
  });

  afterAll(() => {
    jest.useRealTimers();
    global.Math = math;
  });

  test('start from 100 @12:00Z with deg23(-4h) + alc 2U(+1h)', async () => {
    const result = testGenerator(100, 24, {
      treatments: [
        {
          type: 'ALC',
          minutes: 60,
          units: 2,
        },
        {
          type: 'DEG',
          minutes: -(4 * 60),
          units: 23,
        },
        {
          type: 'DEG',
          minutes: 20 * 60,
          units: 23,
        },
      ],
      boluses: [
      ],
      carbs: [],
    });

    expect(result.sgvS).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'multiple',
        values: [
          result.sgvS.map((value, index) => ({
            key: index * 5,
            value: value,
            name: 'sgvS',
          })),
          result.carbsActivities.map((value, index) => ({
            key: index * 5,
            value: value * 10,
            name: 'carbsActivities',
          })),
          result.basalActivities.map((value, index) => ({
            key: index * 5,
            value: value * 10,
            name: 'basalActivities',
          })),
          result.bolusActivities.map((value, index) => ({
            key: index * 5,
            value: value * 10,
            name: 'bolusActivities',
          })),
          result.cortisoneActivity.map((value, index) => ({
            key: index * 5,
            value: value * 10,
            name: 'cortisoneActivity',
          })),
          result.alcoholActivity.map((value, index) => ({
            key: index * 5,
            value: value * 10,
            name: 'alcoholActivity',
          })),
          result.liverActivities.map((value, index) => ({
            key: index * 5,
            value: value * 10,
            name: 'liverActivities',
          })),
          result.activityFactor.map((value, index) => ({
            key: index * 5,
            value: value * 10,
            name: 'activityFactor',
          })),
          result.isfDynamicFactor.map((value, index) => ({
            key: index * 5,
            value: value,
            name: 'isfDynamicFactor',
          })),
        ],
      },
      { scaleY: 400 },
    );

    expect(png).toMatchImageSnapshot(diffOptions);
    return;
  });
});
