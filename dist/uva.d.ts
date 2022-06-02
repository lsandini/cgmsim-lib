import { PatientUvaState, UvaParametersType } from "./Types";
export declare class PatientUva {
    readonly inputList: ["meal", "iir", "ibolus"];
    readonly outputList: ["G"];
    readonly signalList: ["RaI", "E", "EGP", "Uid", "Uii", "I", "Qsto", "Ra", "S", "HE", "m3"];
    defaultParameters: UvaParametersType;
    parameters: UvaParametersType;
    parameterList: string[];
    xeq: PatientUvaState;
    stateList: string[];
    IIReq: number;
    constructor(parameters: any);
    setParameters(parameters: any): void;
    computeSteadyState(): void;
    getInitialState(): PatientUvaState;
    getDerivatives(_t: any, x: any, u: any): {};
    getOutputs(_t: any, x: any, _u: any): {
        Gp: number;
    };
}
