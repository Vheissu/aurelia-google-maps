export interface ConfigInterface {
    apiScript: string;
    apiKey: string;
    apiLibraries: string;
    options: any;
}

export class Configure {
    private _config: any;

    constructor() {
        this._config = {
            apiScript: 'https://maps.googleapis.com/maps/api/js',
            apiKey: '',
            apiLibraries: '',
            region:'',
            language:'',
            options: {}
        };
    }

    options(obj: ConfigInterface) {
        Object.assign(this._config, obj);
    }

    get(key: string) {
        return this._config[key];
    }

    set(key: string, val: any) {
        this._config[key] = val;
        return this._config[key];
    }
}
