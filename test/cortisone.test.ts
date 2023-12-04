import { treatments } from './inputTest';
import computeCortisone from '../src/cortisone';
import { Treatment, TreatmentDelta, TreatmentDrug } from '../src/Types';
import moment = require('moment');
import {
  computeCortisoneActivity,
  durationCortisone,
  peakCortisone,
} from '../src/cortisone';
import { diffOptions, getPngSnapshot } from './inputTest';
import { transformNoteTreatmentsDrug } from '../src/drug';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

describe('test cortisone', () => {
  beforeEach(() => {
    expect.extend({ toMatchImageSnapshot });
  });

  type MockTreatment = {
    units: TreatmentDelta['units'];
    minutesAgo: TreatmentDelta['minutesAgo'];
  };

  const cortisone = (weight, treatments: MockTreatment[]): number => {
    const cortisoneT: TreatmentDelta[] = treatments.map((e) => {
      const duration = durationCortisone.COR(e.units, weight);
      const peak = peakCortisone.COR(duration);
      return {
        ...e,
        duration,
        peak,
      };
    });
    return computeCortisoneActivity(cortisoneT);
  };
  test('weight:80 units:10 minutesAgo:300', () => {
    const weight = 80;
    const cortisoneActive = cortisone(weight, [
      {
        units: 10,
        minutesAgo: 300,
      },
    ]);
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
      const _cortisone40Active = cortisone(weight, [
        {
          units: units40,
          minutesAgo: i,
        },
      ]);
      const _cortisone200Active = cortisone(weight, [
        {
          units: units200,
          minutesAgo: i,
        },
      ]);
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
      { scaleY: 1 }
    );

    expect(png).toMatchImageSnapshot(diffOptions);
  });

  //   test('cortisone 5 min ago are less active then 40 min ago', () => {
  //     const units = 10;
  //     const weight = 80;

  //     const r5 = cortisone(weight, [
  //       {
  //         units,
  //         minutesAgo: 5,
  //       },
  //     ]);
  //     const r40 = cortisone(weight, [
  //       {
  //         units,
  //         minutesAgo: 40,
  //       },
  //     ]);
  //     expect(r5).toBeLessThan(r40);
  //   });
  //   test('peak has the greatest activity', () => {
  //     const units = 20;
  //     const weight = 80;

  //     const toujeoPeakHours = (24 + (14 * units) / weight) / 2.5;

  //     const rBeforePeak = cortisone(weight, [
  //       {
  //         units,
  //         minutesAgo: toujeoPeakHours * 60 + 10,
  //       },
  //     ]);
  //     const rPeak = cortisone(weight, [
  //       {
  //         units,
  //         minutesAgo: toujeoPeakHours * 60,
  //       },
  //     ]);
  //     const rAfterPeak = cortisone(weight, [
  //       {
  //         units,
  //         minutesAgo: toujeoPeakHours * 60 - 10,
  //       },
  //     ]);
  //     expect(rBeforePeak).toBeLessThan(rPeak);
  //     expect(rAfterPeak).toBeLessThan(rPeak);
  //   });
  test('200mg cortisone, the activity after 5h 6h 7h should be >0.1 ', () => {
    const units = 20;
    const weight = 80;

    const sixHoursActivity = cortisone(weight, [
      {
        units,
        minutesAgo: 60 * 6,
      },
    ]);
    const fiveHoursActivity = cortisone(weight, [
      {
        units,
        minutesAgo: 60 * 6,
      },
    ]);
    const sevenHoursActivity = cortisone(weight, [
      {
        units,
        minutesAgo: 60 * 7,
      },
    ]);

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
	const drugs = transformNoteTreatmentsDrug(treatments as unknown as Treatment[]);

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
    'Cor 200',
  ])('correct cortisone entry', (note) => {
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
	const drugs = transformNoteTreatmentsDrug(treatments as unknown as Treatment[]);
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
	const drugsTou = transformNoteTreatmentsDrug(toujeoTreatment as unknown as Treatment[]);

    let result = computeCortisone(
		drugsTou,
      80
    );
    expect(result).toBe(0);
    //expect(result).toMatchSnapshot();
  });
});
