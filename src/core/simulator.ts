import logger, { setCoreLogger } from './logger';
import bolus, { calculateBolusIOB } from './bolus';
import basal, { calculateTotalBasalIOB } from './basal';
import cortisone from './cortisone';
import alcohol from './alcohol';
import carbs, { calculateCarbsCOB } from './carbs';
import liverRun from './liver';
import sgv from './sgv';
import pump, { calculateProfileIOB, calculatePumpIOB } from './pump';
import { calculateTrendArrow } from './arrows';
import {
	CoreGlucoseEntry,
	CorePatient,
	CoreSimulationParams,
	CoreSimulationResult,
	CoreTreatment,
	MainParams,
	NSTreatment,
	NSProfile,
	Sgv,
	SimulationResult,
	GenderType,
} from './types';
import { physicalIsf, physicalLiver } from './physical';
import { transformNoteTreatmentsDrug } from './drug';
import { roundTo8Decimals } from './utils';

/**
 * Main simulation module for blood glucose data calculation.
 * Decoupled from Nightscout network layer and external Pino logging.
 */
export const simulator = (params: MainParams): SimulationResult => {
	const { patient, entries, treatments, profiles, pumpEnabled, activities, user, logger: customLogger } = params;

	if (customLogger) {
		setCoreLogger(customLogger);
	}

	logger.info('[simulator] Run Init CGMSim NSUrl:%o', user?.nsUrl ?? 'local');

	if (!treatments) {
		throw new Error('treatments is ' + treatments);
	}
	if (!profiles) {
		throw new Error('profiles is ' + profiles);
	}

	const baseIsf = patient.ISF;
	const age = patient.AGE;
	const gender = patient.GENDER;
	const tz = patient?.TZ || 'UTC';

	let dynamicIsf = baseIsf;
	let physicalActivityLiverFactor = 1;
	if (dynamicIsf < 9) {
		throw new Error('Isf must be greater than or equal to 9');
	}
	if (activities && activities.length > 0) {
		dynamicIsf = baseIsf * physicalIsf(activities, age, gender);
		physicalActivityLiverFactor = physicalLiver(activities, age, gender);
	}

	const weight = patient.WEIGHT;
	const dia = patient.DIA;
	const peak = patient.TP;
	const carbsAbs = patient.CARBS_ABS_TIME;
	const cr = patient.CR;

	// Find basal boluses and drugs
	const drugs = transformNoteTreatmentsDrug(treatments);

	// Filter recent drug treatments (last 45 hours)
	const recentDrugTreatments = drugs.filter((treatment) => {
		return treatment.minutesAgo <= 45 * 60;
	});

	// Calculate treatment effects
	const bolusEffect = bolus(treatments, dia, peak);
	const basalBolusEffect = basal(recentDrugTreatments, weight);
	const cortisoneEffect = cortisone(recentDrugTreatments, weight);
	const alcoholEffect = alcohol(recentDrugTreatments, weight, gender);
	const pumpBasalEffect = pumpEnabled ? pump(treatments, profiles, dia, peak) : 0;
	const carbsEffect = carbs(treatments, carbsAbs, dynamicIsf, cr);
	const carbsOnBoard = calculateCarbsCOB(carbsAbs, treatments);
	const bolusIOB = calculateBolusIOB(treatments, dia, peak);
	const pumpBasalIOB = pumpEnabled ? calculatePumpIOB(treatments, profiles, dia, peak) : 0;
	const profileBasalIOB = pumpEnabled ? calculateProfileIOB(profiles, dia, peak) : 0;
	const basalIOB = calculateTotalBasalIOB(recentDrugTreatments, weight);

	logger.debug('[simulator] Insulin calculations:', {
		bolusEffect,
		bolusIOB,
		basalBolusEffect,
		pumpBasalEffect,
		pumpBasalIOB,
		profileBasalIOB,
		basalIOB,
	});

	const totalInsulinActivity = pumpEnabled ? pumpBasalEffect + bolusEffect : basalBolusEffect + bolusEffect;

	logger.debug('[simulator] Total insulin activity for liver suppression: %o U/min', totalInsulinActivity);

	const liverEffect = liverRun(
		baseIsf,
		cr,
		{
			physical: physicalActivityLiverFactor,
			alcohol: alcoholEffect,
			insulin: totalInsulinActivity,
		},
		weight,
		tz,
	);

	const nowMs = Date.now();
	const orderedEntries = (entries || []).filter((e) => e.mills <= nowMs).sort((a, b) => b.mills - a.mills);

	const newSgvValue = sgv(
		orderedEntries,
		{
			basalActivity: basalBolusEffect + pumpBasalEffect,
			liverActivity: liverEffect,
			carbsActivity: carbsEffect,
			bolusActivity: bolusEffect,
			cortisoneActivity: cortisoneEffect,
			alcoholActivity: alcoholEffect,
		},
		dynamicIsf,
	);

	logger.info('[simulator] Simulation result: %o', {
		...newSgvValue,
		physicalISF: dynamicIsf / baseIsf,
		physicalLiver: physicalActivityLiverFactor,
	});

	if (newSgvValue) {
		return {
			...newSgvValue,
			activityFactor: physicalActivityLiverFactor,
			isf: { dynamic: dynamicIsf, constant: baseIsf },
			cob: carbsOnBoard,
			bolusIOB: bolusIOB,
			pumpBasalIOB: pumpBasalIOB,
			profileBasalIOB: profileBasalIOB,
			basalIOB: basalIOB,
		};
	} else {
		logger.error('No entries found');
		throw new Error('Simulation failed: No glucose entries found');
	}
};

/**
 * High-level, pure simulation function designed for local-first apps (Expo, Hermes, React Native, Browser).
 * Accepts clean domain models without Nightscout DTO requirements.
 */
export function simulateGlucose(params: CoreSimulationParams): CoreSimulationResult {
	const { patient, treatments, recentEntries, basalProfile, logger: customLogger, targetTime } = params;

	if (customLogger) {
		setCoreLogger(customLogger);
	}

	const genderNormalized: GenderType = patient.gender === 'female' || patient.gender === 'Female' ? 'Female' : 'Male';

	// Map CoreTreatment[] to NSTreatment[] for internal simulation logic
	const mappedTreatments: NSTreatment[] = (treatments || []).map((t) => {
		const isoDate = new Date(t.timestamp).toISOString() as any;
		if (t.type === 'bolus' || t.type === 'carb' || t.type === 'Meal Bolus') {
			return {
				eventType: 'Meal Bolus',
				insulin: t.units ?? 0,
				carbs: t.carbs ?? 0,
				created_at: isoDate,
			};
		}
		if (t.type === 'cortisone' || t.type === 'alcohol' || t.type === 'basal' || t.type === 'note') {
			const noteText = t.drug ? `${t.drug} ${t.units || ''}` : t.notes || '';
			return {
				eventType: 'Announcement',
				created_at: isoDate,
				notes: noteText,
			};
		}
		return {
			eventType: 'Meal Bolus',
			insulin: t.units ?? 0,
			carbs: t.carbs ?? 0,
			created_at: isoDate,
		};
	});

	// Map CoreGlucoseEntry[] to Sgv[]
	const mappedEntries: Sgv[] = (recentEntries || []).map((e) => ({
		mills: new Date(e.timestamp).getTime(),
		sgv: e.sgv,
	}));

	// Map basalProfile to NSProfile[]
	const mappedProfiles: NSProfile[] = basalProfile
		? [
				{
					startDate: new Date(0).toISOString(),
					defaultProfile: 'Default',
					store: {
						Default: {
							basal: basalProfile.map((bp) => ({
								time: `${String(bp.hour).padStart(2, '0')}:00`,
								value: bp.rate,
							})),
						},
					},
				},
		  ]
		: [];

	const result = simulator({
		patient: {
			WEIGHT: patient.weight ?? 70,
			AGE: patient.age ?? 30,
			GENDER: genderNormalized,
			TZ: patient.tz ?? 'UTC',
			ISF: patient.isf,
			CR: patient.cr,
			DIA: patient.dia,
			TP: patient.tp,
			CARBS_ABS_TIME: patient.carbsAbsTime ?? 360,
		},
		treatments: mappedTreatments,
		entries: mappedEntries,
		profiles: mappedProfiles,
		pumpEnabled: mappedProfiles.length > 0,
		user: { nsUrl: 'local' },
	});

	// Compute trend direction
	const currentEntriesWithNew: CoreGlucoseEntry[] = [
		{ sgv: result.sgv, timestamp: targetTime ? new Date(targetTime).getTime() : Date.now() },
		...(recentEntries || []),
	];
	const direction = calculateTrendArrow(currentEntriesWithNew);

	const timestamp = targetTime ? new Date(targetTime).getTime() : Date.now();

	return {
		sgv: result.sgv,
		direction,
		deltaMinutes: result.deltaMinutes,
		iob: roundTo8Decimals(result.bolusIOB + result.basalIOB + result.pumpBasalIOB),
		cob: result.cob,
		activity: result.carbsActivity + result.basalActivity + result.bolusActivity,
		timestamp,
	};
}

export default simulator;
