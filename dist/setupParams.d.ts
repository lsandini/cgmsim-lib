export default function (apiSecret: string): {
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
