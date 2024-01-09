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
	time: number;
	drug: string;
	notes: string;
	insulin: number;
	empty_space: any;
};

/**
 * Represents a note with associated notes.
 */
export type Note = {
	type: 'Note';
	notes: string;
};

/**
 * Represents physical activity data.
 */
export type Activity = {
	steps?: number;
	heartRate?: number;
	created_at: TypeDateISO;
};

/**
 * Represents a blood glucose entry.
 */
export type Sgv = {
	mills: number;
	sgv: number;
};

/**
 * Represents a blood glucose entry value type.
 */
export type EntryValueType = {
	sgv: number;
	direction: string;
};

/**
 * Represents a blood glucose entry with additional date information.
 */
export type Entry = EntryValueType & {
	date: number;
	dateString: string;
	type: 'sgv';
};

/**
 * Represents parameters for a profile.
 */
export type ProfileParams = {
	basal: number | { value: number; time: string; timeAsSecond?: number }[];
};

/**
 * Represents a profile with associated profile parameters.
 */
export type NSProfile = {
	startDate: string;
	defaultProfile: string;
	store: {
		[profileName: string]: ProfileParams;
	};
};

/**
 * Represents the treatment information for a Meal Bolus event.
 * @typedef {Object} MealBolusTreatment
 * @property {'Meal Bolus'} eventType - The type of event, set to 'Meal Bolus'.
 * @property {number} insulin - The amount of insulin administered for the meal bolus.
 * @property {number} carbs - The number of carbohydrates consumed.
 * @property {TypeDateISO} created_at - The date of the treatment creation in ISO format.
 */
export type MealBolusTreatment = {
	eventType: 'Meal Bolus';
	insulin: number;
	carbs: number;
	created_at: TypeDateISO;
};

/**
 * Represents the treatment information for a Profile Switch event.
 * @typedef {Object} ProfileSwitchTreatment
 * @property {'Profile Switch'} eventType - The type of event, set to 'Profile Switch'.
 * @property {number} duration - The duration of the profile switch in minutes.
 * @property {TypeDateISO} created_at - The date of the treatment creation in ISO format.
 * @property {string} profileJson - The JSON representation of the new profile.
 * @property {number} percentage - The percentage change applied during the profile switch.
 */
export type ProfileSwitchTreatment = {
	eventType: 'Profile Switch';
	duration: number;
	created_at: TypeDateISO;
	profileJson: string;
	percentage: number;
};

/**
 * Represents the treatment information for a Temporary Basal event.
 * @typedef {Object} TempBasalTreatment
 * @property {'Temp Basal'} eventType - The type of event, set to 'Temp Basal'.
 * @property {number} absolute - The absolute insulin rate for the temporary basal.
 * @property {number} duration - The duration of the temporary basal in minutes.
 * @property {TypeDateISO} created_at - The date of the treatment creation in ISO format.
 */
export type TempBasalTreatment = {
	eventType: 'Temp Basal';
	absolute: number;
	duration: number;
	created_at: TypeDateISO;
};

/**
 * Represents the treatment information for a Carb Correction event.
 * @typedef {Object} CarbCorrectionTreatment
 * @property {'Carb Correction'} eventType - The type of event, set to 'Carb Correction'.
 * @property {TypeDateISO} created_at - The date of the treatment creation in ISO format.
 * @property {number} carbs - The number of carbohydrates considered for correction.
 */
export type CarbCorrectionTreatment = {
	eventType: 'Carb Correction';
	created_at: TypeDateISO;
	carbs: number;
};

/**
 * Represents the  announcement as treatment.
 * @typedef {Object} AnnouncementTreatment
 * @property {TypeDateISO} created_at - The date of the treatment creation in ISO format.
 * @property {'Announcement'} eventType - The type of event, set to 'Announcement'.
 * @property {string} notes - Additional notes for the treatment, where the following abbreviations can be used:
 *   - Basal treatments: "gla x", "det x", "tou x", "deg x".
 *   - Cortisone treatments: "pro x", "pre x".
 *   - Alcohol-based treatments: "alc x", "bee x".
 *   Please adhere to these conventions when using the 'notes' field.
 */
export type AnnouncementTreatment = {
	created_at: TypeDateISO;
	eventType: 'Announcement';
	notes: string;
};
/**
 * Represents treatment data.
 */
export type NSTreatment =
	| MealBolusTreatment
	| ProfileSwitchTreatment
	| TempBasalTreatment
	| CarbCorrectionTreatment
	| AnnouncementTreatment;

export const isMealBolusTreatment = (
	treatment: NSTreatment,
): treatment is MealBolusTreatment => treatment.eventType === 'Meal Bolus';

export const isAnnouncementTreatment = (
	treatment: NSTreatment,
): treatment is AnnouncementTreatment => treatment.eventType === 'Announcement';

export const isCarbsTreatment = (
	treatment: NSTreatment,
): treatment is MealBolusTreatment | CarbCorrectionTreatment =>
	treatment.eventType === 'Meal Bolus' ||
	treatment.eventType === 'Carb Correction';

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
 * Represents environmental parameters.
 */
export type EnvParam = {
	CR: string;
	ISF: string;
	CARBS_ABS_TIME: string;
	TP: string;
	DIA: string;
	WEIGHT: string;
	SEED?: string;
	AGE: string;
	GENDER: GenderType;
};

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

/**
 * Represents main parameters for a UVA simulation.
 */
export type MainParamsUVA = {
	env: {
		WEIGHT: string;
		AGE: string;
		GENDER: GenderType;
	};
	treatments: NSTreatment[];
	profiles: NSProfile[];
	lastState: UvaPatientState;
	entries: Sgv[];
	pumpEnabled: boolean;
	activities?: Activity[];
	user: UserParams;
	defaultPatient: UvaPatientType;
};

/**
 * Represents main parameters for a simulation.
 */
export type MainParams = {
	env: EnvParam;
	entries: Sgv[];
	treatments: NSTreatment[];
	profiles: NSProfile[];
	pumpEnabled?: boolean;
	activities?: Activity[];
	user: UserParams;
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
	/**
	 * Glucose in plasma
	 */
	Gp: number;
	G?: number;
};

/**
 * Represents user parameters for a UVA simulation.
 */
export type UvaUserParams = {
	// meal: number,
	iir: number;
	ibolus: number;
	carbs: number;
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
	/**
	 * Glucose in plasma
	 */
	Gp: number;
	/**
	 * Glucose in tissue
	 */
	Gt: number;
	/**
	 * Insulin delay compartment 1
	 */
	I_: number;
	/**
	 * Insulin in liver
	 */
	Il: number;
	/**
	 * Insulin in plasma
	 */
	Ip: number;
	/**
	 * Subcutaneous insulin in compartment 1
	 */
	Isc1: number;
	/**
	 * Subcutaneous insulin in compartment 2
	 */
	Isc2: number;
	/**
	 * Glucose mass in intestine
	 */
	Qgut: number;
	/**
	 * Carbs in stomach, solid phase
	 */
	Qsto1: number;
	/**
	 * Carbs in stomach, liquid phase
	 */
	Qsto2: number;
	/**
	 * Insulin in the interstitial fluid
	 */
	X: number;
	/**
	 * Insulin delay compartment 2
	 */
	XL: number;
	/**
	 * Increased energy consumption estimated through heart rate
	 */
	Y: number;
	/**
	 * Exercise-induced changes in insulin sensitivity
	 */
	Z: number;
	/**
	 *
	 */
	W: number;
};
/**
 * Represents parameters for a UVA simulation.
 */
export type UvaPatientType = {
	/**
	 * Body weight.
	 */
	BW: number;
	/**
	 * Steady-state of glucose in plasma.
	 */
	Gpeq: number;
	/**
	 * Heart rate at rest.
	 */
	HRb: number;
	/**
	 * Maximal heart rate (220-age).
	 */
	HRmax: number; //220-age
	/**
	 * Distribution volume of glucose.
	 */
	VG: number;
	/**
	 * Rate parameter from Gp to Gt.
	 */
	k1: number;
	/**
	 * Rate parameter from Gt to Gp.
	 */
	k2: number;
	/**
	 * Distribution volume of insulin.
	 */
	VI: number;
	/**
	 * Rate parameter from Il to Ip.
	 */
	m1: number;
	/**
	 * Rate parameter from Ip to Il.
	 */
	m2: number;
	/**
	 * Rate parameter from Ip to periphery.
	 */
	m4: number;
	/**
	 * Rate parameter of hepatic extraction (slope).
	 */
	m5: number;
	/**
	 * Rate parameter of hepatic extraction (offset).
	 */
	m6: number;
	/**
	 * Steady-state hepatic extraction of insulin.
	 */
	HEeq: number;
	/**
	 * Maximal emptying rate of stomach.
	 */
	kmax: number;
	/**
	 * Minimal emptying rate of stomach.
	 */
	kmin: number;
	/**
	 * Rate constant of intestinal absorption.
	 */
	kabs: number;
	/**
	 * Rate of grinding.
	 */
	kgri: number;
	/**
	 * Fraction of intestinal absorption.
	 */
	f: number;
	/**
	 * Extrapolated at zero glucose and insulin.
	 */
	kp1: number;
	/**
	 * Liver glucose effectiveness.
	 */
	kp2: number;
	/**
	 * Amplitude of insulin action on the liver.
	 */
	kp3: number;
	/**
	 * Amplitude of portal insulin action on the liver.
	 */
	kp4: number;
	/**
	 * Delay between insulin signal and insulin action.
	 */
	ki: number;
	/**
	 * Glucose uptake by the brain and erythrocytes.
	 */
	Fcns: number;
	/**
	 * Michaelis-Menten constant (offset).
	 */
	Vm0: number;
	/**
	 * Michaelis-Menten constant (slope).
	 */
	Vmx: number;
	/**
	 * Michaelis-Menten constant (offset).
	 */
	Km0: number;
	/**
	 * Insulin action on the peripheral glucose utilization.
	 */
	p2u: number;
	/**
	 * Glomerular filtration rate.
	 */
	ke1: number;
	/**
	 * Renal threshold of glucose.
	 */
	ke2: number;
	/**
	 * Rate constant of nonmonomeric insulin absorption.
	 */
	ka1: number; // [Dalla Man, JDST, 2007]
	/**
	 * Rate constant of monomeric insulin absorption.
	 */
	ka2: number; // [Dalla Man, JDST, 2007]
	/**
	 * Rate constant of insulin dissociation.
	 */
	kd: number;
	/**
	 * Factor for exercise-induced increase in insulin sensitivity
	 */
	A: number; // [Dalla Man, JDST, 2009]
	/**
	 * Factor for exercise-induced increase in insulin-independent glucose clearance
	 */
	beta: number; // [Dalla Man, JDST, 2009]
	/**
	 * Factor for exercise-induced increase in glucose uptake
	 */
	gamma: number; // [Dalla Man, JDST, 2009]
	/**
	 * Parameter for calculating Z
	 */
	a: number; // [Dalla Man, JDST, 2009]
	/**
	 * Time constant for Y
	 */
	Thr: number; // [Dalla Man, JDST, 2009]
	/**
	 * Time constant for Z
	 */
	Tin: number; // [Dalla Man, JDST, 2009]
	/**
	 * Time constant for Z
	 */
	Tex: number; // [Dalla Man, JDST, 2009]
	/**
	 * Parameter for calculating Z
	 */
	n: number; // [Dalla Man, JDST, 2009]
};
