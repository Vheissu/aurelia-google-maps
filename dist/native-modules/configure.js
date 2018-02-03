var Configure = (function () {
    function Configure() {
        this._config = {
            apiScript: 'https://maps.googleapis.com/maps/api/js',
            apiKey: '',
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
    Configure.prototype.options = function (obj) {
        Object.assign(this._config, obj, {
            markerCluster: Object.assign({}, this._config.markerCluster, obj.markerCluster)
        });
    };
    Configure.prototype.get = function (key) {
        return this._config[key];
    };
    Configure.prototype.set = function (key, val) {
        this._config[key] = val;
        return this._config[key];
    };
    return Configure;
}());
export { Configure };
//# sourceMappingURL=configure.js.map