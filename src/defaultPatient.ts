import { UvaPatientType } from './Types';

// physiological model of virtual patient
export const defaultPatient: UvaPatientType = {
	BW: 75,
	Gpeq: 100,
	HRb: 60,
	HRmax: 197,
	VG: 1.88,
	k1: 0.065,
	k2: 0.079,
	VI: 0.05,
	m1: 0.19,
	m2: 0.484,
	m4: 0.194,
	m5: 0.0304,
	m6: 0.6471,
	HEeq: 0.6,
	kmax: 0.0558,
	kmin: 0.008,
	kabs: 0.057,
	kgri: 0.0558,
	f: 0.9,
	kp1: 2.7,
	kp2: 0.0021,
	kp3: 0.009,
	kp4: 0.0618,
	ki: 0.0079,
	Fcns: 1, //
	Vm0: 2.5,
	Vmx: 0.047,
	Km0: 225.59,
	p2u: 0.0331,
	ke1: 0.0005,
	ke2: 339, //
	ka1: 0.0018,
	ka2: 0.0182,
	kd: 0.0164,
	A: 0.0003,
	beta: 0.01,
	gamma: 1e-7,
	a: 0.1,
	Thr: 5, //
	Tin: 1, //
	Tex: 600, //
	n: 4,
};
