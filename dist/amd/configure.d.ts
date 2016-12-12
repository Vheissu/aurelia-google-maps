export interface ConfigInterface {
    apiScript: string;
    apiKey: string;
    apiLibraries: string;
    options: any;
}
export declare class Configure {
    private _config;
    constructor();
    options(obj: ConfigInterface): void;
    get(key: string): any;
    set(key: string, val: any): any;
}
