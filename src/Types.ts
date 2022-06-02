export type Direction = 'DoubleDown' | 'SingleDown' | 'FortyFiveDown' | 'Flat' | 'FortyFiveUp' | 'SingleUp' | 'DoubleUp';

export type Perlin = {
	noise: number,
	order: number,
	time: number
}

export type Drug = {
	time: number;
	drug: string;
	notes: string;
	insulin: number;
	empty_space: any;
}

export type Note = {
	type: 'Note',
	notes:string,	
}
export type Activity = {
	steps: number,
	created_at: string,
}
export type Sgv = {
	mills: number;
	sgv: number;
};

export type EntryValueType = {
	sgv: number;
	direction: string;

}
export type Entry = EntryValueType & {
	date: number;
	type: 'sgv';
};

export type Profile = {

}

export type Treatment = {
	absolute?: any;
	duration?: number;
	eventType?: string;
	insulin?: number;
	notes?: string;
	created_at: string;
	carbs: number;

};

export type TreatmentDelta = (Treatment & {
	minutesAgo: number;
	drug?: string;
});


export type EnvParam = {
	CR: string;
	ISF: string;
	CARBS_ABS_TIME: string;
	TP: string;
	DIA: string;
	WEIGHT: string;
	SEED?: string;
};
export type CGMSimParams = { basalActivity: number; liverActivity: number; carbsActivity: number; bolusActivity: number }
export type MainParams = {
	env: EnvParam;
	entries: Sgv[];
	treatments: Treatment[],
	profiles: Profile[],
	pumpBasals?: {}[]
};