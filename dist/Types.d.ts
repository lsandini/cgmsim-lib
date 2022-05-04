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
export declare type Sgv = {
    mills: number;
    sgv: number;
};
export declare type Profile = {};
export declare type Treatment = {
    insulin: number;
    notes: string;
    created_at: string;
    carbs: number;
    mills: number;
};
export declare type TreatmentDelta = (Treatment & {
    minutesAgo: number;
});
export declare type EnvParam = {
    CR: string;
    ISF: string;
    CARBS_ABS_TIME: string;
    TP: string;
    DIA: string;
    WEIGHT: string;
};
export declare type CGMSimParams = {
    det: number;
    gla: number;
    degludec: number;
    tou: number;
    liver: number;
    carbs: number;
    resultAct: any;
};
export declare type MainParams = {
    env: EnvParam;
    entries: Sgv[];
    treatments: Treatment[];
    profiles: Profile[];
    pumpBasals?: {}[];
};
