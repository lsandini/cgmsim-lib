import { Activity, Note, Sgv } from "./Types";
declare const logger: import("pino").Logger<{
    level: string;
    transport: {
        target: string;
        options: {
            colorize: boolean;
        };
    };
}>;
export default logger;
export declare function getInsulinActivity(peakMin: number, durationMin: number, timeMin: number, insulin: number): number;
export declare const getDeltaMinutes: (mills: number | string) => number;
export declare function uploadBase(cgmsim: Sgv | Activity | Note, api_url: string, apiSecret: string): any;
