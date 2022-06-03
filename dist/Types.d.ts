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
export declare type Note = {
    type: 'Note';
    notes: string;
};
export declare type Activity = {
    steps: number;
    created_at: string;
};
export declare type Sgv = {
    mills: number;
    sgv: number;
};
export declare type EntryValueType = {
    sgv: number;
    direction: string;
};
export declare type Entry = EntryValueType & {
    date: number;
    type: 'sgv';
};
export declare type ProfileParams = {
    basal: number | {
        value: number;
        time: string;
        timeAsSecond: number;
    }[];
};
export declare type Profile = {
    startDate: string;
    defaultProfile: string;
    store: {
        [profileName: string]: ProfileParams;
    };
};
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
export declare type MainParamsUVA = {
    env: {
        WEIGHT: string;
    };
    treatments: Treatment[];
    profile: Profile[];
    lastState: PatientUvaState;
    entries: Sgv[];
};
export declare type MainParams = {
    env: EnvParam;
    entries: Sgv[];
    treatments: Treatment[];
    profiles: Profile[];
    pumpBasals?: {}[];
};
export declare type InputPatientUvaState = {
    iir: number;
    ibolus: number;
    carbs: number;
    meal: number;
};
export declare type PatientUvaState = {
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
};
export declare type UvaParametersType = {
    BW: number;
    Gpeq: number;
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
};
