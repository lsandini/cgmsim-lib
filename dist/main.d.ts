import { MainParams } from './Types';
declare const main: ({ env, entries, treatments, profiles, pumpBasals }: MainParams) => {
    direction: import("./Types").Direction;
    dateString: Date;
    sgv: number;
    type: string;
    date: number;
};
export default main;
