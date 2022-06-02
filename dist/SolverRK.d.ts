import { PatientUvaState } from "./Types";
/**
 *
 * @param {function} derivatives
 * @param {number} t
 * @param {number} x
 * @param {number} dt
 * @returns
 */
export declare function RK4(derivatives: Function, t: number, x: PatientUvaState, dt: number): any;
export default RK4;
