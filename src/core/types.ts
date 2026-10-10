import { TypeDateISO } from './TypeDateISO';
import { SimulationLogger } from './logger';
import { PatientState } from '../lt1/types/Patient';

export { SimulationLogger };

/**
 * Standardized direction of blood glucose change.
 */
export type Direction =
	| 'DoubleDown'
	| 'SingleDown'
	| 'FortyFiveDown'
	| 'Flat'
	| 'FortyFiveUp'
	| 'SingleUp'
	| 'DoubleUp'
	| 'NOT COMPUTABLE';

/**
 * Clean Core Domain Types (Pure simulation, decoupled from Nightscout DTOs)
 */
export interface CorePatient {
	isf: number; // Insulin Sensitivity Factor (mg/dL/U)
	cr: number; // Carb Ratio (g/U)
	dia: number; // Duration of Insulin Action (hours)
	tp: number; // Time to Peak insulin activity (minutes, e.g. 55-75)
	weight?: number;
	age?: number;
	gender?: 'male' | 'female' | 'Male' | 'Female';
	carbsAbsTime?: number;
	tz?: string;
}

export interface CoreTreatment {
	timestamp: Date | number | string;
	type: 'bolus' | 'carb' | 'basal' | 'cortisone' | 'alcohol' | 'note' | string;
	units?: number; // Insulin units
	carbs?: number; // Grams of carbs
	durationMinutes?: number; // For temp basal or extended bolus
	drug?: string;
	notes?: string;
}

export interface CoreGlucoseEntry {
	timestamp: Date | number | string;
	sgv: number;
	direction?: Direction;
}

export interface CoreSimulationParams {
	patient: CorePatient;
	treatments: CoreTreatment[];
	recentEntries: CoreGlucoseEntry[];
	basalProfile?: { hour: number; rate: number }[];
	stepsLast24h?: number;
	heartRateAvg?: number;
	targetTime?: Date | number;
	logger?: SimulationLogger;
}

export interface CoreSimulationResult {
	sgv: number;
	direction: Direction;
	deltaMinutes: number;
	iob: number;
	cob: number;
	activity: number;
	timestamp: number;
}

/**
 * Drug information representation
 */
export type Drug = {
	time: number;
	drug: string;
	notes: string;
	insulin: number;
	empty_space?: unknown;
};

/**
 * Note representation
 */
export type Note = {
	type: 'Note';
	notes: string;
};

/**
 * DeviceStatus representation
 */
export type DeviceStatus = {
	created_at: string;
	openaps: {
		openaps: {
			iob: number;
			time: string;
			basaliob: number;
			bolusiob: number;
		};
		suggested: { COB: number; timestamp: string };
	};
};

/**
 * Physical activity data representation
 */
export type Activity = {
	steps?: number;
	heartRate?: number;
	created_at: TypeDateISO;
};

/**
 * Single blood glucose entry
 */
export type Sgv = {
	mills: number;
	sgv: number;
};

export type EntryValueType = {
	sgv: number;
	direction: string;
};

export type Entry = EntryValueType & {
	date: number;
	dateString: string;
	type: 'sgv';
};

export type ProfileParams = {
	basal: number | { value: number; time: string; timeAsSecond?: number }[];
};

export type NSProfile = {
	startDate: string;
	defaultProfile: string;
	store: {
		[profileName: string]: ProfileParams;
	};
};

export type MealBolusTreatment = {
	eventType: 'Meal Bolus' | 'Bolus' | 'Correction Bolus' | 'Bolus Wizard' | 'Carb Correction' | 'Surprise Meal' | 'SMB';
	insulin?: number;
	carbs?: number;
	created_at: TypeDateISO;
};

export type ProfileSwitchTreatment = {
	eventType: 'Profile Switch';
	duration: number;
	created_at: TypeDateISO;
	profileJson: string;
	percentage: number;
};

export type TemporaryOverrideTreatment = {
	eventType: 'Temporary Override';
	duration: number;
	created_at: TypeDateISO;
	insulinNeedsScaleFactor: number;
};

export type TempBasalTreatment = {
	eventType: 'Temp Basal';
	rate: number;
	duration: number;
	durationInMilliseconds: number;
	created_at: TypeDateISO;
};

export type AnnouncementTreatment = {
	created_at: TypeDateISO;
	eventType: 'Announcement';
	notes: string;
};

export type NSTreatment =
	| MealBolusTreatment
	| ProfileSwitchTreatment
	| TempBasalTreatment
	| AnnouncementTreatment
	| TemporaryOverrideTreatment;

export const isMealBolusTreatment = (treatment: NSTreatment): treatment is MealBolusTreatment =>
	treatment.eventType === 'Meal Bolus' ||
	treatment.eventType === 'Bolus' ||
	treatment.eventType === 'Bolus Wizard' ||
	treatment.eventType === 'Correction Bolus' ||
	treatment.eventType === 'Surprise Meal' ||
	treatment.eventType === 'Carb Correction' ||
	treatment.eventType === 'SMB';

export const isAnnouncementTreatment = (treatment: NSTreatment): treatment is AnnouncementTreatment =>
	treatment.eventType === 'Announcement';

export type NSTreatmentParsed = {
	drug: string;
	units: number;
	minutesAgo: number;
};

export type TreatmentExpParam = {
	units: number;
	minutesAgo: number;
	duration: number;
	peak: number;
};

export type GenderType = 'Male' | 'Female';

export type CGMSimParams = {
	basalActivity: number;
	liverActivity: number;
	carbsActivity: number;
	bolusActivity: number;
	cortisoneActivity: number;
	alcoholActivity: number;
};

export type UserParams = {
	nsUrl: string;
};

export type PatientInfoBase = {
	WEIGHT: number;
	AGE: number;
	GENDER: GenderType;
	TZ: string;
};

export type PatientInfoUva = PatientInfoBase & {
	CR: number;
	ISF: number;
	CARBS_ABS_TIME: number;
	TP: number;
	DIA: number;
};

export type PatientInfoCgmsim = PatientInfoBase & {
	CR: number;
	ISF: number;
	CARBS_ABS_TIME: number;
	TP: number;
	DIA: number;
};

export type MainParamsBase = {
	patient: PatientInfoBase;
	treatments: NSTreatment[];
	profiles: NSProfile[];
	pumpEnabled: boolean;
	activities?: Activity[];
	user?: Partial<UserParams>;
};

export type MainParamsUVA = MainParamsBase & {
	patient: PatientInfoUva;
	lastState: PatientState;
	defaultPatient: PatientState;
	entries: Sgv[];
};

export type MainParams = MainParamsBase & {
	patient: PatientInfoCgmsim;
	entries: Sgv[];
	logger?: SimulationLogger;
};

export type SimulationResult = {
	sgv: number;
	deltaMinutes: number;
	carbsActivity: number;
	cortisoneActivity: number;
	basalActivity: number;
	bolusActivity: number;
	liverActivity: number;
	activityFactor: number;
	alcoholActivity: number;
	isf: { dynamic: number; constant: number };
	cob: number;
	bolusIOB: number;
	pumpBasalIOB: number;
	profileBasalIOB: number;
	basalIOB: number;
};

export type UvaSimulationResult = {
	sgv: number;
	state: PatientState;
	cob: number;
	bolusIOB: number;
	pumpBasalIOB: number;
	profileBasalIOB: number;
	basalIOB: number;
};

export type UvaOutput = {
	Gp: number;
	G?: number;
};

export type UvaUserParams = {
	iir: number;
	ibolus: number;
	carbs: number;
	intensity: number;
};

export type UvaDelta = 1;
export type UvaInterval = 5;

export type UvaPatientState = {
	Gp: number;
	Gt: number;
	I_: number;
	Il: number;
	Ip: number;
	Isc1: number;
	Isc2: number;
	Qgut: number;
	Qsto1: number;
	Qsto2: number;
	X: number;
	XL: number;
	Y: number;
	Z: number;
	W: number;
};

export type UvaPatientType = {
	BW: number;
	Gpeq: number;
	HRb: number;
	HRmax: number;
	VG: number;
	k1: number;
	k2: number;
	VI: number;
	m1: number;
	m2: number;
	m4: number;
	m5: number;
	m6: number;
	HEeq: number;
	kmax: number;
	kmin: number;
	kabs: number;
	kgri: number;
	f: number;
	kp1: number;
	kp2: number;
	kp3: number;
	kp4: number;
	ki: number;
	Fcns: number;
	Vm0: number;
	Vmx: number;
	Km0: number;
	p2u: number;
	ke1: number;
	ke2: number;
	ka1: number;
	ka2: number;
	kd: number;
	A: number;
	beta: number;
	gamma: number;
	a: number;
	Thr: number;
	Tin: number;
	Tex: number;
	n: number;
};
