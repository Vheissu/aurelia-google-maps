export class Configure {
    _config;
    constructor() {
        this._config = {
            apiScript: 'https://maps.googleapis.com/maps/api/js',
            apiKey: '',
            client: '',
            apiLibraries: '',
            region: '',
            language: '',
            options: {},
            markerCluster: {
                enable: false,
                src: 'https://cdn.rawgit.com/googlemaps/v3-utility-library/99a385c1/markerclusterer/src/markerclusterer.js',
                imagePath: 'https://raw.githubusercontent.com/googlemaps/v3-utility-library/99a385c1/markerclusterer/images/m',
                imageExtension: 'png',
            }
        };
    }
    options(obj) {
        Object.assign(this._config, obj, {
            markerCluster: Object.assign({}, this._config.markerCluster, obj.markerCluster)
        });
    }
    get(key) {
        return this._config[key];
    }
    set(key, val) {
        this._config[key] = val;
        return this._config[key];
    }
}
//# sourceMappingURL=configure.js.map