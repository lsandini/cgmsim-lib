/* This file is part of LoopInsighT1, an open source tool to
   simulate closed-loop glycemic control in type 1 diabetes.
   Distributed under the MIT software license.
   See https://lt1.org for further information.	*/

import {
	UvaPatientState,
	UvaOutput,
	UvaParametersType,
	UvaUserParams,
} from './Types';
import { defaultPatient } from './defaultPatient';

const pmol_per_U = 6000;
export class PatientUva {
	readonly inputList: ['meal', 'iir', 'ibolus'];
	readonly outputList: ['G'];
	readonly signalList: [
		'RaI',
		'E',
		'EGP',
		'Uid',
		'Uii',
		'I',
		'Qsto',
		'Ra',
		'S',
		'HE',
		'm3'
	];
	defaultParameters: UvaParametersType;
	parameters: UvaParametersType;
	parameterList: string[];
	xeq: UvaPatientState;
	IIReq: number;

	constructor(parameters: UvaParametersType) {
		// // list of inputs used by this model
		// this.inputList = ["meal", "iir", "ibolus"]

		// // list of outputs provided by this model
		// this.outputList = ["G"]

		// // list of intermediate signals
		// this.signalList = ["RaI", "E", "EGP", "Uid", "Uii", "I", "Qsto", "Ra", "S", "HE", "m3"]


		this.parameters = {...parameters };

		// extract full list of parameters
		this.parameterList = Object.keys(this.parameters);

		// compute equilibrium
		this.computeSteadyState();
	}

	// set or change parameters
	setParameters(parameters) {
		// import parameters
		for (const key in parameters) {
			this.parameters[key] = parameters[key];
		}
		this.computeSteadyState();
	}

	// compute equilibrium
	computeSteadyState() {
		const params = this.parameters;
		const Gpeq = params.Gpeq * params.VG; // convert from mg/dL to mg/kg

		// tissue glucose concentration
		const D =
			Math.pow(params.Vm0 - params.k1 * Gpeq + params.Km0 * params.k2, 2) +
			4 * params.k2 * params.Km0 * params.k1 * Gpeq;
		const Gteq =
			(-params.Vm0 + params.k1 * Gpeq - params.Km0 * params.k2 + Math.sqrt(D)) /
			2 /
			params.k2;
		const EGPeq = params.Fcns + params.k1 * Gpeq - params.k2 * Gteq;
		const XLeq = (params.kp1 - params.kp2 * Gpeq - EGPeq) / params.kp3;

		const Ipb = XLeq * params.VI;
		const m3eq = (params.HEeq * params.m1) / (1 - params.HEeq);
		const Ilb = (Ipb * params.m2) / (params.m1 + m3eq);
		const Raieq = (params.m2 + params.m4) * Ipb - params.m1 * Ilb;
		const Isceq = solve2x2LSE(
			[
				[params.ka1, params.ka2],
				[params.kd, -params.ka2],
			],
			[Raieq, 0]
		);
		const Isc1eq = Isceq[0];
		const Isc2eq = Isceq[1];

		this.IIReq =
			(Isc1eq * (params.kd + params.ka1) * params.BW * 60) / pmol_per_U; // pmol/min  -> U/h

		this.xeq = {
			Gp: Gpeq,
			Gt: Gteq,
			Ip: Ipb,
			Il: Ilb,
			Qsto1: 0,
			Qsto2: 0,
			Qgut: 0,
			XL: XLeq,
			I_: XLeq,
			X: 0,
			Isc1: Isc1eq,
			Isc2: Isc2eq,
			Y: 0,
			Z: 0,
			W: 0,
		};

		// verify equilibrium
		// console.log(this.derivatives(0, this.xeq, {carbs: 0, iir: this.IIReq, ibolus: 0}));

		// todo: Ipb and Ilb are not accurate
	}

	getInitialState() {
		return this.xeq;
	}

	getDerivatives(
		time: number,
		state: UvaPatientState,
		userParams: UvaUserParams
	): UvaPatientState {
		const params = this.parameters;

		// inputs
		const M = userParams.carbs * 1000; // meal ingestion in mg/min
		const IIR = (userParams.iir * pmol_per_U) / 60; // insulin infusion rate in pmol/min
		const bolus = userParams.ibolus * pmol_per_U; // insulin bolus in pmol
		const intensity = userParams.intensity;
		const HR = params.HRb + ((params.HRmax - params.HRb) * intensity) / 100;

		// plasma glucose concentration // [Dalla Man, JDST, 2014] (A1), [Dalla Man, IEEE TBME, 2007] (1)
		const G = state.Gp / params.VG; // in mg/dL

		// insulin-dependent glucose utilization // [Dalla Man, IEEE TBME, 2007] (15), special case of risk=0 according to [Dalla Man, JDST, 2014] (A10)
		//		const Uid = (params.Vm0 + params.Vmx * state.X) * state.Gt / (params.Km0 + state.Gt);	// in mg/kg/min
		if (Math.round(state.Z * 10) == 0) {
			//reset W when Z comes back to zero
			state.W = 0;
		}

		// insulin-dependent glucose utilization with exercise [Dalla Man, JDST, 2009] (12)
		const Uid =
			((params.Vm0 * (1 + params.beta * state.Y) +
				params.Vmx *
					(1 + params.A * state.Z * state.W) *
					(state.X + this.xeq.Ip / params.VI) -
				(params.Vmx * this.xeq.Ip) / params.VI) *
				state.Gt) /
			(params.Km0 *
				(1 -
					params.gamma *
						state.Z *
						state.W *
						(state.X + this.xeq.Ip / params.VI)) +
				state.Gt); // in mg/kg/min

		// insulin-independent glucose utilization	// [Dalla Man, JDST, 2014] (A9), [Dalla Man, IEEE TBME, 2007] (14)
		const Uii = params.Fcns; // in mg/kg/min

		// plasma insulin concentration // [Dalla Man, JDST, 2014] (A2), [Dalla Man, IEEE TBME, 2007] (3)
		const I = state.Ip / params.VI; // in pmol/L

		// amount of glucose in the stomach // [Dalla Man, JDST, 2014] (A3), [Dalla Man, IEEE TBME, 2007] (13)
		const Qsto = state.Qsto1 + state.Qsto2; // in mg

		// appearance rate of glucose in plasma // [Dalla Man, JDST, 2014] (A3), [Dalla Man, IEEE TBME, 2007] (13)
		const Ra = (params.f * params.kabs * state.Qgut) / params.BW; // in mg/kg/min

		// endogenous glucose production // [Dalla Man, JDST, 2014] (A5), [Dalla Man, IEEE TBME, 2007] (10) (Ipo = 0)
		const EGP = Math.max(
			0,
			params.kp1 - params.kp2 * state.Gp - params.kp3 * state.XL
		); // in mg/kg/min

		// renal glucose excretion // [Dalla Man, JDST, 2014] (A14), [Dalla Man, IEEE TBME, 2007] (27)
		const E = Math.max(params.ke1 * (state.Gp - params.ke2), 0); // in mg/kg/min

		// insulin appearance rate // [Dalla Man, JDST, 2014] (A15)
		const Rai = params.ka1 * state.Isc1 + params.ka2 * state.Isc2; // in pmol/kg/min

		// insulin secretion // [Dalla Man, IEEE TBME, 2007] (8)
		const m3eq = (params.HEeq * params.m1) / (1 - params.HEeq);
		const S = m3eq * state.Il + params.m4 * state.Ip; // in pmol/kg/min
		// hepatic extraction // [Dalla Man, IEEE TBME, 2007] (4)
		// HE is truncated between 0 and 0.9 to avoid singularity
		const HE = Math.min(0.9, Math.max(0, -params.m5 * S + params.m6));
		// rate constant of insulin degradation in the liver // [Dalla Man, IEEE TBME, 2007] (5)
		const m3 = (params.m1 * HE) / (1 - HE); // in 1/min

		// //[Dalla Man, JDST, 2009] (9)
		let f_Y =
			Math.pow((state.Y / params.a) * params.HRb, params.n) /
			(1 + Math.pow((state.Y / params.a) * params.HRb, params.n));

		// rate constant of gastric emptying - simplified placeholder
		// *** todo: replace with better model as described in [Dalla Man, IEEE TBME, 2006]
		const kempt = (params.kmax + params.kmin) / 2; // in 1/min

		// declare vector of derivatives dx/dt
		return {
			// Gp [Dalla Man, JDST, 2014] (A1), [Dalla Man, IEEE TBME, 2007] (1)
			Gp: EGP + Ra - Uii - E - params.k1 * state.Gp + params.k2 * state.Gt,

			// Gt [Dalla Man, JDST, 2014] (A1), [Dalla Man, IEEE TBME, 2007] (1)
			Gt: -Uid + params.k1 * state.Gp - params.k2 * state.Gt,

			// Ip [Dalla Man, JDST, 2014] (A2)
			Ip: -(params.m2 + params.m4) * state.Ip + params.m1 * state.Il + Rai,

			// Il [Dalla Man, JDST, 2014] (A2)
			Il: params.m2 * state.Ip - (params.m1 + m3) * state.Il,

			// Qsto1 [Dalla Man, JDST, 2014] (A3), [Dalla Man, IEEE TBME, 2007] (13)
			Qsto1: -params.kgri * state.Qsto1 + M,

			// Qsto2 [Dalla Man, JDST, 2014] (A3), [Dalla Man, IEEE TBME, 2007] (13)
			Qsto2: -kempt * state.Qsto2 + params.kgri * state.Qsto1,

			// Qgut [Dalla Man, JDST, 2014] (A3), [Dalla Man, IEEE TBME, 2007] (13)
			Qgut: -params.kabs * state.Qgut + kempt * state.Qsto2,

			// XL [Dalla Man, JDST, 2014] (A6), [Dalla Man, IEEE TBME, 2007] (11) (XL = Id)
			XL: -params.ki * (state.XL - state.I_),

			// I' [Dalla Man, JDST, 2014] (A7), [Dalla Man, IEEE TBME, 2007] (11) (I' = I1)
			I_: -params.ki * (state.I_ - I),

			// X [Dalla Man, JDST, 2014] (A11), [Dalla Man, IEEE TBME, 2007] (18)
			X: -params.p2u * state.X + params.p2u * (I - this.xeq.Ip / params.VI),

			// Isc1 [Dalla Man, JDST, 2014] (A16)
			Isc1: -(params.kd + params.ka1) * state.Isc1 + (IIR + bolus) / params.BW,

			// Isc2 [Dalla Man, JDST, 2014] (A16)
			Isc2: params.kd * state.Isc1 - params.ka2 * state.Isc2,

			// Y: higher glucose uptake due to exercise [Dalla Man, JDST, 2009] (7)
			Y: (-1 / params.Thr) * (state.Y - (HR - params.HRb)),

			// Z: changes in insulin after exercise due to exercise [Dalla Man, JDST, 2009] (8)
			Z: -(f_Y / params.Tin + 1 / params.Tex) * state.Z + f_Y, //f_Y(t)??

			// W [Dalla Man, JDST, 2009] (12)
			W: HR - params.HRb,
		};
	}

	// compute outputs (returns object)
	getOutputs(
		time: number,
		state: UvaPatientState,
		userParams: UvaUserParams
	): UvaOutput {
		return {
			Gp: state.Gp / this.parameters.VG,
		};
	}
}

// utility: solve n=2 linear system of equations
function solve2x2LSE(A, B) {
	const a = A[0][0];
	const b = A[0][1];
	const c = A[1][0];
	const d = A[1][1];

	const det = a * d - b * c;

	return [(+d * B[0] - b * B[1]) / det, (-c * B[0] + a * B[1]) / det];
}
