export declare class GoogleMapsAPI {
    _scriptPromise: Promise<void>;
    private config;
    constructor(config: any);
    getMapsInstance(): false | Promise<void>;
}
