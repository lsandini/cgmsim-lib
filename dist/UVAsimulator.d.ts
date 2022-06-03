import { MainParamsUVA } from './Types';
declare const simulator: ({ env, treatments, profiles: profile, lastState, entries }: MainParamsUVA) => {
    x: import("./Types").PatientUvaState;
    y: {
        Gp: number;
    };
};
export default simulator;
