import {
  PatientInfoCgmsim,
  Sgv,
  NSTreatment,
  Activity,
  MainParams,
} from '../src/Types';
import simulator from '../src/CGMSIMsimulator';
import moment = require('moment');
import { diffOptions, getPngSnapshot, testGenerator } from './inputTest';
import { TypeDateISO } from '../src/TypeDateISO';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

const math = global.Math;

describe('simulator test', () => {
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

  test('start from 274 22:10 + 14u tou +', () => {
    let now = moment(date);

    const entries: Sgv[] = [
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 274,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 274,
      },
      {
        mills: now.add(-0, 'minutes').toDate().getTime(),
        sgv: 274,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 274,
      },
    ];
    now = moment(date);
    const treatments: NSTreatment[] = [
      {
        eventType: 'Announcement',
        created_at: now.toISOString() as TypeDateISO,
        notes: 'Tou 14',
      },
    ];
    const patient: PatientInfoCgmsim = {
      CARBS_ABS_TIME: 360,
      CR: 10,
      DIA: 6,
      ISF: 32,
      TP: 75,
      WEIGHT: 250 / 3,
      AGE: 51,
      GENDER: 'Male',
      TZ: 'Europe/Rome',
    };

    const log = [];
    log.push('Tou 14U  ' + now.toISOString());
    for (let index = 0; index < 60 * 34; ) {
      if (index === 7 * 60 + 30) {
        log.push('Bolus 6U  ' + now.toISOString());
        treatments.push({
          eventType: 'Meal Bolus',
          carbs: 0,
          insulin: 6,
          created_at: now.toISOString() as TypeDateISO,
        });
      }
      const pumpEnabled = false;
      const result = simulator({
        patient: patient,
        entries,
        pumpEnabled,
        treatments,
        profiles: [],
        user: { nsUrl },
      });

      entries.splice(0, 0, {
        mills: now.toDate().getTime(),
        sgv: result.sgv,
      });
      expect(result.deltaMinutes).toBeGreaterThanOrEqual(0);
      expect(result.basalActivity).toBeGreaterThanOrEqual(0);
      expect(result.bolusActivity).toBeGreaterThanOrEqual(0);
      expect(result.carbsActivity).toBeGreaterThanOrEqual(0);
      expect(result.liverActivity).toBeGreaterThanOrEqual(0);
      // console.log('Result ' + result.sgv + ' ' + now.toLocaleString())
      log.push('Result ' + result.sgv + ' ' + now.toISOString());

      now = now.add(5, 'minutes');
      index = index + 5;
      jest.setSystemTime(now.toDate());
    }
    expect(log).toMatchSnapshot();
  });

  test('start from 124 15:00 + 50g tou 14', async () => {
    let now = moment('2022-06-04T13:00:00.000Z');
    jest.setSystemTime(now.toDate());
    const entries: Sgv[] = [
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 124,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 125,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 126,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 127,
      },
    ];
    now = moment('2022-06-04T13:00:00.000Z');
    const treatments: NSTreatment[] = [
      {
        eventType: 'Meal Bolus',
        created_at: '2022-06-04T13:00:00.000Z',
        carbs: 40,
        insulin: 0,
      },
      {
        eventType: 'Announcement',
        created_at: '2022-06-04T01:00:00.000Z',
        notes: 'tou 14',
      },
    ];
    const patient: PatientInfoCgmsim = {
      CARBS_ABS_TIME: 360,
      CR: 10,
      DIA: 6,
      ISF: 32,
      TP: 75,
      WEIGHT: 250 / 3,
      AGE: 51,

      GENDER: 'Male',
      TZ: 'Europe/Helsinki',
    };

    const log = [];
    let lastSgv = 0;
    log.push('Tou 14U  2022-06-04T01:00:00.000Z');
    log.push('Meal 50g  ' + now.toISOString());

    const noiseActivities = [];
    const basalActivities = [];
    const bolusActivities = [];
    const carbsActivities = [];
    const liverActivities = [];
    const sgvS = [];
    const pumpEnabled = false;
    for (let index = 0; index < 60 * 30; ) {
      const result = simulator({
        patient: patient,
        entries,
        treatments,
        pumpEnabled,
        profiles: [],
        user: { nsUrl },
      });
      entries.splice(0, 0, {
        mills: now.toDate().getTime(),
        sgv: result.sgv,
      });
      for (let i = 0; i < 5; i++) {
        sgvS.push(result.sgv);
        basalActivities.push(result.basalActivity * 18 * 5);
        bolusActivities.push(result.bolusActivity * 18 * 5);
        carbsActivities.push(result.carbsActivity * 18 * 5);
        liverActivities.push(result.liverActivity * 18 * 5);
      }
      expect(result.deltaMinutes).toBeGreaterThanOrEqual(0);
      expect(result.basalActivity).toBeGreaterThanOrEqual(0);
      expect(result.bolusActivity).toBeGreaterThanOrEqual(0);
      expect(result.carbsActivity).toBeGreaterThanOrEqual(0);
      expect(result.liverActivity).toBeGreaterThanOrEqual(0);

      // console.log('Result ' + result.sgv + ' ' + now.toLocaleString())
      log.push('Result ' + result.sgv + ' ' + now.toISOString());
      lastSgv = result.sgv;

      now = now.add(5, 'minutes');
      index = index + 5;
      jest.setSystemTime(now.toDate());
    }
    expect(lastSgv).toBeGreaterThanOrEqual(397);
    let data: any = [
      sgvS.map((sgv, index) => ({ key: index * 5, value: sgv })),
    ];
    data.allKeys = noiseActivities.map((sgv, index) => index * 5);
    const png = await getPngSnapshot(
      {
        type: 'multiple',
        values: [
          sgvS.map((sgv, index) => ({
            key: index,
            value: sgv,
            name: 'sgv',
          })),
          bolusActivities.map((val, index) => ({
            key: index,
            value: val,
            name: 'bolus',
          })),
          basalActivities.map((val, index) => ({
            key: index,
            value: val,
            name: 'basal',
          })),
          liverActivities.map((val, index) => ({
            key: index,
            value: val,
            name: 'liver',
          })),
        ],
      },
      { scaleY: 400 },
    );

    expect(png).toMatchImageSnapshot(diffOptions);
  });

  test('start from 250 13:00Z and tou 14u + bolus 8U @14:00', async () => {
    let now = moment('2022-06-04T13:00:00.000Z');
    jest.setSystemTime(now.toDate());
    const entries: Sgv[] = [
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 250,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 250,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 250,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: 250,
      },
    ];
    now = moment('2022-06-04T13:00:00.000Z');
    const treatments: NSTreatment[] = [
      {
        eventType: 'Meal Bolus',
        insulin: 5,
        created_at: '2022-06-04T14:00:00.000Z',
        carbs: null,
      },
      {
        eventType: 'Announcement',
        created_at: '2022-06-04T10:00:00.000Z',
        notes: 'tou 14',
      },
      {
        eventType: 'Announcement',
        created_at: '2022-06-05T10:00:00.000Z',
        notes: 'tou 14',
      },
    ];
    const patient: PatientInfoCgmsim = {
      CARBS_ABS_TIME: 360,
      CR: 10,
      DIA: 6,
      ISF: 32,
      TP: 75,
      WEIGHT: 250 / 3,
      AGE: 51,
      GENDER: 'Male',
      TZ: 'Europe/Helsinki',
    };

    const log = [];
    let lastSgv = 0;
    log.push('Tou 14U  2022-06-04T01:00:00.000Z');

    const noiseActivities = [];
    const basalActivities = [];
    const bolusActivities = [];
    const carbsActivities = [];
    const liverActivities = [];
    const sgvS = [];
    const pumpEnabled = false;

    for (let index = 0; index < 60 * 4; ) {
      const result = simulator({
        patient: patient,
        entries,
        treatments,
        pumpEnabled,
        profiles: [],
        user: { nsUrl },
      });
      entries.splice(0, 0, {
        mills: now.toDate().getTime(),
        sgv: result.sgv,
      });
      sgvS.push(result.sgv);
      expect(result.deltaMinutes).toBeGreaterThanOrEqual(0);
      expect(result.basalActivity).toBeGreaterThanOrEqual(0);
      basalActivities.push(result.basalActivity);
      expect(result.bolusActivity).toBeGreaterThanOrEqual(0);
      bolusActivities.push(result.bolusActivity);
      expect(result.carbsActivity).toBeGreaterThanOrEqual(0);
      carbsActivities.push(result.carbsActivity);
      expect(result.liverActivity).toBeGreaterThanOrEqual(0);
      liverActivities.push(result.liverActivity);

      // console.log('Result ' + result.sgv + ' ' + now.toLocaleString())
      log.push('Result ' + result.sgv + ' ' + now.toISOString());
      lastSgv = result.sgv;

      now = now.add(5, 'minutes');
      index = index + 5;
      jest.setSystemTime(now.toDate());
    }
    expect(sgvS).toMatchSnapshot();
    expect(lastSgv).toMatchSnapshot();
    // let data: any = [
    // 	// noiseActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
    // 	// basalActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
    // 	// bolusActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
    // 	// carbsActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
    // 	// liverActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
    // 	sgvS.map((sgv, index) => ({ key: index * 5, value: sgv })),
    // ]
    // data.allKeys = noiseActivities.map((sgv, index) => index * 5)
    const png = await getPngSnapshot(
      {
        type: 'single',
        values: sgvS.map((sgv, index) => ({ key: index, value: sgv })),
      },
      { scaleY: 400 },
    );

    expect(png).toMatchImageSnapshot(diffOptions);
    return;
  });

  test('start from 100 @13:00Z with deg23 + cor 40mg @14:00 + bolus 5u @14.30', async () => {
    let now = moment('2022-06-04T13:00:00.000Z');
    jest.setSystemTime(now.toDate());
    const startSgv = 100;
    const entries: Sgv[] = [
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: startSgv,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: startSgv,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: startSgv,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: startSgv,
      },
    ];
    const entriesCortisone: Sgv[] = [
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: startSgv,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: startSgv,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: startSgv,
      },
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: startSgv,
      },
    ];
    now = moment('2022-06-04T13:00:00.000Z');
    const treatmentsCortisone: NSTreatment = {
      eventType: 'Announcement',
      created_at: '2022-06-04T10:14:00.000Z',
      notes: 'cor 40',
    };
    const treatmentsBolus: NSTreatment = {
      eventType: 'Meal Bolus',
      insulin: 5,
      created_at: '2022-06-04T14:30:00.000Z',
      carbs: null,
    };
    const treatments: NSTreatment[] = [
      {
        eventType: 'Announcement',
        created_at: '2022-06-04T10:00:00.000Z',
        notes: 'deg 23',
      },
      {
        eventType: 'Announcement',
        created_at: '2022-06-05T10:00:00.000Z',
        notes: 'deg 23',
      },
    ];
    const patient: PatientInfoCgmsim = {
      CARBS_ABS_TIME: 360,
      CR: 10,
      DIA: 6,
      ISF: 32,
      TP: 75,
      WEIGHT: 250 / 3,
      AGE: 51,
      GENDER: 'Male',
      TZ: 'Europe/Rome',
    };

    const log = [];
    let lastSgv = 0;
    log.push('Cor 40mg  2022-06-04T01:00:00.000Z');
    const pumpEnabled = false;
    const sgvSCortisone = [];
    const sgvS = [];
    for (let index = 0; index < 60 * 24; ) {
      const resultCortisone = simulator({
        patient: patient,
        entries: entriesCortisone,
        pumpEnabled,
        treatments: [...treatments, treatmentsCortisone, treatmentsBolus],
        profiles: [],
        user: { nsUrl },
      });
      entriesCortisone.splice(0, 0, {
        mills: now.toDate().getTime(),
        sgv: resultCortisone.sgv,
      });
      for (let i = 0; i < 5; i++) {
        sgvSCortisone.push(resultCortisone.sgv);
      }

      const result = simulator({
        patient: patient,
        entries,
        treatments: [...treatments],
        profiles: [],
        pumpEnabled,
        user: { nsUrl },
      });
      entries.splice(0, 0, {
        mills: now.toDate().getTime(),
        sgv: result.sgv,
      });
      for (let i = 0; i < 5; i++) {
        sgvS.push(result.sgv);
      }

      now = now.add(5, 'minutes');
      index = index + 5;
      jest.setSystemTime(now.toDate());
    }
    expect(sgvSCortisone).toMatchSnapshot();
    expect(lastSgv).toMatchSnapshot();
    // let data: any = [
    // 	// noiseActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
    // 	// basalActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
    // 	// bolusActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
    // 	// carbsActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
    // 	// liverActivities.map((sgv, index) => ({ key: index*5, value: sgv })),
    // 	sgvS.map((sgv, index) => ({ key: index * 5, value: sgv })),
    // ]
    // data.allKeys = noiseActivities.map((sgv, index) => index * 5)
    const png = await getPngSnapshot(
      {
        type: 'multiple',
        values: [
          sgvSCortisone.map((sgv, index) => ({ key: index, value: sgv })),
          sgvS.map((sgv, index) => ({ key: index, value: sgv })),
        ],
      },
      { scaleY: 400 },
    );

    expect(png).toMatchImageSnapshot(diffOptions);
    return;
  });
});

describe('Simulator', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern'); // Use modern fake timers
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers after each test
  });

  test('throws an error when treatments are not provided', () => {
    let now = moment('2022-06-04T13:00:00.000Z');
    jest.setSystemTime(now.toDate());
    const startSgv = 100;
    const patient: PatientInfoCgmsim = {
      CARBS_ABS_TIME: 360,
      CR: 10,
      DIA: 6,
      ISF: 32,
      TP: 75,
      WEIGHT: 250 / 3,
      AGE: 51,
      GENDER: 'Male',
      TZ: 'Europe/Helsinki',
    };
    // Arrange
    const paramsWithoutTreatments = {
      patient,
      entries: [
        {
          mills: now.add(-5, 'minutes').toDate().getTime(),
          sgv: startSgv,
        },
        {
          mills: now.add(-5, 'minutes').toDate().getTime(),
          sgv: startSgv,
        },
        {
          mills: now.add(-5, 'minutes').toDate().getTime(),
          sgv: startSgv,
        },
        {
          mills: now.add(-5, 'minutes').toDate().getTime(),
          sgv: startSgv,
        },
      ],
      profiles: [],
      pumpEnabled: true,
      activities: [],
      user: { nsUrl: 'example-nsUrl' },
      treatments: null,
    };

    // Act
    jest.advanceTimersByTime(0); // Manually advance timers
    jest.runAllTimers();

    // Assert
    expect(() => simulator(paramsWithoutTreatments)).toThrowError(
      'treatments is null',
    );
  });
});

describe('Simulator', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern'); // Use modern fake timers
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers after each test
  });

  test('throws an error when profiles are not provided', () => {
    let now = moment('2022-06-04T13:00:00.000Z');
    jest.setSystemTime(now.toDate());
    const startSgv = 100;

    const patient: PatientInfoCgmsim = {
      CARBS_ABS_TIME: 360,
      CR: 10,
      DIA: 6,
      ISF: 32,
      TP: 75,
      WEIGHT: 250 / 3,
      AGE: 51,
      GENDER: 'Male',
      TZ: 'Europe/Helsinki',
    };
    // Arrange
    const paramsWithoutProfiles = {
      patient,
      entries: [
        {
          mills: now.add(-5, 'minutes').toDate().getTime(),
          sgv: startSgv,
        },
        {
          mills: now.add(-5, 'minutes').toDate().getTime(),
          sgv: startSgv,
        },
        {
          mills: now.add(-5, 'minutes').toDate().getTime(),
          sgv: startSgv,
        },
        {
          mills: now.add(-5, 'minutes').toDate().getTime(),
          sgv: startSgv,
        },
      ],
      profiles: null,
      pumpEnabled: true,
      activities: [],
      user: { nsUrl: 'example-nsUrl' },
      treatments: [],
    };

    // Act
    jest.advanceTimersByTime(0); // Manually advance timers
    jest.runAllTimers();

    // Assert
    expect(() => simulator(paramsWithoutProfiles)).toThrowError(
      'profiles is null',
    );
  });
});

describe('Simulator', () => {
  test('throws an error when isfActivityDependent is less than 9', () => {
    // Arrange
    const patient: PatientInfoCgmsim = {
      CARBS_ABS_TIME: 360,
      CR: 10,
      DIA: 6,
      ISF: 8,
      TP: 75,
      WEIGHT: 250 / 3,
      AGE: 51,
      GENDER: 'Male',
      TZ: 'Europe/Helsinki',
    };
    const paramsWithLowIsf = {
      patient,
      entries: [],
      profiles: [],
      pumpEnabled: true,
      activities: [],
      user: { nsUrl: 'example-nsUrl' },
      treatments: [],
    };

    // Act & Assert
    expect(() => simulator(paramsWithLowIsf)).toThrowError(
      'Isf must be greater than or equal to 9',
    );
  });
});
