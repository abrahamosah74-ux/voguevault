export declare const config: {
    server: {
        port: string | number;
        nodeEnv: string;
        host: string;
    };
    database: {
        postgresql: {
            host: string;
            port: number;
            username: string;
            password: string;
            database: string;
            ssl: boolean;
            logging: boolean;
        };
        mongodb: {
            uri: string;
            options: {
                retryWrites: boolean;
                w: string;
                connectTimeoutMS: number;
                socketTimeoutMS: number;
            };
        };
    };
    jwt: {
        accessTokenSecret: string;
        refreshTokenSecret: string;
        accessTokenExpiry: string;
        refreshTokenExpiry: string;
    };
    email: {
        provider: string;
        from: string;
        sendgrid: {
            apiKey: string | undefined;
        };
        smtp: {
            host: string | undefined;
            port: number;
            username: string | undefined;
            password: string | undefined;
            secure: boolean;
        };
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
    };
    storage: {
        type: string;
        cloudinary: {
            cloudName: string | undefined;
            apiKey: string | undefined;
            apiSecret: string | undefined;
        };
        s3: {
            region: string;
            accessKeyId: string | undefined;
            secretAccessKey: string | undefined;
            bucket: string | undefined;
        };
    };
    payment: {
        provider: string;
        stripe: {
            publishableKey: string | undefined;
            secretKey: string | undefined;
            webhookSecret: string | undefined;
        };
        paypal: {
            clientId: string | undefined;
            clientSecret: string | undefined;
            mode: string;
        };
    };
    logging: {
        level: string;
        format: string;
        directory: string;
    };
    cors: {
        origin: string[];
        credentials: boolean;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    services: {
        userService: {
            url: string;
        };
        productService: {
            url: string;
        };
        orderService: {
            url: string;
        };
        mediaService: {
            url: string;
        };
    };
    features: {
        enableAR: boolean;
        enableAI: boolean;
        enableNotifications: boolean;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map