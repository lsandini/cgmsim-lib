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

export type Sgv = {
	mills: number;
	sgv: number;
};

export type Profile = {

}

export type Treatment = {
	insulin: number;
	notes: string;
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
};
export type CGMSimParams = { det: number; gla: number; degludec: number; tou: number; liver: number; carbs: number; resultAct }
export type MainParams = {
	env: EnvParam;
	entries: Sgv[];
	treatments: Treatment[],
	profiles: Profile[],
	pumpBasals?: {}[]
};