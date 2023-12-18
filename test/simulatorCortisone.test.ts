import { diffOptions, getPngSnapshot, testGenerator } from './inputTest';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

const math = global.Math;

describe('simulatorCortisone test', () => {
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

  test('start from 150 @12:00Z with deg22(-4h) + cor 40mg(+1h) + bolus 3u(+3h)', async () => {
    const result = testGenerator(150, 48, {
      treatments: [
        {
          type: 'COR',
          minutes: 60,
          units: 40,
        },
        {
          type: 'DEG',
          minutes: -(4 * 60),
          units: 22,
        },
        {
          type: 'DEG',
          minutes: -(4 * 60) + 24 * 60,
          units: 22,
        },
        {
          type: 'DEG',
          minutes: -(4 * 60) + 24 * 60 * 2,
          units: 22,
        },
      ],
      boluses: [
        {
          insulin: 5,
          minutes: 180,
        },
        {
          insulin: 5,
          minutes: 600,
        },
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
