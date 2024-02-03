import { TypeDateISO } from './TypeDateISO';
import { drugs } from './drug';

/**
 * Represents the direction of blood glucose change.
 */
export type Direction =
	| 'DoubleDown'
	| 'SingleDown'
	| 'FortyFiveDown'
	| 'Flat'
	| 'FortyFiveUp'
	| 'SingleUp'
	| 'DoubleUp';

/**
 * Represents drug information.
 */
export type Drug = {
	/** The timestamp of the drug entry. */
	time: number;
	/** The name of the drug. */
	drug: string;
	/** Additional notes for the drug. */
	notes: string;
	/** The amount of insulin associated with the drug. */
	insulin: number;
	/** Placeholder property for empty space. */
	empty_space: any;
};

/**
 * Represents a note with associated notes.
 */
export type Note = {
	/** The type of note. */
	type: 'Note';
	/** The content of the note. */
	notes: string;
};

/**
 * Represents data related to physical activity.
 */
export type Activity = {
	/** The number of steps taken (optional). */
	steps?: number;
	/** The heart rate during the activity (optional). */
	heartRate?: number;
	/** The timestamp indicating when the activity data was recorded in ISO format. */
	created_at: TypeDateISO;
};

/**
 * Represents a blood glucose entry.
 */
export type Sgv = {
	/** The timestamp of the blood glucose entry in milliseconds. */
	mills: number;
	/** The blood glucose value. */
	sgv: number;
};

/**
 * Represents a blood glucose entry value type.
 */
export type EntryValueType = {
	/** The blood glucose value. */
	sgv: number;
	/** The direction of blood glucose change. */
	direction: string;
};

/**
 * Represents a blood glucose entry with additional date information.
 */
export type Entry = EntryValueType & {
	/** The timestamp of the entry. */
	date: number;
	/** The date in string format. */
	dateString: string;
	/** The type of entry. */
	type: 'sgv';
};

/**
 * Represents parameters for a profile.
 */
export type ProfileParams = {
	/** The basal insulin rate. */
	basal: number | { value: number; time: string; timeAsSecond?: number }[];
};

/**
 * Represents a profile with associated profile parameters.
 */
export type NSProfile = {
	/** The start date of the profile. */
	startDate: string;
	/** The default profile name. */
	defaultProfile: string;
	/** The store of profile parameters. */
	store: {
		[profileName: string]: ProfileParams;
	};
};

//Note', 'Profile Switch', 'Temp Basal', 'Meal Bolus', 'Bolus Wizard', 'Correction Bolus', 'Temporary Target', 'Insulin Change', 'Site Change', 'Sensor Start', 'Sensor Stop'

/**
 * Represents the treatment information for a Meal Bolus event.
 */
export type MealBolusTreatment = {
	/** The type of event, set to 'Meal Bolus'. */
	eventType:
		| 'Meal Bolus'
		| 'Bolus'
		| 'Correction Bolus'
		| 'Bolus Wizard'
		| 'Carb Correction';
	/** The amount of insulin administered for the meal bolus. */
	insulin?: number;
	/** The number of carbohydrates consumed. */
	carbs?: number;
	/** The date of the treatment creation in ISO format. */
	created_at: TypeDateISO;
};

/**
 * Represents the treatment information for a Profile Switch event.
 */
export type ProfileSwitchTreatment = {
	/** The type of event, set to 'Profile Switch'. */
	eventType: 'Profile Switch';
	/** The duration of the profile switch in minutes. */
	duration: number;
	/** The date of the treatment creation in ISO format. */
	created_at: TypeDateISO;
	/** The JSON representation of the new profile. */
	profileJson: string;
	/** The percentage change applied during the profile switch. */
	percentage: number;
};

/**
 * Represents the treatment information for a Temporary Basal event.
 */
export type TempBasalTreatment = {
	/** The type of event, set to 'Temp Basal'. */
	eventType: 'Temp Basal';
	/** The absolute insulin rate for the temporary basal. */
	absolute: number;
	/** The duration of the temporary basal in minutes. */
	duration: number;
	/** The date of the treatment creation in ISO format. */
	created_at: TypeDateISO;
};

/**
 * Represents the announcement as treatment.
 */
export type AnnouncementTreatment = {
	/** The date of the treatment creation in ISO format. */
	created_at: TypeDateISO;
	/** The type of event, set to 'Announcement'. */
	eventType: 'Announcement';
	/** Additional notes for the treatment. */
	notes: string;
};

/**
 * Represents treatment data.
 */
export type NSTreatment =
	| MealBolusTreatment
	| ProfileSwitchTreatment
	| TempBasalTreatment
	| AnnouncementTreatment;

export const isMealBolusTreatment = (
	treatment: NSTreatment,
): treatment is MealBolusTreatment =>
	treatment.eventType === 'Meal Bolus' ||
	treatment.eventType === 'Bolus' ||
	treatment.eventType === 'Bolus Wizard' ||
	treatment.eventType === 'Correction Bolus';

export const isAnnouncementTreatment = (
	treatment: NSTreatment,
): treatment is AnnouncementTreatment => treatment.eventType === 'Announcement';

export type NSTreatmentParsed = {
	drug: string;
	units: number;
	minutesAgo: number;
};

/**
 * Represents a treatment delta with additional minutes ago information.
 */
export type TreatmentBiexpParam = {
	units: number;
	minutesAgo: number;
	duration: number;
	peak: number;
};

/**
 * Represents a gender type.
 */
export type GenderType = 'Male' | 'Female';

/**
 * Represents parameters for a CGM simulation.
 */
export type CGMSimParams = {
	basalActivity: number;
	liverActivity: number;
	carbsActivity: number;
	bolusActivity: number;
	cortisoneActivity: number;
	alcoholActivity: number;
};

/**
 * Represents user parameters.
 */
export type UserParams = {
	nsUrl: string;
};

type PatientInfoBase = {
	/** Weight of the simulated user (in cm). */
	WEIGHT: number;
	/** Age of the simulated user. */
	AGE: number;
	/** Gender of the simulated user ('Male' or 'Female'). */
	GENDER: GenderType;
};

/**
 * Represents patient parameters for a cgmsim simulation.
 */
export type PatientInfoUva = PatientInfoBase;

/**
 * Represents patient parameters for a cgmsim simulation.
 */

export type PatientInfoCgmsim = PatientInfoBase & {
	/** Carbohydrate Ratio (CR) for insulin calculation. */
	CR: number;
	/** Insulin Sensitivity Factor (ISF) for insulin calculation. */
	ISF: number;
	/** Time taken for carbohydrates to be absorbed (in minutes default 360). */
	CARBS_ABS_TIME: number;
	/** Time period for insulin activity (Time Peak) (in minutes default 75). */
	TP: number;
	/** Duration of Insulin Action (DIA) (in hours default: 6). */
	DIA: number;
};

type MainParamsBase = {
	patient: PatientInfoBase;
	treatments: NSTreatment[];
	profiles: NSProfile[];
	pumpEnabled: boolean;
	activities?: Activity[];
	user: UserParams;
};
/**
 * Represents main parameters for a UVA simulation.
 */
export type MainParamsUVA = MainParamsBase & {
	lastState: UvaPatientState;
};

/**
 * Represents main parameters for a simulation.
 */
export type MainParams = MainParamsBase & {
	patient: PatientInfoCgmsim;
	entries: Sgv[];
};

/**
 * Represents the result of a simulation.
 */
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
};

/**
 * Represents the output of a UVA simulation.
 */
export type UvaOutput = {
	/** Glucose in plasma. */
	Gp: number;
	/** Glucose. */
	G?: number;
};

/**
 * Represents user parameters for a UVA simulation.
 */
export type UvaUserParams = {
	/** Insulin infusion rate. */
	iir: number;
	/** Insulin bolus amount. */
	ibolus: number;
	/** Carbohydrate intake. */
	carbs: number;
	/** Intensity of the simulation. */
	intensity: number;
};

/**
 * Represents a time delta for a UVA simulation.
 */
export type UvaDelta = 1;

/**
 * Represents an interval for a UVA simulation.
 */
export type UvaInterval = 5;

/**
 * Represents the state of a UVA patient.
 */
export type UvaPatientState = {
	/** Glucose in plasma. */
	Gp: number;
	/** Glucose in tissue. */
	Gt: number;
	/** Insulin delay compartment 1. */
	I_: number;
	/** Insulin in liver. */
	Il: number;
	/** Insulin in plasma. */
	Ip: number;
	/** Subcutaneous insulin in compartment 1. */
	Isc1: number;
	/** Subcutaneous insulin in compartment 2. */
	Isc2: number;
	/** Glucose mass in intestine. */
	Qgut: number;
	/** Carbs in stomach, solid phase. */
	Qsto1: number;
	/** Carbs in stomach, liquid phase. */
	Qsto2: number;
	/** Insulin in the interstitial fluid. */
	X: number;
	/** Insulin delay compartment 2. */
	XL: number;
	/** Increased energy consumption estimated through heart rate. */
	Y: number;
	/** Exercise-induced changes in insulin sensitivity. */
	Z: number;
	/** W. */
	W: number;
};

/**
 * Represents parameters for a UVA simulation.
 */
export type UvaPatientType = {
	/** Body weight. */
	BW: number;
	/** Steady-state of glucose in plasma. */
	Gpeq: number;
	/** Heart rate at rest. */
	HRb: number;
	/** Maximal heart rate (220-age). */
	HRmax: number; //220-age
	/** Distribution volume of glucose. */
	VG: number;
	/** Rate parameter from Gp to Gt. */
	k1: number;
	/** Rate parameter from Gt to Gp. */
	k2: number;
	/** Distribution volume of insulin. */
	VI: number;
	/** Rate parameter from Il to Ip. */
	m1: number;
	/** Rate parameter from Ip to Il. */
	m2: number;
	/** Rate parameter from Ip to periphery. */
	m4: number;
	/** Rate parameter of hepatic extraction (slope). */
	m5: number;
	/** Rate parameter of hepatic extraction (offset). */
	m6: number;
	/** Steady-state hepatic extraction of insulin. */
	HEeq: number;
	/** Maximal emptying rate of stomach. */
	kmax: number;
	/** Minimal emptying rate of stomach. */
	kmin: number;
	/** Rate constant of intestinal absorption. */
	kabs: number;
	/** Rate of grinding. */
	kgri: number;
	/** Fraction of intestinal absorption. */
	f: number;
	/** Extrapolated at zero glucose and insulin. */
	kp1: number;
	/** Liver glucose effectiveness. */
	kp2: number;
	/** Amplitude of insulin action on the liver. */
	kp3: number;
	/** Amplitude of portal insulin action on the liver. */
	kp4: number;
	/** Delay between insulin signal and insulin action. */
	ki: number;
	/** Glucose uptake by the brain and erythrocytes. */
	Fcns: number;
	/** Michaelis-Menten constant (offset). */
	Vm0: number;
	/** Michaelis-Menten constant (slope). */
	Vmx: number;
	/** Michaelis-Menten constant (offset). */
	Km0: number;
	/** Insulin action on the peripheral glucose utilization. */
	p2u: number;
	/** Glomerular filtration rate. */
	ke1: number;
	/** Renal threshold of glucose. */
	ke2: number;
	/** Rate constant of nonmonomeric insulin absorption. */
	ka1: number; // [Dalla Man, JDST, 2007]
	/** Rate constant of monomeric insulin absorption. */
	ka2: number; // [Dalla Man, JDST, 2007]
	/** Rate constant of insulin dissociation. */
	kd: number;
	/** Factor for exercise-induced increase in insulin sensitivity. */
	A: number; // [Dalla Man, JDST, 2009]
	/** Factor for exercise-induced increase in insulin-independent glucose clearance. */
	beta: number; // [Dalla Man, JDST, 2009]
	/** Factor for exercise-induced increase in glucose uptake. */
	gamma: number; // [Dalla Man, JDST, 2009]
	/** Parameter for calculating Z. */
	a: number; // [Dalla Man, JDST, 2009]
	/** Time constant for Y. */
	Thr: number; // [Dalla Man, JDST, 2009]
	/** Time constant for Z. */
	Tin: number; // [Dalla Man, JDST, 2009]
	/** Time constant for Z. */
	Tex: number; // [Dalla Man, JDST, 2009]
	/** Parameter for calculating Z. */
	n: number; // [Dalla Man, JDST, 2009]
};
