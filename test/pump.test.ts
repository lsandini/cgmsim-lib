import moment = require('moment');
import pump from '../src/pump';

const dia = 6;
const peak = 90;

const dynamicBasal = [
  {
    time: '00:00',
    value: 1,
  },
  {
    time: '12:00',
    value: 1.2,
  },
  {
    time: '14:00',
    value: 0.8,
  },
  {
    time: '18:00',
    value: 1,
  },
];
const profileSwitch = [
  {
    eventType: 'Profile Switch',
    percentage: 130,
    duration: 30,
    created_at: '2022-05-06T13:00:00.000Z',
    profileJson: JSON.stringify({
      basal: dynamicBasal,
    }),
  },
];
const tmpBasal = [
  {
    eventType: 'Temp Basal',
    absolute: 0,
    duration: 60,
    created_at: '2022-05-06T11:00:00.000Z',
  },
  {
    eventType: 'Temp Basal',
    absolute: 1.2,
    duration: 30,
    created_at: '2022-05-06T16:00:00.000Z',
  },
];
describe('test pump', () => {
  const date = new Date('2022-05-07T11:20:00Z');

  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(date);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('no profile', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());

    const result = pump([], [], dia, peak);

    expect(result).toBe(0);
  });
  test('static basal in profile and no treatments', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());

    const result = pump(
      [],
      [
        {
          startDate: '2000-01-01T00:00:00.000Z',
          defaultProfile: 'Default',
          store: {
            Default: {
              basal: 0.7,
            },
          },
        },
      ],
      dia,
      peak
    );

    expect(result).toMatchSnapshot();
  });
  test('static basal in profile and temp basal 0', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments = [
      {
        eventType: 'Temp Basal',
        absolute: 0,
        duration: 600,
        created_at: '2022-05-06T10:31:00.000Z',
      },
    ];
    const result = pump(
      treatments,
      [
        {
          startDate: '2000-01-01T00:00:00.000Z',
          defaultProfile: 'Default',
          store: {
            Default: {
              basal: 0.7,
            },
          },
        },
      ],
      dia,
      peak
    );

    expect(result).toBe(0);
  });

  test('static basal in profile and 2 different temp basal', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments = tmpBasal;
    const result = pump(
      treatments,
      [
        {
          startDate: '2000-01-01T00:00:00.000Z',
          defaultProfile: 'Default',
          store: {
            Default: {
              basal: 0.7,
            },
          },
        },
      ],
      dia,
      peak
    );

    expect(result).toMatchSnapshot();
  });
  test('dynamic  basal in profile and no temp basal', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments = [];
    const result = pump(
      treatments,
      [
        {
          startDate: '2000-01-01T00:00:00.000Z',
          defaultProfile: 'Default',
          store: {
            Default: {
              basal: dynamicBasal,
            },
          },
        },
      ],
      dia,
      peak
    );

    expect(result).toMatchSnapshot();
  });
  test('dynamic  basal in profile, no temp basal and profile switch', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments = profileSwitch;
    const result = pump(
      treatments,
      [
        {
          startDate: '2000-01-01T00:00:00.000Z',
          defaultProfile: 'Default',
          store: {
            Default: {
              basal: dynamicBasal,
            },
          },
        },
      ],
      dia,
      peak
    );

    expect(result).toMatchSnapshot();
  });
  test('dynamic basal in profile and temp basal', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments = tmpBasal;

    const result = pump(
      treatments,
      [
        {
          startDate: '2000-01-01T00:00:00.000Z',
          defaultProfile: 'Default',
          store: {
            Default: {
              basal: dynamicBasal,
            },
          },
        },
      ],
      dia,
      peak
    );

    expect(result).toMatchSnapshot();
  });
});
