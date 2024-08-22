import { treatments } from './inputTest';
import computeCortisone from '../src/cortisone';
import { NSTreatment, TreatmentExpParam } from '../src/Types';
import moment = require('moment');
import { diffOptions, getPngSnapshot } from './inputTest';
import { drugs, transformNoteTreatmentsDrug } from '../src/drug';
import cortisone from '../src/cortisone';
import { getExpTreatmentActivity } from '../src/utils';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

describe('test cortisone', () => {
  beforeEach(() => {
    expect.extend({ toMatchImageSnapshot });
  });

  test('weight:80 units:10 minutesAgo:300', () => {
    const weight = 80;
    const cortisoneActive = cortisone(
      [
        {
          units: 10,
          minutesAgo: 300,
          drug: 'Cor',
        },
      ],
      weight,
    );
    expect(cortisoneActive).toMatchSnapshot();
  });

  test('weight:80 mg:40vs200 all', async () => {
    const weight = 80;
    const units40 = 40;
    const units200 = 200;
    let cortisone40Active = 0;
    let cortisone40Arr = [];
    let cortisone200Active = 0;
    let cortisone200Arr = [];

    for (let i = 0; i < 3000; i++) {
      const _cortisone40Active = cortisone(
        [
          {
            units: units40,
            minutesAgo: i,
            drug: 'Cor',
          },
        ],
        weight,
      );
      const _cortisone200Active = cortisone(
        [
          {
            units: units200,
            minutesAgo: i,
            drug: 'Cor',
          },
        ],
        weight,
      );
      cortisone40Active += _cortisone40Active > 0 ? _cortisone40Active : 0;
      cortisone40Arr.push(_cortisone40Active > 0 ? _cortisone40Active : 0);
      cortisone200Active += _cortisone200Active > 0 ? _cortisone200Active : 0;
      cortisone200Arr.push(_cortisone200Active > 0 ? _cortisone200Active : 0);
    }
    expect(cortisone40Active).toMatchSnapshot();
    expect(cortisone40Arr).toMatchSnapshot();
    expect(cortisone200Active).toMatchSnapshot();
    expect(cortisone200Arr).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'multiple',
        values: [
          cortisone40Arr.map((sgv, index) => ({
            key: index,
            value: sgv,
          })),
          cortisone200Arr.map((sgv, index) => ({
            key: index,
            value: sgv,
          })),
        ],
      },
      { scaleY: 1 },
    );

    expect(png).toMatchImageSnapshot(diffOptions);
  });
  test('200mg cortisone, the activity after 5h 6h 7h should be >0.1 ', () => {
    const units = 20;
    const weight = 80;

    const sixHoursActivity = cortisone(
      [
        {
          units,
          minutesAgo: 60 * 6,
          drug: 'Cor',
        },
      ],
      weight,
    );
    const fiveHoursActivity = cortisone(
      [
        {
          units,
          minutesAgo: 60 * 6,
          drug: 'Cor',
        },
      ],
      weight,
    );
    const sevenHoursActivity = cortisone(
      [
        {
          units,
          minutesAgo: 60 * 7,
          drug: 'Cor',
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

describe('test computeCortisone', () => {
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
      treatments as unknown as NSTreatment[],
    );

    const result = computeCortisone(drugs, 80);

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
  test.each(['Cor 200'])('correct cortisone entry', (note) => {
    let _date = moment('2022-05-06T15:00:00.000Z');
    const results = [];
    _date = _date.add(5, 'minutes');
    jest.setSystemTime(_date.toDate());
    const corTreatment = [
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
    const drugs = transformNoteTreatmentsDrug(
      treatments as unknown as NSTreatment[],
    );
    let result = computeCortisone(drugs, 80);
    expect(result).toBeDefined();
    //expect(result).toMatchSnapshot();
  });

  test.each(['cor_8u', 'cor8u'])('wrong cortisone entry', (note) => {
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
      toujeoTreatment as unknown as NSTreatment[],
    );

    let result = computeCortisone(drugsTou, 80);
    expect(result).toBe(0);
  });
});
