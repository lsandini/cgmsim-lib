import { Activity, Sgv } from "./Types";
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
export declare function InsulinActivity(peak: number, duration: number, hoursAgo: number, insulin: number): {
    S: number;
    tau: number;
    activity: number;
};
export declare const getDeltaMinutes: (mills: number | string) => number;
export declare function uploadBase(cgmsim: Sgv | Activity, api_url: string, apiSecret: string): any;
