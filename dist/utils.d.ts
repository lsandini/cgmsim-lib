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
export declare function Activity(peak: number, duration: number, hoursAgo: number, insulin: number): {
    S: number;
    tau: number;
    activity: number;
};
export declare const getDeltaMinutes: (mills: number | string) => number;
