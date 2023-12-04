import { treatments, toujeoTreatments, glargineTreatments } from './inputTest';
import computeBasalIOB from '../src/basal';
import { Treatment } from '../src/Types';
import { oldComputeBasal } from '../old/oldComputeBasal';
import oldToujeoRun from '../old/oldToujeo';
import oldGlargine from '../old/oldGlargine';
import moment = require('moment');
import { transformNoteTreatmentsDrug } from '../src/drug';

describe('test computeBasalIOB', () => {
  const date = new Date('2022-05-07T11:20:00Z');
  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(date);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('detection drug', () => {
    const drugs = transformNoteTreatmentsDrug(
      treatments as unknown as Treatment[]
    );
    const result = computeBasalIOB(drugs, 80);

    expect(result).toMatchSnapshot();
  });
});

describe('check insert value string', () => {
  const date = new Date('2022-05-07T11:20:00Z');

  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(date);
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  test.each([
    // 'tou8',
    // 'tou8 ',
    // 'tou 8',
    // 'tou  8',
    // 'tou_8',
    // 'tou 8i',
    // 'tou8 i',
    // 'tou 8i',
    // 'tou  8i',
    'Toujeo 8',
  ])('correct toujeo entry', (note) => {
    let _date = moment('2022-05-06T15:00:00.000Z');
    const results = [];
    _date = _date.add(5, 'minutes');
    jest.setSystemTime(_date.toDate());
    const toujeoTreatment = [
      {
        _id: '627548f4a3dc0ad67616ac95',
        eventType: 'Announcement',
        notes: note,
        utcOffset: 0,
        isAnnouncement: true,
        protein: '',
        fat: '',
        duration: 0,
        profile: '',
        enteredBy: 'Boss',
        created_at: '2022-05-06T14:00:00.000Z',
        carbs: null,
        insulin: null,
      },
    ];
    const drugsTou = transformNoteTreatmentsDrug(
      toujeoTreatment as unknown as Treatment[]
    );
    let result = computeBasalIOB(drugsTou, 80);
    expect(result).toBeDefined();
    //expect(result).toMatchSnapshot();
  });

  test.each(['tou_8i', 'tou8i'])('wrong toujeo entry', (note) => {
    let _date = moment('2022-05-06T15:00:00.000Z');
    const results = [];
    _date = _date.add(5, 'minutes');
    jest.setSystemTime(_date.toDate());
    const toujeoTreatment = [
      {
        _id: '627548f4a3dc0ad67616ac95',
        eventType: 'Announcement',
        notes: note,
        utcOffset: 0,
        isAnnouncement: true,
        protein: '',
        fat: '',
        duration: 0,
        profile: '',
        enteredBy: 'Boss',
        created_at: '2022-05-06T14:00:00.000Z',
        carbs: null,
        insulin: null,
      },
    ];
    const drugsTou = transformNoteTreatmentsDrug(
      toujeoTreatment as unknown as Treatment[]
    );
    let result = computeBasalIOB(drugsTou, 80);
    expect(result).toBe(0);
    //expect(result).toMatchSnapshot();
  });
});
describe('test computeBasalIOB comparing old cgmsim', () => {
  const date = new Date('2022-05-07T11:20:00Z');

  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(date);
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  test('compare old toujeo', () => {
    let _date = moment('2022-05-06T15:00:00.000Z');
    for (let i = 0; i < 240; i++) {
      _date = _date.add(5, 'minutes');
      jest.setSystemTime(_date.toDate());

      const { lastDET, lastGLA, lastTOU, lastDEG } = oldComputeBasal({
        entries: toujeoTreatments,
      });

      let oldActivity = oldToujeoRun(80, lastTOU);
      const drugsTou = transformNoteTreatmentsDrug(
        toujeoTreatments as unknown as Treatment[]
      );
      let result = computeBasalIOB(drugsTou, 80);
      const ROUND = 100000000;
      result = Math.round(result * ROUND) / ROUND;
      oldActivity = Math.max(Math.round(oldActivity * ROUND) / ROUND, 0);
      // console.log('\x1b[32m', '#####toujeo (after ' + i * 5 + 'minutes)' + _date.toISOString(), result, oldActivity, '\x1b[0m')
      //first15minutes
      if (i <= 1) {
        expect(result).toBeLessThan(oldActivity);
      } else {
        expect(result).toBe(oldActivity);
      }
      expect(result).toMatchSnapshot();
    }
  });

  test('double toujeo injection', () => {
    let _date = moment('2022-05-06T15:00:00.000Z');
    const results = [];
    for (let i = 0; i < 1024; i++) {
      _date = _date.add(5, 'minutes');
      jest.setSystemTime(_date.toDate());
      const doubleToujeoTreatments = [
        ...toujeoTreatments,
        {
          _id: '627548f4a3dc0ad67616ac95',
          eventType: 'Announcement',
          notes: 'tou 14',
          utcOffset: 0,
          isAnnouncement: true,
          protein: '',
          fat: '',
          duration: 0,
          profile: '',
          enteredBy: 'Boss',
          created_at: '2022-05-07T15:00:00.000Z',
          carbs: null,
          insulin: null,
        },
      ];
      const { lastDET, lastGLA, lastTOU, lastDEG } = oldComputeBasal({
        entries: doubleToujeoTreatments,
      });

      let oldActivity = oldToujeoRun(80, lastTOU);
      const drugsDoubleTou = transformNoteTreatmentsDrug(
        doubleToujeoTreatments as unknown as Treatment[]
      );
      let result = computeBasalIOB(drugsDoubleTou, 80);
      const ROUND = 100000000;
      result = Math.round(result * ROUND) / ROUND;
      oldActivity = Math.max(Math.round(oldActivity * ROUND) / ROUND, 0);
      // console.log('\x1b[32m', '#####toujeo (after ' + i * 5 + 'minutes)' + _date.toISOString(), result, oldActivity, '\x1b[0m')
      // expect(result).toBe(oldActivity);
      expect(result).toMatchSnapshot();
      if (i > 420) {
        expect(result).toBeLessThanOrEqual(results[results.length - 1]);
      }
      results.push(result);
    }
  });

  test('compare old glargine', async () => {
    let _date = moment('2022-05-06T15:00:00.000Z');
    const p = [];
    for (let i = 0; i < 30; i++) {
      _date = _date.add(5, 'minutes');
      jest.setSystemTime(_date.toDate());

      const { lastDET, lastGLA, lastTOU, lastDEG } = oldComputeBasal({
        entries: glargineTreatments,
      });

      let oldActivity = oldGlargine(80, lastGLA);
      const drugsGla = transformNoteTreatmentsDrug(
        glargineTreatments as unknown as Treatment[]
      );
      let result = computeBasalIOB(drugsGla, 80);
      const ROUND = 100000000;
      result = Math.round(result * ROUND) / ROUND;
      oldActivity = Math.round(oldActivity * ROUND) / ROUND;
      // console.log('activity ' + _date.toISOString(), result, oldActivity)
      //first15minutes
      if (i <= 1) {
        expect(result).toBeLessThan(oldActivity);
      } else {
        expect(result).toBe(oldActivity);
      }
      expect(result).toMatchSnapshot();
      // console.log('\x1b[32m', '#####GLARGINE ' + _date.toISOString(), result, oldActivity, '\x1b[0m')
      // p.push(oldActivity);
      // await writeFile('./files/oldGLA.json', JSON.stringify(p));
    }
    // console.log(p)
  });
});
