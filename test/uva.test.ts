import moment = require('moment');
import {
  Activity,
  EnvParam,
  MainParamsUVA,
  Profile,
  Sgv,
  Treatment,
} from '../src/Types';
import simulatorUVA from '../src/UVAsimulator';
import { diffOptions, getPngSnapshot } from './inputTest';
const now = new Date('2022-05-01T11:00:00');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

describe('uva test default PATIENT', () => {
  const nsUrl = 'testUser';
  let entries: Sgv[];
  const math = global.Math;
  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(now);
    expect.extend({ toMatchImageSnapshot });
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.5;
    global.Math = mockMath;

    entries = [];
  });

  afterAll(() => {
    jest.useRealTimers();
    global.Math = math;
  });
  const env: MainParamsUVA['env'] = {
    AGE: '40',
    GENDER: 'Male',
    WEIGHT: '80',
  };

  test('basal  0.75 from TREATMENTS should generate flat sgv', async () => {
    //current treatments generate 0.75U/h
    const treatments = [
      {
        _id: '627548f4a3dc0ad67616ac95',
        eventType: 'Announcement',
        notes: 'gla 30',
        utcOffset: 0,
        isAnnouncement: true,
        protein: '',
        fat: '',
        duration: 0,
        profile: '',
        enteredBy: 'Boss',
        created_at: '2022-05-01T08:41:00',
        carbs: null,
        insulin: null,
      },
    ];
    let lastState = null;
    const yList = [];
    for (let i = 0; i < 12; i++) {
      const { state, sgv } = simulatorUVA({
        env,
        lastState,
        treatments,
        profiles: [],
        pumpEnabled: true,
        entries,
        user: { nsUrl },
      });
      yList.push(sgv);
      lastState = state;
    }

    expect(lastState).toMatchSnapshot();
    expect(yList).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'single',
        values: yList.map((sgv, index) => ({ key: index, value: sgv })),
      },
      { scaleY: true }
    );
    expect(png).toMatchImageSnapshot(diffOptions);
  });

  test('basal 0.75 from PROFILE should generate flat sgv', async () => {
    let lastState = null;
    const yList = [];
    const profile: Profile[] = [
      {
        defaultProfile: 'pippo',
        startDate: '2022-01-01',
        store: {
          pippo: {
            basal: 0.75,
          },
        },
      },
      {
        defaultProfile: 'pippo2',
        startDate: '2021-01-01',
        store: {
          pippo2: {
            basal: 0.85,
          },
        },
      },
    ];
    for (let i = 0; i < 12; i++) {
      const { state, sgv } = simulatorUVA({
        env,
        lastState,
        treatments: [],
        profiles: profile,
        pumpEnabled: true,
        entries,
        user: { nsUrl },
      });
      yList.push(sgv);
      lastState = state;
    }

    expect(lastState).toMatchSnapshot();
    expect(yList).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'single',
        values: yList.map((sgv, index) => ({ key: index, value: sgv })),
      },
      { scaleY: true }
    );
    expect(png).toMatchImageSnapshot(diffOptions);
  });

  test('basal 0.75 from PROFILE + 50g CARBS should generate a curve', async (done) => {
    let lastState = null;
    const yList = [];
    const profile: Profile[] = [
      {
        defaultProfile: 'pippo',
        startDate: '2022-01-01',
        store: {
          pippo: {
            basal: 0.75,
          },
        },
      },
      {
        defaultProfile: 'pippo2',
        startDate: '2021-01-01',
        store: {
          pippo2: {
            basal: 0.85,
          },
        },
      },
    ];
    const treatments: Treatment[] = [
      {
        carbs: 50,
        created_at: '2022-05-01T10:59:00',
      },
    ];

    const now = moment('2022-05-01T11:00:00');
    let sgvMax = 0;
    for (let i = 0; i < 36; i++) {
      const { state, sgv } = simulatorUVA({
        env,
        lastState,
        treatments,
        profiles: profile,
        pumpEnabled: true,
        entries,
        user: { nsUrl },
      });
      yList.push(sgv);
      lastState = state;
      sgvMax = sgv > sgvMax ? sgv : sgvMax;
      jest.setSystemTime(new Date(now.add(5, 'minutes').toISOString()));
    }

    const yAfter1h = yList[11];
    const yAfter2h = yList[23];
    const yAfter3h = yList[35];

    expect(yAfter1h).toBeLessThan(193);
    expect(yAfter1h).toBeGreaterThan(192);

    expect(yAfter2h).toBeLessThan(239);
    expect(yAfter2h).toBeGreaterThan(238);

    expect(yAfter3h).toBeLessThan(231);
    expect(yAfter3h).toBeGreaterThan(230);

    expect(sgvMax).toBeLessThan(238.5);
    expect(sgvMax).toBeGreaterThan(238.4);

    expect(lastState).toMatchSnapshot();
    expect(yList).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'single',
        values: yList.map((sgv, index) => ({ key: index, value: sgv })),
      },
      { scaleY: true }
    );
    expect(png).toMatchImageSnapshot(diffOptions);
    return done();
  });

  test('basal 0.75 from PROFILE + 50g CARBS + 5U should generate a curve', async () => {
    let lastState = null;
    const yList = [];
    const profile: Profile[] = [
      {
        defaultProfile: 'pippo',
        startDate: '2022-01-01',
        store: {
          pippo: {
            basal: 0.75,
          },
        },
      },
    ];
    const treatments: Treatment[] = [
      {
        carbs: 50,
        created_at: '2022-05-01T11:30:00',
      },
      {
        carbs: 0,
        insulin: 7.5,
        created_at: '2022-05-01T11:15:00',
      },
    ];

    const now = moment('2022-05-01T11:00:00');
    let sgvMax = 0;
    for (let i = 0; i < 36; i++) {
      const { state, sgv } = simulatorUVA({
        env,
        lastState,
        treatments,
        profiles: profile,
        pumpEnabled: true,
        entries,
        user: { nsUrl },
      });
      yList.push(sgv);
      lastState = state;
      sgvMax = sgv > sgvMax ? sgv : sgvMax;
      jest.setSystemTime(new Date(now.add(5, 'minutes').toISOString()));
    }

    const yAfter1h = yList[11];
    const yAfter2h = yList[23];
    const yAfter3h = yList[35];

    expect(yAfter1h).toBeLessThan(123);
    expect(yAfter1h).toBeGreaterThan(118);

    expect(yAfter2h).toBeLessThan(167);
    expect(yAfter2h).toBeGreaterThan(163);

    expect(yAfter3h).toBeLessThan(127);
    expect(yAfter3h).toBeGreaterThan(126);

    expect(sgvMax).toBeLessThan(169);
    expect(sgvMax).toBeGreaterThan(168);

    expect(lastState).toMatchSnapshot();
    expect(yList).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'single',
        values: yList.map((sgv, index) => ({ key: index, value: sgv })),
      },
      { scaleY: true }
    );
    expect(png).toMatchImageSnapshot(diffOptions);
  });
  test('basal 0.75 from PROFILE + 500g CARBS should generate a curve with max 400', async () => {
    let lastState = null;
    const yList = [];
    const profile: Profile[] = [
      {
        defaultProfile: 'pippo',
        startDate: '2022-01-01',
        store: {
          pippo: {
            basal: 0.75,
          },
        },
      },
    ];
    const treatments: Treatment[] = [
      {
        carbs: 150,
        created_at: '2022-05-01T11:30:00',
      },
    ];

    const now = moment('2022-05-01T11:00:00');
    let sgvMax = 0;
    for (let i = 0; i < 36; i++) {
      const { state, sgv } = simulatorUVA({
        env,
        lastState,
        treatments,
        profiles: profile,
        pumpEnabled: true,
        entries,
        user: { nsUrl },
      });
      yList.push(sgv);
      lastState = state;
      sgvMax = sgv > sgvMax ? sgv : sgvMax;
      jest.setSystemTime(new Date(now.add(5, 'minutes').toISOString()));
    }

    expect(lastState).toMatchSnapshot();
    expect(yList).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'single',
        values: yList.map((sgv, index) => ({ key: index, value: sgv })),
      },
      { scaleY: true }
    );
    expect(png).toMatchImageSnapshot(diffOptions);
  });
  test('basal 0.75 from PROFILE + 10U should generate a curve with min 40', async () => {
    let lastState = null;
    const yList = [];
    const profile: Profile[] = [
      {
        defaultProfile: 'pippo',
        startDate: '2022-01-01',
        store: {
          pippo: {
            basal: 0.79,
          },
        },
      },
    ];
    const treatments: Treatment[] = [
      {
        carbs: 0,
        insulin: 10,
        created_at: '2022-05-01T11:15:00',
      },
    ];

    const now = moment('2022-05-01T11:00:00');
    let sgvMax = 0;
    for (let i = 0; i < 36; i++) {
      const { state, sgv } = simulatorUVA({
        env,
        lastState,
        treatments,
        profiles: profile,
        entries,
        pumpEnabled: true,
        user: { nsUrl },
      });
      yList.push(sgv);
      lastState = state;
      sgvMax = sgv > sgvMax ? sgv : sgvMax;
      jest.setSystemTime(new Date(now.add(5, 'minutes').toISOString()));
    }

    expect(lastState).toMatchSnapshot();
    expect(yList).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'single',
        values: yList.map((sgv, index) => ({ key: index, value: sgv })),
      },
      { scaleY: true }
    );
    expect(png).toMatchImageSnapshot(diffOptions);
  });

  test('basal 0.75 from PROFILE with 60% exercise should generate curve sgv', async () => {
    let lastState = null;
    const maxHrMale40 = 210 - 0.7 * 40;
    const constantHr = 0.6;
    const heartRate = maxHrMale40 * constantHr; //109.2
    const yList = [];
    const profile: Profile[] = [
      {
        defaultProfile: 'pippo',
        startDate: '2022-01-01',
        store: {
          pippo: {
            basal: 0.75,
          },
        },
      },
    ];
    const activities: Activity[] = [
      {
        heartRate,
        created_at: '2022-05-01T11:30:00',
      },
      {
        heartRate,
        created_at: '2022-05-01T11:35:00',
      },
      {
        heartRate,
        created_at: '2022-05-01T11:40:00',
      },
      {
        heartRate,
        created_at: '2022-05-01T11:45:00',
      },
      {
        heartRate,
        created_at: '2022-05-01T11:50:00',
      },
      {
        heartRate,
        created_at: '2022-05-01T11:55:00',
      },
    ];

    const now = moment('2022-05-01T11:00:00');
    let sgvMax = 0;
    for (let i = 0; i < 36; i++) {
      const { state, sgv } = simulatorUVA({
        env,
        lastState,
        treatments: [],
        profiles: profile,
        entries,
        activities,
        pumpEnabled: true,
        user: { nsUrl },
      });
      yList.push(sgv);
      lastState = state;
      sgvMax = sgv > sgvMax ? sgv : sgvMax;
      jest.setSystemTime(new Date(now.add(5, 'minutes').toISOString()));
    }

    const yAfter1h = yList[11];
    const yAfter2h = yList[23];
    const yAfter3h = yList[35];

    const D3Node = require('d3-node');
    const d3n = new D3Node(); // initializes D3 with container element
    d3n.createSVG(10, 20).append('g'); // create SVG w/ 'g' tag and width/height
    const graph = d3n.svgString(); // output: <svg width=10 height=20 xmlns="http://www.w3.org/2000/svg"><g></g></svg>

    expect(lastState).toMatchSnapshot();
    expect(yList).toMatchSnapshot();
    const png = await getPngSnapshot(
      {
        type: 'single',
        values: yList.map((sgv, index) => ({ key: index, value: sgv })),
      },
      { scaleY: true }
    );
    expect(png).toMatchImageSnapshot(diffOptions);
  });
});
