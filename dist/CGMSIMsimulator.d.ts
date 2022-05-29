import { MainParams } from './Types';
declare const simulator: ({ env, entries, treatments, profiles, pumpBasals }: MainParams) => {
    direction: import("./Types").Direction;
    dateString: Date;
    sgv: number;
    type: string;
    date: number;
};
export default simulator;
