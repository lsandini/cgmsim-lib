import { PatientInfoCgmsim, Sgv, NSTreatment } from '../src/Types';
import simulator from '../src/CGMSIMsimulator';
import moment = require('moment');
import { diffOptions, getPngSnapshot } from './inputTest';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

const math = global.Math;

const DEFAULT_SETTINGS = {
  TARGET: 100,
};

// PID Controller settings separate from patient info
const PID_SETTINGS = {
  KP: 2.5,
  KI: 0.5,
  KD: 0.5,
  TDI: 60
};

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

 const calculatePID = ({ entries, patient }) => {
   const requiredReadings = Math.min(24, (patient.DIA * 60) / 5);
   const recentReadings = entries.slice(0, requiredReadings);

   const settings = {
     target: DEFAULT_SETTINGS.TARGET,
     tdi: PID_SETTINGS.TDI,
     Kp: PID_SETTINGS.KP,
     Ki: PID_SETTINGS.KI,
     Kd: PID_SETTINGS.KD,
     maxBasalRate: (PID_SETTINGS.TDI / 24) * 1.5,
   };

   const currentGlucose = entries[0].sgv;
   const error = Math.abs(settings.target - currentGlucose) / 100;

   // Proportional Term
   const pTerm = settings.Kp * error;

   // Integral Term
   const integralError = Math.abs(recentReadings.reduce((sum, reading) => 
     sum + (settings.target - reading.sgv) / 100, 0) / recentReadings.length);
   const iTerm = settings.Ki * integralError;

   // Derivative Term
   const dTerm = entries.length > 1 
     ? settings.Kd * Math.abs((entries[0].sgv - entries[1].sgv) / 100)
     : 0;

   // Total Rate
   const totalRate = Math.min(pTerm + iTerm + dTerm, settings.maxBasalRate);

   return { 
     rate: totalRate,
     diagnostics: { pTerm, iTerm, dTerm, currentGlucose }
   };
 };

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
     DIA: 4,
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
   const basalRates = [];
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
     // Changed condition to use requiredReadings calculation
     const minReadings = Math.min(24, (patient.DIA * 60) / 5);
     if (entries.length > minReadings) {
       resultPID = calculatePID({ entries, patient });
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
       basalRates.push(entries.length > minReadings && resultPID ? resultPID.rate : 0.7);
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
      values: [
        sgvS.map((sgv, index) => ({ 
          key: index, 
          value: sgv,
          name: 'Glucose mg/dL'
        })),
        basalRates.map((rate, index) => ({ 
          key: index, 
          value: rate * 40,
          name: 'Basal Rate U/h'
        }))
      ],
    },
    { 
      scaleY: 400,
      margin: { top: 20, right: 60, bottom: 60, left: 60 },
      lineColors: ['steelblue', 'yellow'],
      width: 800,
      height: 600,
      showSecondYAxis: true,
      yAxisScale: 40
    },
  );

   expect(png).toMatchImageSnapshot(diffOptions);
   return;
 });
});