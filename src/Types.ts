export type Direction =
	| 'DoubleDown'
	| 'SingleDown'
	| 'FortyFiveDown'
	| 'Flat'
	| 'FortyFiveUp'
	| 'SingleUp'
	| 'DoubleUp';

export type Drug = {
	time: number;
	drug: string;
	notes: string;
	insulin: number;
	empty_space: any;
};

export type Note = {
	type: 'Note';
	notes: string;
};
export type Activity = {
	steps?: number;
	heartRate?: number;
	created_at: string;
};
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

export type Profile = {
	startDate: string;
	defaultProfile: string;
	store: {
		[profileName: string]: ProfileParams;
	};
};

export type Treatment = {
	absolute?: any;
	duration?: number;
	eventType?: string;
	insulin?: number;
	notes?: string;
	created_at: string;
	carbs?: number;
};

export type TreatmentDelta = Treatment & {
	minutesAgo: number;
	drug?: string;
};

export type GenderType = 'Male' | 'Female';

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
export type CGMSimParams = {
	basalActivity: number;
	liverActivity: number;
	carbsActivity: number;
	bolusActivity: number;
};
export type UserParams = {
	nsUrl: string;
};
export type MainParamsUVA = {
	env: {
		WEIGHT: string;
		AGE: string;
		GENDER: GenderType;
	};
	treatments: Treatment[];
	profiles: Profile[];
	lastState: UvaPatientState;
	entries: Sgv[];
	pumpEnabled: boolean;
	activities?: Activity[];
	user: UserParams;
};
export type MainParams = {
	env: EnvParam;
	entries: Sgv[];
	treatments: Treatment[];
	profiles: Profile[];
	pumpEnabled?: boolean;
	activities?: Activity[];
	user: UserParams;
};
export type SimulationResult = {
	sgv: number;
	deltaMinutes: number;
	carbsActivity: number;
	basalActivity: number;
	bolusActivity: number;
	liverActivity: number;
	activityFactor: number;
	isf: { dynamic: number; constant: number };
};

export type UvaOutput = {
	Gp: number;
	G?: number;
};
export type UvaUserParams = {
	// meal: number,
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

export type UvaParametersType = {
	BW: number;
	Gpeq: number;
	HRb: number;
	HRmax: number; //220-age

	VG: number; // [Dalla Man, IEEE TBME, 2007]
	k1: number; // [Dalla Man, IEEE TBME, 2007]
	k2: number; // [Dalla Man, IEEE TBME, 2007]
	VI: number; // [Dalla Man, IEEE TBME, 2007]
	m1: number; // [Dalla Man, IEEE TBME, 2007]
	m2: number; // [Dalla Man, IEEE TBME, 2007]
	m4: number; // [Dalla Man, IEEE TBME, 2007]
	m5: number; // [Dalla Man, IEEE TBME, 2007]
	m6: number; // [Dalla Man, IEEE TBME, 2007]
	HEeq: number; // [Dalla Man, IEEE TBME, 2007]
	kmax: number; // [Dalla Man, IEEE TBME, 2007]
	kmin: number; // [Dalla Man, IEEE TBME, 2007]
	kabs: number; // [Dalla Man, IEEE TBME, 2007]
	kgri: number; // [Dalla Man, IEEE TBME, 2007]
	f: number; // [Dalla Man, IEEE TBME, 2007]
	kp1: number; // [Dalla Man, IEEE TBME, 2007]
	kp2: number; // [Dalla Man, IEEE TBME, 2007]
	kp3: number; // [Dalla Man, IEEE TBME, 2007]
	kp4: number; // [Dalla Man, IEEE TBME, 2007]
	ki: number; // [Dalla Man, IEEE TBME, 2007]
	Fcns: number; // [Dalla Man, IEEE TBME, 2007]
	Vm0: number; // [Dalla Man, IEEE TBME, 2007]
	Vmx: number; // [Dalla Man, IEEE TBME, 2007]
	Km0: number; // [Dalla Man, IEEE TBME, 2007]
	p2u: number; // [Dalla Man, IEEE TBME, 2007]
	ke1: number; // [Dalla Man, IEEE TBME, 2007]
	ke2: number; // [Dalla Man, IEEE TBME, 2007]
	ka1: number; // [Dalla Man, JDST, 2007]
	ka2: number; // [Dalla Man, JDST, 2007]
	kd: number;
	A: number; // [Dalla Man, JDST, 2009]
	beta: number; // [Dalla Man, JDST, 2009]
	gamma: number; // [Dalla Man, JDST, 2009]
	a: number; // [Dalla Man, JDST, 2009]
	Thr: number; // [Dalla Man, JDST, 2009]
	Tin: number; // [Dalla Man, JDST, 2009]
	Tex: number; // [Dalla Man, JDST, 2009]
	n: number; // [Dalla Man, JDST, 2009]
};
