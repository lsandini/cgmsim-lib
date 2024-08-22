import moment = require('moment');
import { MultiLineDataSource, SingleLineDataSource } from 'test/d3/d3Func';
import { drugs } from '../src/drug';
import {
  Activity,
  PatientInfoCgmsim,
  NSTreatment,
  Sgv,
  TreatmentExpParam,
} from '../src/Types';
import simulator from '../src/CGMSIMsimulator';
import { getExpTreatmentActivity } from '../src/utils';
import { TypeDateISO } from '../src/TypeDateISO';
const { output, line } = require('../test/d3/d3Func');

export const diffOptions = {
  customDiffConfig: {
    threshold: 0.4,
  },
  // comparisonMethod: 'ssim',
  failureThreshold: 80,
  failureThresholdType: 'pixel',
};

export const getPngSnapshot = async (
  data: SingleLineDataSource | MultiLineDataSource,
  options = {},
  name?: string,
): Promise<Buffer> => {
  jest.useRealTimers();
  const testDesc = expect.getState().currentTestName;

  const dirBase = globalThis.dirBase;
  const fileBase = globalThis.fileBase;
  const filename = name || testDesc.replace(/[^a-z0-9]/gi, '_');

  const graph = line({
    data: data,
    container: `
    <div id='container' style="display:flex;flex-direction:column;">
      <h2>${testDesc}</h2>
      <div id='chart'></div>	  	
      <svg id="my_dataviz" height=300 width=450></svg>
    </div>`,
    // lineColors: ['steelblue', 'darkorange', 'red', 'darkgreen', 'black'],
    width: 800,
    height: 570,
    ...options,
  });
  try {
    const png = await output(
      // './test/__visual__/' + filename,
      `./test/__pngArchive__/${fileBase}/${filename}`,
      graph,
    );
    return png;
  } catch (error) {
    throw new Error(error);
  }
};

export const treatments: NSTreatment[] = [
  {
    eventType: 'Carb Correction',
    carbs: 12,
    created_at: '2022-05-07T10:20:00.000Z',
  },
  {
    eventType: 'Meal Bolus',
    insulin: 2,
    created_at: '2022-05-06T16:00:00.000Z',
    carbs: null,
  },
  {
    eventType: 'Announcement',
    notes: 'gla 10',
    created_at: '2022-05-06T15:00:00.000Z',
  },
  {
    created_at: '2022-05-04T16:50:00.000Z',
    eventType: 'Meal Bolus',
    carbs: 30,
    insulin: 0,
  },
];

export const toujeoTreatments = [
  {
    _id: '62764c27a3dc0ad6768cce46',
    enteredBy: 'TheBoss',
    eventType: 'Carb Correction',
    carbs: 12,
    created_at: '2022-05-07T10:20:00.000Z',
    utcOffset: 0,
    insulin: null,
  },
  {
    _id: '62754944a3dc0ad67616d2a2',
    enteredBy: 'TheBoss',
    eventType: 'Meal Bolus',
    insulin: 2,
    preBolus: 15,
    utcOffset: 0,
    protein: '',
    fat: '',
    duration: 0,
    profile: '',
    created_at: '2022-05-06T16:00:00.000Z',
    carbs: null,
  },
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
    created_at: '2022-05-06T15:00:00.000Z',
    carbs: null,
    insulin: null,
  },
  {
    _id: '6272bd41a3dc0ad676e0cefe',
    created_at: '2022-05-04T16:50:00.000Z',
    eventType: 'Meal Bolus',
    carbs: 30,
    insulin: null,
  },
];

export const glargineTreatments = [
  {
    _id: '62764c27a3dc0ad6768cce46',
    enteredBy: 'TheBoss',
    eventType: 'Carb Correction',
    carbs: 12,
    created_at: '2022-05-07T10:20:00.000Z',
    utcOffset: 0,
    insulin: null,
  },
  {
    _id: '62754944a3dc0ad67616d2a2',
    enteredBy: 'TheBoss',
    eventType: 'Meal Bolus',
    insulin: 2,
    preBolus: 15,
    utcOffset: 0,
    protein: '',
    fat: '',
    duration: 0,
    profile: '',
    created_at: '2022-05-06T16:00:00.000Z',
    carbs: null,
  },
  {
    _id: '627548f4a3dc0ad67616ac95',
    eventType: 'Announcement',
    notes: 'gla 14',
    utcOffset: 0,
    isAnnouncement: true,
    protein: '',
    fat: '',
    duration: 0,
    profile: '',
    enteredBy: 'Boss',
    created_at: '2022-05-06T15:00:00.000Z',
    carbs: null,
    insulin: null,
  },
  {
    _id: '6272bd41a3dc0ad676e0cefe',
    created_at: '2022-05-04T16:50:00.000Z',
    eventType: 'Meal Bolus',
    carbs: 30,
    insulin: null,
  },
];

export const bolusTreatments = [
  {
    _id: '62764c27a3dc0ad6768cce46',
    enteredBy: 'TheBoss',
    eventType: 'Carb Correction',
    carbs: 12,
    created_at: '2022-05-07T10:20:00.000Z',
    utcOffset: 0,
    insulin: null,
  },
  {
    _id: '62754944a3dc0ad67616d2a2',
    enteredBy: 'TheBoss',
    eventType: 'Meal Bolus',
    insulin: 20,
    preBolus: 0,
    utcOffset: 0,
    protein: '',
    fat: '',
    duration: 0,
    profile: '',
    created_at: '2022-05-06T16:00:00.000Z',
    carbs: null,
  },
];

const nsUrl = 'testUser';

export const getFlatHeartRate = (hr: Activity, hoursDuration): Activity[] => {
  const result = [];
  const end = moment(hr.created_at).add(hoursDuration, 'h');
  let newTime = moment(hr.created_at);
  while (newTime.toISOString() < end.toISOString()) {
    result.push({
      created_at: newTime.toISOString(),
      heartRate: hr.heartRate,
    });
    newTime = newTime.add(5, 'm');
  }

  return result;
};

type TestCarb = {
  grams: number;
  minutes: number;
};
type TestTreatment = {
  units: number;
  type: keyof typeof drugs;
  minutes: number;
};
type TestResult = {
  noiseActivities: number[];
  basalActivities: number[];
  bolusActivities: number[];
  carbsActivities: number[];
  liverActivities: number[];
  cortisoneActivity: number[];
  alcoholActivity: number[];
  sgvS: number[];
  activityFactor: number[];
  isfConstantFactor: number[];
  isfDynamicFactor: number[];
};
type TestBolus = {
  insulin: number;
  minutes: number;
};
export const testGenerator = (
  startSgv: number,
  hoursDuration: number,
  {
    treatments,
    carbs,
    boluses,
  }: {
    treatments: TestTreatment[];
    carbs: TestCarb[];
    boluses: TestBolus[];
  },
): TestResult => {
  jest.useFakeTimers('modern');

  const env: PatientInfoCgmsim = {
    CARBS_ABS_TIME: 360,
    CR: 10,
    DIA: 6,
    ISF: 30,
    TP: 75,
    WEIGHT: 250 / 3,
    AGE: 51,
    GENDER: 'Male',
    TZ: 'UTC',
  };
  const noiseActivities = [];
  const basalActivities = [];
  const bolusActivities = [];
  const carbsActivities = [];
  const liverActivities = [];
  const cortisoneActivity = [];
  const alcoholActivity = [];
  const activityFactor = [];
  const isfConstantFactor = [];
  const isfDynamicFactor = [];
  const sgvS = [];
  let now = () => moment('2022-02-02T12:00:00.000Z');
  const entries: Sgv[] = [
    {
      mills: now().add(-20, 'minutes').toDate().getTime(),
      sgv: startSgv,
    },
    {
      mills: now().add(-15, 'minutes').toDate().getTime(),
      sgv: startSgv,
    },
    {
      mills: now().add(-10, 'minutes').toDate().getTime(),
      sgv: startSgv,
    },
    {
      mills: now().add(-5, 'minutes').toDate().getTime(),
      sgv: startSgv,
    },
  ];
  const nsTreatments: NSTreatment[] = [];
  treatments.forEach((t) => {
    nsTreatments.push({
      eventType: 'Announcement',
      created_at: now().add(t.minutes, 'minutes').utc().format() as TypeDateISO,
      notes: `${drugs[t.type].names[0]} ${t.units}`,
    });
  });
  carbs.forEach((t) => {
    nsTreatments.push({
      eventType: 'Meal Bolus',
      created_at: now().add(t.minutes, 'minutes').utc().format() as TypeDateISO,
      carbs: t.grams,
      insulin: 0,
    });
  });

  boluses.forEach((t) => {
    nsTreatments.push({
      eventType: 'Meal Bolus',
      created_at: now().add(t.minutes, 'minutes').utc().format() as TypeDateISO,
      insulin: t.insulin,
      carbs: 0,
    });
  });
  let _now = now();
  const pumpEnabled = false;
  jest.setSystemTime(_now.toDate());

  for (let index = 0; index < 60 * hoursDuration; ) {
    const result = simulator({
      patient: env,
      pumpEnabled,
      entries,
      treatments: nsTreatments,
      profiles: [],
      user: { nsUrl },
    });
    entries.splice(0, 0, {
      mills: _now.toDate().getTime(),
      sgv: result.sgv,
    });
    // for (let i = 0; i < 5; i++) {
    sgvS.push(result.sgv);
    basalActivities.push(result.basalActivity);
    bolusActivities.push(result.bolusActivity);
    carbsActivities.push(result.carbsActivity);
    liverActivities.push(result.liverActivity);
    cortisoneActivity.push(result.cortisoneActivity);
    alcoholActivity.push(result.alcoholActivity);
    activityFactor.push(result.activityFactor);
    isfConstantFactor.push(result.isf.constant);
    isfDynamicFactor.push(result.isf.dynamic);
    // }

    _now = _now.add(5, 'minutes');
    index = index + 5;
    jest.setSystemTime(_now.toDate());
  }

  return {
    noiseActivities,
    basalActivities,
    bolusActivities,
    carbsActivities,
    liverActivities,
    cortisoneActivity,
    alcoholActivity,
    activityFactor,
    isfConstantFactor,
    isfDynamicFactor,
    sgvS,
  };
};

export const computeBasalActivityForTest = (
  treatments: TreatmentExpParam[],
) => {
  // expressed U/min !!!
  return treatments
    .map(getExpTreatmentActivity)
    .reduce((tot, activity) => tot + activity, 0);
};
