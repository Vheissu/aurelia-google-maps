System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Configure;
    return {
        setters:[],
        execute: function() {
            Configure = (function () {
                function Configure() {
                    this._config = {
                        apiScript: 'https://maps.googleapis.com/maps/api/js',
                        apiKey: '',
                        apiLibraries: ''
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
            exports_1("Configure", Configure);
        }
    }
});
//# sourceMappingURL=configure.js.map