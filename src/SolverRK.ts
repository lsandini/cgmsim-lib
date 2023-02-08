/* This file is part of LoopInsighT1, an open source tool to
   simulate closed-loop glycemic control in type 1 diabetes.
   Distributed under the MIT software license.
   See https://lt1.org for further information.	*/

import { UvaPatientState } from "./Types";


// classical fixed-step Runge-Kutta solver
//   derivatives(t,x): function that returns dx/dt
//   t, x: time and state
//   dt: time step
/**
 * 
 * @param {(time: number, state: UvaPatientState) => UvaPatientState} derivatives 
 * @param {number} t 
 * @param {number} x 
 * @param {number} dt 
 * @returns 
 */
export function RK4(derivatives: (time: number, state: UvaPatientState) => UvaPatientState, t: number, x: UvaPatientState, dt: number) {
	const k1 = timesScalar(derivatives(t, x), dt);
	const k2 = timesScalar(derivatives(t + dt / 2, vectorSum([x, timesScalar(k1, 1 / 2)])), dt);
	const k3 = timesScalar(derivatives(t + dt / 2, vectorSum([x, timesScalar(k2, 1 / 2)])), dt);
	const k4 = timesScalar(derivatives(t + dt, vectorSum([x, k3])), dt);

	return vectorSum([x, timesScalar(k1, 1 / 6), timesScalar(k2, 1 / 3), timesScalar(k3, 1 / 3), timesScalar(k4, 1 / 6)]);
}

// compute sum of n vectors
function vectorSum(X: UvaPatientState[]): UvaPatientState {
	return X.reduce<UvaPatientState>((a, b) => {
		for (const k in b) {
			if (b.hasOwnProperty(k))
				a[k] = (a[k] || 0) + b[k]
		}
		return a
	}, {
		Gp: 0,
		Gt: 0,
		I_: 0,
		Il: 0,
		Ip: 0,
		Isc1: 0,
		Isc2: 0,
		Qgut: 0,
		Qsto1: 0,
		Qsto2: 0,
		W: 0,
		X: 0,
		XL: 0,
		Y: 0,
		Z: 0,
	}
	)
}

// multiply state vector by scalar
function timesScalar(X: UvaPatientState, a: number): UvaPatientState {
	const clone = Object.assign({}, X);
	for (const property in clone) {
		clone[property] = clone[property] * a;
	}
	return clone;
}



export default RK4;