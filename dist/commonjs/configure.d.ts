export interface ConfigInterface {
    apiScript: string;
    apiKey: string;
    apiLibraries: string;
    options: any;
    markerCluster: {
        enable: boolean;
        src?: string;
        imagePath?: string;
        imageExtension?: string;
    };
}
export declare class Configure {
    private _config;
    constructor();
    options(obj: ConfigInterface): void;
    get(key: string): any;
    set(key: string, val: any): any;
}
