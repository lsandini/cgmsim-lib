import moment = require('moment');
import pump, { calculatePumpIOB } from '../src/pump';
import { NSTreatment } from '../src/Types';

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
const profileSwitch: NSTreatment[] = [
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
const temporaryOverride: NSTreatment[] = [
  {
    eventType: 'Temporary Override',
    insulinNeedsScaleFactor: 1.3,
    duration: 30,
    created_at: '2022-05-06T13:00:00.000Z',
  },
];
const tmpBasal: NSTreatment[] = [
  {
    eventType: 'Temp Basal',
    rate: 0,
    duration: 60,
    durationInMilliseconds: 60 * (60 * 1000),
    created_at: '2022-05-06T11:00:00.000Z',
  },
  {
    eventType: 'Temp Basal',
    rate: 1.2,
    duration: 30,
    durationInMilliseconds: 30 * (60 * 1000),
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
    const iob = calculatePumpIOB([], [], dia, peak);

    expect(result).toBe(0);
    expect(iob).toBe(0);
  });
  test('static basal in profile and no treatments', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());

    const profiles = [
      {
        startDate: '2000-01-01T00:00:00.000Z',
        defaultProfile: 'Default',
        store: {
          Default: {
            basal: 0.7,
          },
        },
      },
    ];
    const result = pump([], profiles, dia, peak);
    const iob = calculatePumpIOB([], profiles, dia, peak);

    expect(result).toMatchSnapshot();
    expect(iob).toMatchSnapshot();
  });
  test('static basal in profile and temp basal 0', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments: NSTreatment[] = [
      {
        eventType: 'Temp Basal',
        rate: 0,
        duration: 600,
        durationInMilliseconds: 600 * (60 * 1000),
        created_at: '2022-05-06T10:31:00.000Z',
      },
    ];
    const profiles = [
      {
        startDate: '2000-01-01T00:00:00.000Z',
        defaultProfile: 'Default',
        store: {
          Default: {
            basal: 0.7,
          },
        },
      },
    ];
    const result = pump(treatments, profiles, dia, peak);
    const iob = calculatePumpIOB(treatments, profiles, dia, peak);

    expect(result).toBe(0);
    expect(iob).toMatchSnapshot();
  });

  test('static basal in profile and 2 different temp basal', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments = tmpBasal;
    const profiles = [
      {
        startDate: '2000-01-01T00:00:00.000Z',
        defaultProfile: 'Default',
        store: {
          Default: {
            basal: 0.7,
          },
        },
      },
    ];
    const result = pump(treatments, profiles, dia, peak);
    const iob = calculatePumpIOB(treatments, profiles, dia, peak);

    expect(result).toMatchSnapshot();
    expect(iob).toMatchSnapshot();
  });

  test('dynamic  basal in profile and no temp basal', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments = [];
    const profiles = [
      {
        startDate: '2000-01-01T00:00:00.000Z',
        defaultProfile: 'Default',
        store: {
          Default: {
            basal: dynamicBasal,
          },
        },
      },
    ];
    const result = pump(treatments, profiles, dia, peak);
    const iob = calculatePumpIOB(treatments, profiles, dia, peak);

    expect(result).toMatchSnapshot();
    expect(iob).toMatchSnapshot();
  });
  test('dynamic  basal in profile, no temp basal and profile switch', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments = profileSwitch;
    const profiles = [
      {
        startDate: '2000-01-01T00:00:00.000Z',
        defaultProfile: 'Default',
        store: {
          Default: {
            basal: dynamicBasal,
          },
        },
      },
    ];
    const result = pump(treatments, profiles, dia, peak);
    const iob = calculatePumpIOB(treatments, profiles, dia, peak);

    expect(result).toMatchSnapshot();
    expect(iob).toMatchSnapshot();
  });
  test('dynamic  basal in profile, no temp basal and temporary override', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments = temporaryOverride;
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
      peak,
    );

    expect(result).toMatchSnapshot();
  });
  test('dynamic basal in profile and temp basal', () => {
    let _date = moment('2022-05-06T16:30:00.000Z');
    jest.setSystemTime(_date.toDate());
    const treatments = tmpBasal;

    const profiles = [
      {
        startDate: '2000-01-01T00:00:00.000Z',
        defaultProfile: 'Default',
        store: {
          Default: {
            basal: dynamicBasal,
          },
        },
      },
    ];
    const result = pump(treatments, profiles, dia, peak);
    const iob = calculatePumpIOB(treatments, profiles, dia, peak);

    expect(result).toMatchSnapshot();
    expect(iob).toMatchSnapshot();
  });
});
