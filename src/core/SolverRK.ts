import { UvaPatientState } from './types';

// Classical fixed-step Runge-Kutta solver
export function RK4(
	derivatives: (time: number, state: UvaPatientState) => UvaPatientState,
	t: number,
	x: UvaPatientState,
	dt: number,
) {
	const k1 = timesScalar(derivatives(t, x), dt);
	const k2 = timesScalar(derivatives(t + dt / 2, vectorSum([x, timesScalar(k1, 1 / 2)])), dt);
	const k3 = timesScalar(derivatives(t + dt / 2, vectorSum([x, timesScalar(k2, 1 / 2)])), dt);
	const k4 = timesScalar(derivatives(t + dt, vectorSum([x, k3])), dt);

	return vectorSum([x, timesScalar(k1, 1 / 6), timesScalar(k2, 1 / 3), timesScalar(k3, 1 / 3), timesScalar(k4, 1 / 6)]);
}

function vectorSum(X: UvaPatientState[]): UvaPatientState {
	return X.reduce<UvaPatientState>(
		(a, b) => {
			for (const k in b) {
				if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = (a[k] || 0) + b[k];
			}
			return a;
		},
		{
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
		},
	);
}

function timesScalar(X: UvaPatientState, a: number): UvaPatientState {
	const clone = Object.assign({}, X);
	for (const property in clone) {
		clone[property] = clone[property] * a;
	}
	return clone;
}

export default RK4;
