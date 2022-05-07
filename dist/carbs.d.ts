import { TreatmentDelta } from './Types';
export default function carbs(carbsAbs: number, meals: Pick<TreatmentDelta, 'carbs' | 'minutesAgo'>[]): number;
