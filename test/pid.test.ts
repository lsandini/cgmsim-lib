import { PatientInfoCgmsim, Sgv, NSTreatment, Activity, MainParams } from '../src/Types';
import simulator from '../src/CGMSIMsimulator';
import moment = require('moment');
import { diffOptions, getPngSnapshot, testGenerator } from './inputTest';
import { TypeDateISO } from '../src/TypeDateISO';
import { calculatePID } from '../src/utils';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

const math = global.Math;

describe('pid test', () => {
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

  test('start from 180 @13:00Z', async () => {
    let now = moment('2022-06-04T13:00:00.000Z');
    jest.setSystemTime(now.toDate());
    const startSgv = 180;
    const entries: Sgv[] = [
      {
        mills: now.add(-5, 'minutes').toDate().getTime(),
        sgv: startSgv,
      }
    ];
    now = moment('2022-06-04T13:00:00.000Z');
    const patient: PatientInfoCgmsim = {
      CARBS_ABS_TIME: 360,
      CR: 10,
      DIA: 3,
      ISF: 36,
      TP: 55,
      WEIGHT: 250 / 3,
      AGE: 51,
      GENDER: 'Male',
      TZ: 'UTC',
    };

    let lastSgv = 0;
    const pumpEnabled = true;
    const sgvS = [];
    const TempBasalTreatment = [];
    for (let index = 0; index < 60 * 24; ) {
      const result = simulator({
        patient: patient,
        entries,
        treatments: [...TempBasalTreatment],
        profiles: [
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
        pumpEnabled,
        user: { nsUrl },
      });

      entries.unshift({
        mills: now.valueOf(),
        sgv: result.sgv,
      });
      let resultPID;
      if (entries.length > 36) {
        resultPID = calculatePID(entries, { KP: 2.5, KI: 0.5, KD: 0.7, TDI: 60 });
        TempBasalTreatment.push({
          eventType: 'Temp Basal',
          rate: resultPID.rate,
          absolute: resultPID.rate,
          duration: 5,
          durationInMilliseconds: 5 * (60 * 1000),
          created_at: moment(now).toISOString(),
        });
      }

      for (let i = 0; i < 5; i++) {
        sgvS.push(result.sgv);
      }

      now = now.add(5, 'minutes');
      index = index + 5;
      jest.setSystemTime(now.toDate());
      lastSgv = result.sgv;
    }
    expect(lastSgv).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'multiple',
        values: [sgvS.map((sgv, index) => ({ key: index, value: sgv }))],
      },
      { scaleY: 400 },
    );

    expect(png).toMatchImageSnapshot(diffOptions);
    return;
  });
});
