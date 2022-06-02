export default function (apiSecret: string, isHttps?: boolean): {
    getParams: {
        method: string;
        headers: {
            'Content-Type': string;
            'api-secret': any;
        };
        agent: any;
    };
    postParams: {
        method: string;
        headers: {
            'Content-Type': string;
            'api-secret': any;
        };
        agent: any;
    };
};
