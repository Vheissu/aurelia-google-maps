export class Configure {

    constructor() {
        this._config = {
            apiScript: 'https://maps.googleapis.com/maps/api/js',
            apiKey: '',
            apiLibraries: ''
        };
    }

    options(obj) {
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
