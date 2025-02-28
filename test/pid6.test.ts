import { PatientInfoCgmsim, Sgv, NSTreatment } from '../src/Types';
import simulator from '../src/CGMSIMsimulator';
import moment = require('moment');
import { diffOptions, getPngSnapshot } from './inputTest';
import { calculatePID_IFB, finalizeBasalRate6 } from '../src/utils';
import { TypeDateISO } from '../src/TypeDateISO';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

const math = global.Math;

// PID-IFB Controller settings separate from patient info
// These values match those in pid6.js CONTROLLER_SETTINGS
const PID_IFB_SETTINGS = {
  KP: 0.01,             // Typical range: 0.01-0.02 (U/(mg/dL·hr))
  KI: 0.0005,           // Typical range: 0.0005-0.001 (U/(mg/dL·hr²))
  KD: 0.15,             // Typical range: 0.1-0.2 (U/(mg/dL))
  TDI: 60,              // Total Daily Insulin
  INSULIN_FEEDBACK_GAIN: 0.75, // γ: Insulin feedback gain (0.5-1.0)
  BASE_BASAL: 0.85,     // Base basal rate (U/h)
  TARGET: 108,          // Target BG (mg/dL)
  LOW_GLUCOSE_THRESHOLD: 80, // mg/dL - threshold for low glucose special handling
  SUSPEND_THRESHOLD: 70,     // mg/dL - threshold for zero basal
  MAX_BASAL_MULTIPLIER: 2.0, // Max basal = 200% of average hourly rate
  MAX_RATE_CHANGE: 0.2  // Max change in U/h per 5 minutes
};

/**
 * Helper function to update IOB based on insulin treatments
 * This simulates the IOB calculation in pid6.js using the biexponential model
 */
function updateIOB(iobData: any, treatments: any[], now: moment.Moment, patient: any): void {
  // Reset to zero initially (for each cycle)
  iobData.totalIOB = 0;
  iobData.totalActivity = 0;
  
  // Get DIA and TP parameters from patient
  const diaInMinutes = patient.DIA * 60;
  const tpInMinutes = patient.TP || 55; // Default to 55 minutes if not specified
  
  // Calculate biexponential model parameters (same as in pid6.js)
  const tau = (tpInMinutes * (1 - tpInMinutes / diaInMinutes)) / 
    (1 - (2 * tpInMinutes) / diaInMinutes);
  const a = (2 * tau) / diaInMinutes;
  const S = 1 / (1 - a + (1 + a) * Math.exp(-diaInMinutes / tau));
  
  // Process only treatments within DIA
  const recentTreatments = treatments.filter(t => {
    const treatmentTime = moment(t.created_at);
    const minutesAgo = moment.duration(now.diff(treatmentTime)).asMinutes();
    return minutesAgo < diaInMinutes;
  });
  
  // Calculate IOB for each treatment using the same biexponential model as pid6.js
  recentTreatments.forEach(treatment => {
    const treatmentTime = moment(treatment.created_at);
    const minutesAgo = moment.duration(now.diff(treatmentTime)).asMinutes();
    
    // Each temp basal is treated as a small bolus (rate * duration / 60 = insulin units)
    const insulinAmount = treatment.rate * (treatment.duration / 60);
    
    // Calculate IOB using the same biexponential formula used in pid6.js
    const iob = insulinAmount * (1 - S * (1 - a) * (
      (Math.pow(minutesAgo, 2) / (tau * diaInMinutes * (1 - a)) - 
       minutesAgo / tau - 1) * 
      Math.exp(-minutesAgo / tau) + 1
    ));
    
    // Calculate activity using the same formula as pid6.js
    const activity = insulinAmount * 
      (S / Math.pow(tau, 2)) * 
      minutesAgo * 
      (1 - minutesAgo / diaInMinutes) * 
      Math.exp(-minutesAgo / tau);
    
    // Add to totals, ensuring non-negative values
    iobData.totalIOB += Math.max(0, iob);
    iobData.totalActivity += Math.max(0, activity);
  });
}

describe('pid6 (PID-IFB) test', () => {
  let date: Date;
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

  test('start from 180 @13:00Z using PID-IFB controller', async () => {
    let now = moment('2022-06-04T13:00:00.000Z');
    jest.setSystemTime(now.toDate());
    const startSgv = 180;
    const entries: Sgv[] = [
      {
        mills: now.clone().add(-5, 'minutes').toDate().getTime(),
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

    // Create extended patient settings for PID-IFB
    // Include all parameters needed by the PID-IFB controller
    const patientPID_IFB = {
      ...PID_IFB_SETTINGS,
      DIA: patient.DIA,
      ISF: patient.ISF,
      TP: patient.TP,
      TDI: PID_IFB_SETTINGS.TDI
    };

    let lastSgv = 0;
    const pumpEnabled = true;
    const sgvS: number[] = [];
    const basalRates: number[] = [];
    const TempBasalTreatment: NSTreatment[] = [];
    let previousRate = 0;
    const iobData = { 
      totalIOB: 0, 
      bolusIOB: 0, 
      basalIOB: 0, 
      totalActivity: 0, 
      bolusActivity: 0,
      basalActivity: 0,
      basalAsBoluses: []
    };
    
    // Run the simulation with PID-IFB controller
    for (let index = 0; index < 60 * 24; ) {
      // Simulate one 5-minute interval
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
                basal: PID_IFB_SETTINGS.BASE_BASAL,
              },
            },
          },
        ],
        pumpEnabled,
        user: { nsUrl },
      });

      // Add latest glucose reading
      entries.unshift({
        mills: now.valueOf(),
        sgv: result.sgv,
      });
      
      let resultPID_IFB: any;
      const minReadings = Math.min(24, (patient.DIA * 60) / 5);
      
      // Only calculate PID after we have enough readings
      if (entries.length > minReadings) {
        // Update IOB model based on treatments 
        updateIOB(iobData, TempBasalTreatment, now, patientPID_IFB);
        
        // Use PID-IFB calculation
        resultPID_IFB = calculatePID_IFB(entries, patientPID_IFB, iobData);
        
        // Apply safety limits with rate limiting
        const isLowGlucose = entries[0].sgv <= PID_IFB_SETTINGS.LOW_GLUCOSE_THRESHOLD;
        const isSuspendRequired = entries[0].sgv <= PID_IFB_SETTINGS.SUSPEND_THRESHOLD;
        
        // Debug logging using exact terms from pid6.js
        if (resultPID_IFB) {
          console.log(`BG: ${entries[0].sgv} mg/dL, IOB: ${iobData.totalIOB.toFixed(2)}`);
          console.log(`P: ${resultPID_IFB.diagnostics.pTerm.toFixed(5)}, I: ${resultPID_IFB.diagnostics.iTerm.toFixed(5)}, D: ${resultPID_IFB.diagnostics.dTerm.toFixed(5)}, IFB: ${resultPID_IFB.diagnostics.insulinFeedbackTerm.toFixed(3)}`);
        }
        
        const finalRate = finalizeBasalRate6(
          resultPID_IFB.rate, 
          patientPID_IFB, 
          previousRate,
          isLowGlucose,
          isSuspendRequired
        );
        
        previousRate = finalRate;
        
        // Create a temp basal treatment for 5 minutes
        TempBasalTreatment.push({
          eventType: 'Temp Basal',
          rate: finalRate,
          //absolute: finalRate,
          duration: 5,
          durationInMilliseconds: 5 * (60 * 1000),
          created_at: now.toISOString() as TypeDateISO,
        });
      }
      
      // Store glucose and basal rate data for visualization
      for (let i = 0; i < 5; i++) {
        sgvS.push(result.sgv);
        
        // For basal rate, use the calculated rate if available, otherwise use base basal
        const currentRate = entries.length > minReadings && resultPID_IFB ? 
          finalizeBasalRate6(
            resultPID_IFB.rate, 
            patientPID_IFB, 
            previousRate,
            result.sgv <= PID_IFB_SETTINGS.LOW_GLUCOSE_THRESHOLD,
            result.sgv <= PID_IFB_SETTINGS.SUSPEND_THRESHOLD
          ) : PID_IFB_SETTINGS.BASE_BASAL;
          
        basalRates.push(currentRate);
      }

      // Advance time by 5 minutes
      now = now.clone().add(5, 'minutes');
      index = index + 5;
      jest.setSystemTime(now.toDate());
      lastSgv = result.sgv;
    }
    
    // Create a snapshot and compare it with expected results
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
           value: rate * 40, // Scale up for visualization
           name: 'Basal Rate U/h'
         }))
       ],
     },
     { 
       scaleY: 400,
       margin: { top: 20, right: 60, bottom: 60, left: 60 },
       lineColors: ['steelblue', 'orange'],
       width: 800,
       height: 600,
       showSecondYAxis: true,
       yAxisScale: 40,
       // Add thresholds for glucose visualization
       thresholds: [
         { value: PID_IFB_SETTINGS.SUSPEND_THRESHOLD, color: 'red', label: 'Suspend' },
         { value: PID_IFB_SETTINGS.LOW_GLUCOSE_THRESHOLD, color: 'orange', label: 'Low' },
         { value: PID_IFB_SETTINGS.TARGET, color: 'green', label: 'Target' },
         { value: 180, color: 'orange', label: 'High' }
       ]
     },
   );

    expect(png).toMatchImageSnapshot(diffOptions);
    return;
  });
});