var Configure = (function () {
    function Configure() {
        this._config = {
            apiScript: 'https://maps.googleapis.com/maps/api/js',
            apiKey: '',
            apiLibraries: '',
            options: {}
        };
    }
    Configure.prototype.options = function (obj) {
        Object.assign(this._config, obj);
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