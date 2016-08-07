export interface ConfigInterface {
    apiScript: string;
    apiKey: string;
    apiLibraries: string;
}

export class Configure {
    private _config: ConfigInterface;

    constructor() {
        this._config = {
            apiScript: 'https://maps.googleapis.com/maps/api/js',
            apiKey: '',
            apiLibraries: ''
        };
    }

    options(obj: ConfigInterface) {
        Object.assign(this._config, obj);
    }

    get(key) {
        return this._config[key];
    }

    set(key, val) {
        this._config[key] = val;
        return this._config[key];
    }
}
