export declare type Direction = 'DoubleDown' | 'SingleDown' | 'FortyFiveDown' | 'Flat' | 'FortyFiveUp' | 'SingleUp' | 'DoubleUp';
export declare type Perlin = {
    noise: number;
    order: number;
    time: number;
};
export declare type Drug = {
    time: number;
    drug: string;
    notes: string;
    insulin: number;
    empty_space: any;
};
export declare type Activity = {
    steps: number;
    created_at: string;
};
export declare type Sgv = {
    mills: number;
    sgv: number;
};
export declare type Profile = {};
export declare type Treatment = {
    absolute?: any;
    duration?: number;
    eventType?: string;
    insulin?: number;
    notes?: string;
    created_at: string;
    carbs: number;
};
export declare type TreatmentDelta = (Treatment & {
    minutesAgo: number;
    drug?: string;
});
export declare type EnvParam = {
    CR: string;
    ISF: string;
    CARBS_ABS_TIME: string;
    TP: string;
    DIA: string;
    WEIGHT: string;
    SEED?: string;
};
export declare type CGMSimParams = {
    basalActivity: number;
    liverActivity: number;
    carbsActivity: number;
    bolusActivity: number;
};
export declare type MainParams = {
    env: EnvParam;
    entries: Sgv[];
    treatments: Treatment[];
    profiles: Profile[];
    pumpBasals?: {}[];
};
