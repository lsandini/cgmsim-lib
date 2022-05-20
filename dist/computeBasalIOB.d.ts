import { TreatmentDelta, Treatment } from './Types';
export declare const computeBasalActivity: (treatments: (TreatmentDelta & {
    duration: number;
    peak: number;
})[]) => number;
export default function (treatments: Treatment[], weight: number): number;
