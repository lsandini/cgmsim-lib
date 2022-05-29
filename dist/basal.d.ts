import { TreatmentDelta, Treatment } from './Types';
export declare const peakBasal: {
    GLA: (duration: number) => number;
    DET: (duration: number) => number;
    TOU: (duration: number) => number;
    DEG: (duration: number) => number;
};
export declare const durationBasal: {
    GLA: (insulin: number, weight: number) => number;
    DET: (insulin: number, weight: number) => number;
    TOU: (insulin: number, weight: number) => number;
    DEG: () => number;
};
export declare const computeBasalActivity: (treatments: (TreatmentDelta & {
    duration: number;
    peak: number;
})[]) => number;
export default function (treatments: Treatment[], weight: number): number;
