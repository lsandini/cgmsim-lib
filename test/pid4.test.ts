import { PatientInfoCgmsim, Sgv, NSTreatment } from '../src/Types';
import simulator from '../src/CGMSIMsimulator';
import moment = require('moment');
import { diffOptions, getPngSnapshot } from './inputTest';
import { calculatePID4, finalizeBasalRate } from '../src/utils';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

const math = global.Math;

// PID Controller settings separate from patient info
const PID_SETTINGS = {
  KP: 2,
  KI: 1,
  KD: 0.5,
  TDI: 60,
  BASE_BASAL: 0.85  // Added this from the profiles default basal
};

describe('pid4 test', () => {
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
     DIA: 4,
     ISF: 36,
     TP: 55,
     WEIGHT: 250 / 3,
     AGE: 51,
     GENDER: 'Male',
     TZ: 'UTC',
   };

   // Create extended patient settings for PID4
   const patientPID = {
     ...PID_SETTINGS,
     DIA: patient.DIA
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
               basal: PID_SETTINGS.BASE_BASAL,
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
     const minReadings = Math.min(24, (patient.DIA * 60) / 5);
     if (entries.length > minReadings) {
       // Use PID4 calculation
       resultPID = calculatePID4(entries, patientPID);
       // Apply safety limits
       const finalRate = finalizeBasalRate(resultPID.rate, patientPID);
       
       TempBasalTreatment.push({
         eventType: 'Temp Basal',
         rate: finalRate,
         absolute: finalRate,
         duration: 5,
         durationInMilliseconds: 5 * (60 * 1000),
         created_at: moment(now).toISOString(),
       });
     }

     for (let i = 0; i < 5; i++) {
       sgvS.push(result.sgv);
       basalRates.push(entries.length > minReadings && resultPID ? 
         finalizeBasalRate(resultPID.rate, patientPID) : PID_SETTINGS.BASE_BASAL);
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