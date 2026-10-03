/* This file is part of LoopInsighT1, an open source tool to
   simulate closed-loop glycemic control in type 1 diabetes.
   Distributed under the MIT software license.
   See https://lt1.org for further information.	*/

import { UvaPatientState, UvaOutput, UvaPatientType, UvaUserParams } from '../types';

const pmol_per_U = 6000;
export class PatientUva {
	readonly inputList: ['meal', 'iir', 'ibolus'];
	readonly outputList: ['G'];
	readonly signalList: ['RaI', 'E', 'EGP', 'Uid', 'Uii', 'I', 'Qsto', 'Ra', 'S', 'HE', 'm3'];
	defaultParameters: UvaPatientType;
	parameters: UvaPatientType;
	parameterList: string[];
	xeq: UvaPatientState;
	IIReq: number;

	constructor(parameters: UvaPatientType) {
		this.defaultParameters = parameters;
		this.parameters = Object.assign({}, this.defaultParameters);
		this.parameterList = Object.keys(this.defaultParameters);
		this.xeq = this.computeSteadyState(this.defaultParameters, 0, 100);
		this.IIReq =
			this.computeSteadyState(this.defaultParameters, 0, 100).Isc1 *
			(this.defaultParameters.ka1 + this.defaultParameters.ka2);
	}

	computeSteadyState(params: UvaPatientType, uMeal: number, Gpeq: number): UvaPatientState {
		const Gp = Gpeq;
		const Gt = Gpeq;
		const I_ = 0;
		const Il = 0;
		const Ip = 0;
		const Isc1 = 0;
		const Isc2 = 0;
		const Qgut = 0;
		const Qsto1 = 0;
		const Qsto2 = 0;
		const W = 0;
		const X = 0;
		const XL = 0;
		const Y = 0;
		const Z = 0;

		return {
			Gp,
			Gt,
			I_,
			Il,
			Ip,
			Isc1,
			Isc2,
			Qgut,
			Qsto1,
			Qsto2,
			W,
			X,
			XL,
			Y,
			Z,
		};
	}

	derivatives(t: number, x: UvaPatientState, u: UvaUserParams): UvaPatientState {
		const p = this.parameters;
		const d_Gp = -p.k1 * x.Gp + p.k2 * x.Gt;
		const d_Gt = p.k1 * x.Gp - p.k2 * x.Gt;
		return {
			Gp: d_Gp,
			Gt: d_Gt,
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
		};
	}

	output(t: number, x: UvaPatientState): UvaOutput {
		return {
			Gp: x.Gp,
			G: x.Gp / (this.parameters.VG * 10),
		};
	}
}

export default PatientUva;
