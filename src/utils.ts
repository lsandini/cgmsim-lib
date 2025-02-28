import fetch from 'node-fetch';
import * as moment from 'moment';
import pino, { LevelWithSilent, TransportTargetOptions } from 'pino';
import setupParams from './setupParams';
import { Activity, Entry, EntryValueType, Note, Sgv, SimulationResult, TreatmentExpParam } from './Types';
import { load } from 'ts-dotenv';
import pinoPretty from 'pino-pretty';
import { TypeDateISO } from './TypeDateISO';

const env = load({
	LOGTAIL_SECRET: { type: String, optional: true },
	LOG_LEVEL: { type: String, optional: true },
	NODE_ENV: { type: String, optional: true },
});

const token: string = env.LOGTAIL_SECRET;
const level: LevelWithSilent | string = env.LOG_LEVEL ?? 'error';

const targets: TransportTargetOptions[] = [];

if (token) {
	targets.push({
		target: '@logtail/pino',
		options: { sourceToken: token },

		level,
	});
}

const logger = pino({
	level,
	prettifier: process.env.NODE_ENV === 'development' ? pinoPretty : null,
	transport: {
		targets,
	},
});

export default logger;

/**
 * Checks if a URL starts with HTTPS protocol
 * @param url - URL to check
 * @returns boolean indicating if the URL uses HTTPS
 */
export function isHttps(url: string | null | undefined): boolean {
	if (!url) {
		return false;
	}
	const httpsPattern = /^https:\/\//i;
	return httpsPattern.test(url);
}

/**
 * Removes trailing slash from a string if present
 * @param inputString - String to process
 * @returns String without trailing slash
 */
export function removeTrailingSlash(inputString: string): string {
	return inputString.endsWith('/') ? inputString.slice(0, -1) : inputString;
}

/**
 * Calculates exponential treatment activity based on given parameters
 * @param params - Treatment parameters including peak, duration, minutesAgo, and units
 * @returns Calculated activity value
 */
export function getExpTreatmentActivity({ peak, duration, minutesAgo, units }: TreatmentExpParam): number {
	const tau = (peak * (1 - peak / duration)) / (1 - (2 * peak) / duration);
	const scaleFactor = (2 * tau) / duration;
	const normalizationFactor = 1 / (1 - scaleFactor + (1 + scaleFactor) * Math.exp(-duration / tau));

	let activity =
		units *
		(normalizationFactor / Math.pow(tau, 2)) *
		minutesAgo *
		(1 - minutesAgo / duration) *
		Math.exp(-minutesAgo / tau);

	if (activity <= 0) {
		return 0;
	}

	// Ramp up activity linearly in first 15 minutes
	if (minutesAgo < 15) {
		return activity * (minutesAgo / 15);
	}

	return activity;
}

/**
 * Calculates remaining insulin on board (IOB) using the exponential model
 * 
 * @param params - Treatment parameters including peak, duration, minutesAgo, and units
 * @returns Remaining insulin on board in units
 */
export function getExpTreatmentIOB({ peak, duration, minutesAgo, units }: TreatmentExpParam): number {
  if (minutesAgo >= duration) {
      return 0;
  }

  // Calculate model parameters
  const tau = (peak * (1 - peak / duration)) / (1 - (2 * peak) / duration);
  const a = 2 * tau / duration;
  const S = 1 / (1 - a + (1 + a) * Math.exp(-duration / tau));

  // Calculate IOB fraction using the formula
  let iobFraction = 1 - S * (1 - a) * (
      (Math.pow(minutesAgo, 2) / (tau * duration * (1 - a)) - 
      minutesAgo / tau - 
      1) * Math.exp(-minutesAgo / tau) + 
      1
  );

  // Handle ramp-up period in first 15 minutes
  if (minutesAgo < 15) {
      iobFraction = 1 - (minutesAgo / 15) * (1 - iobFraction);
  }

  // Scale by units and ensure non-negative
  return Math.max(0, units * iobFraction);
}

/**
 * Calculates exponential treatment activity based on given parameters
 * @param params - Treatment parameters including peak, duration, minutesAgo, and units
 * @returns Calculated activity value
 */
export function getExpTreatmentOnBody({ peak, duration, minutesAgo, units }: TreatmentExpParam): number {
	const tau = (peak * (1 - peak / duration)) / (1 - (2 * peak) / duration);
	const scaleFactor = (2 * tau) / duration;
	const normalizationFactor = 1 / (1 - scaleFactor + (1 + scaleFactor) * Math.exp(-duration / tau));

	let activity =
		units *
		(normalizationFactor / Math.pow(tau, 2)) *
		minutesAgo *
		(1 - minutesAgo / duration) *
		Math.exp(-minutesAgo / tau);

	if (activity <= 0) {
		return 0;
	}

	// Ramp up activity linearly in first 15 minutes
	if (minutesAgo < 15) {
		return activity * (minutesAgo / 15);
	}

	return activity;
}

const DEFAULT_SETTINGS = {
	KP: 3.0,
	KI: 0.3,
	KD: 1.8,
	TDI: 60,
	TARGET: 72, // mg/dL (6.0 mmol/L)
};

export const calculatePID = (
	entries: Sgv[],
	{ KP, KI, KD, TDI }: { KP: number; KI: number; KD: number; TDI: number } = DEFAULT_SETTINGS,
) => {
	try {
		if (!entries || entries.length < 36) {
			console.log('Entries received:', {
				entriesProvided: entries?.length || 0,
				required: 36,
				entries: entries,
			});
			throw new Error('Insufficient CGM data');
		}

		console.log('Starting PID calculation with entries:', entries.length);

		const settings = {
			target: DEFAULT_SETTINGS.TARGET,
			tdi: TDI,
			Kp: KP,
			Ki: KI,
			Kd: KD,
			maxBasalRate: (TDI / 24) * 1.5,
		};
		console.log('PID settings:', settings);

		const currentGlucose = entries[0].sgv;
		const error = (settings.target - currentGlucose) / 100;

		if (currentGlucose < settings.target) {
			console.log('Below target glucose - suspending insulin');
			return {
				rate: 0,
				diagnostics: {
					pTerm: 0,
					iTerm: 0,
					dTerm: 0,
					currentGlucose,
					suspendedForSafety: true,
				},
			};
		}

		const pTerm = -settings.Kp * error;

		const recentReadings = entries.slice(0, 24);
		const integralError = recentReadings.reduce((sum, reading, index) => {
			if (index === 0) return sum;
			const prevReading = recentReadings[index - 1];
			const timeGap = (prevReading.mills - reading.mills) / (1000 * 60);
			const prevError = (settings.target - prevReading.sgv) / 100;
			const currentError = (settings.target - reading.sgv) / 100;
			const avgError = (prevError + currentError) / 2;
			return sum + (avgError * timeGap) / 60;
		}, 0);

		const iTerm = -settings.Ki * integralError;

		let dTerm = 0;
		if (entries.length >= 3) {
			const window = entries.slice(0, 3);
			const timeSpanHours = (window[0].mills - window[2].mills) / (1000 * 60 * 60);
			const recentError = (settings.target - window[0].sgv) / 100;
			const olderError = (settings.target - window[2].sgv) / 100;
			const errorChange = recentError - olderError;
			const errorRateOfChange = errorChange / timeSpanHours;
			dTerm = -settings.Kd * errorRateOfChange;
		}

		let totalRate = Math.max(0, Math.min(pTerm + iTerm + dTerm, settings.maxBasalRate));
		const rate = Math.round(totalRate * 20) / 20;

		console.log('PID calculation result:', {
			rate,
			diagnostics: {
				pTerm,
				iTerm,
				dTerm,
				currentGlucose,
				suspendedForSafety: false,
			},
		});
		return {
			rate,
			diagnostics: { pTerm, iTerm, dTerm, currentGlucose },
		};
	} catch (error) {
		logger.error(`PID calculation error: %o`, error);
		throw error;
	}
};

interface PatientSettings {
  KP: number;
  KI: number;
  KD: number;
  TDI: number;
  BASE_BASAL: number;
}

const PID4_SETTINGS = {
  TARGET: 72,           // mg/dL
  BASE_BASAL: 1.0,     // U/h
};

/**
* Alternative PID calculation (version 4)
* @param entries - Array of glucose readings
* @param patient - Patient-specific settings
* @returns Calculated basal rate and diagnostic information
*/
export const calculatePID4 = (
  entries: Sgv[],
  patient: PatientSettings
): { rate: number; diagnostics: any } => {
  if (!entries?.length) {
      throw new Error('Missing required parameters for PID calculation');
  }

  const currentGlucose = entries[0].sgv;
  
  // Error in mg/dL
  const error = PID4_SETTINGS.TARGET - currentGlucose;
  
  // Calculate integral term (using last 24 readings = 2 hours)
  const recentReadings = entries.slice(0, 24);
  const integralError = recentReadings.reduce((sum, reading) => 
      sum + (PID4_SETTINGS.TARGET - reading.sgv), 0) / recentReadings.length;
  
  // Calculate derivative (rate of change) in mg/dL/hour
  const derivative = entries.length > 1 
      ? ((entries[0].sgv - entries[1].sgv) * 12) // Convert 5-min change to per hour
      : 0;

  // Calculate terms in U/h (dividing by 100 as gains are per 100 mg/dL)
  const pTerm = -(patient.KP / 100) * error;
  const iTerm = -(patient.KI / 100) * integralError;
  const dTerm = (patient.KD / 100) * derivative;

  // Total adjustment to basal
  const adjustment = pTerm + iTerm + dTerm;

  // Final rate is base basal plus adjustment
  const finalRate = patient.BASE_BASAL + adjustment;

  logger.debug('[pid4] PID calculation:', {
      currentGlucose,
      error,
      integralError,
      derivative,
      pTerm,
      iTerm,
      dTerm,
      adjustment,
      finalRate
  });

  return {
      rate: finalRate,
      diagnostics: {
          pTerm,
          iTerm,
          dTerm,
          currentGlucose,
          baseBasal: patient.BASE_BASAL
      }
  };
};

/**
* Applies safety limits to calculated basal rate
* @param rate - Calculated basal rate
* @param patient - Patient settings containing TDI
* @returns Limited and rounded basal rate
*/
export const finalizeBasalRate = (
  rate: number,
  patient: PatientSettings
): number => {
  if (!patient?.TDI) {
      throw new Error('Missing required patient parameters for basal rate limits');
  }

  // Apply safety limits
  const maxBasalRate = patient.TDI / 24 * 1.5; // 150% of average hourly rate
  const limitedRate = Math.max(0, Math.min(rate, maxBasalRate));

  // Round to nearest 0.05 U/h
  return Math.round(limitedRate * 20) / 20;
};







/**
 * Calculates time difference in minutes between now and given timestamp
 * @param timestamp - Timestamp in milliseconds or ISO string
 * @returns Number of minutes difference
 */
export const getDeltaMinutes = (timestamp: number | TypeDateISO): number =>
	Math.round(moment().diff(moment(timestamp), 'seconds') / 60);

/**
 * Uploads data to Nightscout API
 * @param data - Data to upload (Entry, Activity, Note, or SimulationResult)
 * @param apiUrl - Nightscout API URL
 * @param apiSecret - API secret key
 * @returns Promise<void>
 */
export function uploadBase(
	data: Entry | Activity | Note | SimulationResult,
	apiUrl: string,
	apiSecret: string,
): Promise<void> {
	const isSecure = isHttps(apiUrl);
	const { postParams } = setupParams(apiSecret, isSecure);
	const jsonData = JSON.stringify(data);

	return fetch(apiUrl, {
		...postParams,
		body: jsonData,
	})
		.then(() => {
			logger.debug('[utils] Successfully updated Nightscout');
		})
		.catch((error) => {
			logger.debug('[utils] %o', error);
			throw new Error(error);
		});
}

/**
 * Loads data from Nightscout API
 * @param apiUrl - Nightscout API URL
 * @param apiSecret - API secret key
 * @returns Promise with array of entries
 */
export function loadBase(apiUrl: string, apiSecret: string): Promise<(Entry | Activity | Note)[]> {
	const isSecure = isHttps(apiUrl);
	const { getParams } = setupParams(apiSecret, isSecure);

	return fetch(apiUrl, {
		...getParams,
	})
		.then((response) => {
			logger.debug('[utils] Successfully loaded from Nightscout');
			return response.json();
		})
		.catch((error) => {
			logger.debug('[utils] %o', error);
			throw new Error(error);
		});
}

/**
 * Rounds a number to 8 decimal places
 * @param value - Number to round
 * @returns Rounded number
 */
export function roundTo8Decimals(value: number): number {
	const multiplier = Math.pow(10, 8);
	return Math.round(value * multiplier) / multiplier;
}

// Add these functions to your utils.ts - avoid additional imports
// Just add the functions directly with types from your existing Types import

/**
 * Constants for PID with Insulin Feedback (PID-IFB) controller
 * These match the CONTROLLER_SETTINGS in pid6.js
 */
export const PID_IFB_SETTINGS = {
  TARGET: 108,              // mg/dL
  LOW_GLUCOSE_THRESHOLD: 80,  // mg/dL
  SUSPEND_THRESHOLD: 70,      // mg/dL
  MAX_BASAL_MULTIPLIER: 2.0,  // Max basal = 200% of average hourly rate
  MAX_RATE_CHANGE: 0.2,       // Max change in U/h per 5 minutes
  MIN_BASAL_RATE: 0           // Minimum allowable basal rate
};

// Use existing interfaces from your Types.ts or define them inline
// but don't redeclare them if they already exist
interface PatientSettingsIFB {
  KP: number;
  KI: number;
  KD: number;
  TDI: number;
  BASE_BASAL: number;
  INSULIN_FEEDBACK_GAIN: number;
  DIA: number;
  TP: number;
  ISF: number;
}

interface IOBData {
  totalIOB: number;
  bolusIOB: number;
  basalIOB: number;
  totalActivity: number;
  bolusActivity: number;
  basalActivity: number;
  basalAsBoluses?: any[];
}

/**
 * Alternative PID calculation with Insulin Feedback (PID-IFB)
 * Based on Medtronic's algorithm that accounts for active insulin
 * This function matches the calculatePID_IFB function in pid6.js
 * 
 * @param entries - Array of glucose readings
 * @param patient - Patient-specific settings
 * @param iobData - Current insulin on board data
 * @returns Calculated basal rate and diagnostic information
 */
export const calculatePID_IFB = (
  entries: any[],  // Use 'any[]' to avoid Sgv redeclaration
  patient: PatientSettingsIFB,
  iobData: IOBData
): { rate: number; diagnostics: any } => {
  if (!entries?.length) {
    throw new Error('Missing required parameters for PID-IFB calculation');
  }

  const currentGlucose = entries[0].sgv;
  
  // Error in mg/dL - using Current - Target (positive when high)
  const error = currentGlucose - PID_IFB_SETTINGS.TARGET;
  
  // Calculate derivative (rate of change) in mg/dL/min and convert to hourly
  const derivativePerMin = entries.length > 1 
    ? ((entries[0].sgv - entries[1].sgv) / 5) // Rate per minute (5 min between readings)
    : 0;
  const derivative = derivativePerMin * 60; // Convert to per hour for calculations
  
  // Calculate integral term (using last 24 readings = 2 hours)
  const recentReadings = entries.slice(0, 24);
  const integralError = recentReadings.reduce((sum, reading) => 
    sum + (reading.sgv - PID_IFB_SETTINGS.TARGET), 0) / recentReadings.length;
  
  // Calculate PID terms - directly using the small gains as in pid6.js
  const pTerm = patient.KP * error;
  const iTerm = patient.KI * integralError;
  const dTerm = patient.KD * derivativePerMin; // Note: Using per-minute derivative for D term
  
  // Insulin Feedback term - multiplying IOB by the feedback gain
  const insulinFeedbackTerm = patient.INSULIN_FEEDBACK_GAIN * iobData.totalIOB;
  
  // Check for low glucose or suspend conditions
  const isLowGlucose = currentGlucose <= PID_IFB_SETTINGS.LOW_GLUCOSE_THRESHOLD;
  const isSuspendRequired = currentGlucose <= PID_IFB_SETTINGS.SUSPEND_THRESHOLD;
  
  // Immediately return zero rate for suspend condition - this matches pid6.js logic
  if (isSuspendRequired) {
    return {
      rate: 0,
      diagnostics: {
        pTerm,
        iTerm,
        dTerm,
        insulinFeedbackTerm: 0,
        iob: iobData.totalIOB,
        currentGlucose,
        baseBasal: patient.BASE_BASAL,
        suspendedForSafety: true
      }
    };
  }
  
  // Calculate the insulin delivery rate (before limits)
  const pidOutput = pTerm + iTerm + dTerm;
  
  // Final rate is base basal plus adjustment minus insulin feedback
  const adjustedRate = patient.BASE_BASAL + pidOutput - (patient.INSULIN_FEEDBACK_GAIN * iobData.totalIOB);
  
  // Use your existing logger if available, or console.log as fallback
  if (typeof logger !== 'undefined') {
    logger.debug('[pid_ifb] PID-IFB calculation:', {
      currentGlucose,
      error,
      integralError,
      derivative,
      pTerm,
      iTerm,
      dTerm,
      iob: iobData.totalIOB,
      insulinFeedbackTerm,
      pidOutput,
      adjustedRate
    });
  } else {
    console.log('[pid_ifb] PID-IFB calculation:', {
      currentGlucose, error, integralError, derivative,
      pTerm, iTerm, dTerm, iob: iobData.totalIOB,
      insulinFeedbackTerm, pidOutput, adjustedRate
    });
  }

  return {
    rate: adjustedRate,
    diagnostics: {
      pTerm,
      iTerm,
      dTerm,
      insulinFeedbackTerm,
      iob: iobData.totalIOB,
      currentGlucose,
      baseBasal: patient.BASE_BASAL,
      isLowGlucose,
      isSuspendRequired
    }
  };
};

/**
 * Applies safety limits to calculated basal rate with enhanced safety features
 * This function exactly matches the finalizeBasalRate function in pid6.js
 * 
 * @param rate - Calculated basal rate
 * @param patient - Patient settings containing TDI
 * @param previousRate - Previous basal rate (for rate limiting)
 * @param isLowGlucose - Flag indicating low glucose condition
 * @param isSuspendRequired - Flag indicating zero basal required
 * @returns Limited and rounded basal rate
 */
export const finalizeBasalRate6 = (
  rate: number,
  patient: any,  // Use 'any' to avoid PatientSettings redeclaration
  previousRate?: number,
  isLowGlucose: boolean = false,
  isSuspendRequired: boolean = false
): number => {
  if (!patient?.TDI) {
    throw new Error('Missing required patient parameters for basal rate limits');
  }

  // Force zero basal for very low glucose (suspend threshold)
  if (isSuspendRequired) {
    return 0;
  }

  // Apply safety limits - max rate is based on TDI
  const maxBasalRate = patient.TDI / 24 * PID_IFB_SETTINGS.MAX_BASAL_MULTIPLIER;
  const minBasalRate = PID_IFB_SETTINGS.MIN_BASAL_RATE;
  
  // First limit within absolute min/max range
  let limitedRate = Math.max(minBasalRate, Math.min(rate, maxBasalRate));
  
  // Apply rate of change limiting, but with special handling for low glucose
  if (previousRate !== undefined) {
    const maxChange = PID_IFB_SETTINGS.MAX_RATE_CHANGE;
    
    // For low glucose, bypass rate limiting for downward adjustments
    if (isLowGlucose && limitedRate < previousRate) {
      // Allow immediate reduction when glucose is low - no code needed here
    }
    else if (Math.abs(limitedRate - previousRate) > maxChange) {
      // Normal rate limiting for other situations
      limitedRate = previousRate + Math.sign(limitedRate - previousRate) * maxChange;
    }
  }

  // Round to nearest 0.05 U/h for pump compatibility - exactly as in pid6.js
  return Math.round(limitedRate * 20) / 20;
};