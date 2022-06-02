import { Activity, Entry, Note } from "./Types";
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
export declare function isHttps(str: any): boolean;
export declare function removeTrailingSlash(str: any): any;
export declare function getInsulinActivity(peakMin: number, durationMin: number, timeMin: number, insulin: number): number;
export declare const getDeltaMinutes: (mills: number | string) => number;
export declare function uploadBase(cgmsim: Entry | Activity | Note, nsUrlApi: string, apiSecret: string): any;
