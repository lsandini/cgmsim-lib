import { TreatmentDelta } from './Types';
export default function carbs(carbsAbs: number, lastMeals: Pick<TreatmentDelta, 'carbs' | 'minutesAgo'>[]): number;
