export interface ConfigInterface {
    apiScript: string;
    apiKey: string;
    apiLibraries: string;
}
export declare class Configure {
    private _config;
    constructor();
    options(obj: ConfigInterface): void;
    get(key: any): any;
    set(key: any, val: any): any;
}
