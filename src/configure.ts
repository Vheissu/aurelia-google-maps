export interface ConfigInterface {
    apiScript: string;
    apiKey: string;
    client?: string,
    apiLibraries: string;
    options: any;
    markerCluster: {enable: boolean, src?: string, imagePath?: string, imageExtension?: string}
}

export class Configure {
    private _config: any;

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

    options(obj: ConfigInterface) {
        Object.assign(this._config, obj, {
            markerCluster: Object.assign({}, this._config.markerCluster, obj.markerCluster)
        });
    }

    get(key: string) {
        return this._config[key];
    }

    set(key: string, val: any) {
        this._config[key] = val;
        return this._config[key];
    }
}
