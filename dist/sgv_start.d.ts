import { CGMSimParams, Perlin, Sgv } from './Types';
declare const sgv_start: (entries: Sgv[], { det, gla, degludec, tou, liver, carbs, resultAct }: CGMSimParams, perls: Perlin[], isf: number) => {
    dateString: Date;
    sgv: number;
    type: string;
    date: number;
};
export default sgv_start;
