import { MainParams } from './Types';
declare const simulator: ({ env, entries, treatments, profiles, pumpBasals }: MainParams) => {
    direction: import("./Types").Direction;
    sgv: number;
    deltaMinutes: number;
    carbsActivity: number;
    basalActivity: number;
    bolusActivity: number;
    liverActivity: number;
    pumpBasalActivity: number;
    noiseActivity: number;
};
export default simulator;
