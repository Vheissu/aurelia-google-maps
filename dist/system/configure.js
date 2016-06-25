'use strict';

System.register([], function (_export, _context) {
    "use strict";

    var Configure;

    

    return {
        setters: [],
        execute: function () {
            _export('Configure', Configure = function () {
                function Configure() {
                    

                    this._config = {
                        apiScript: 'https://maps.googleapis.com/maps/api/js',
                        apiKey: '',
                        apiLibraries: ''
                    };
                }

                Configure.prototype.options = function options(obj) {
                    Object.assign(this._config, obj);
                };

                Configure.prototype.get = function get(key) {
                    return this._config[key];
                };

                Configure.prototype.set = function set(key, val) {
                    this._config[key] = val;
                    return this._config[key];
                };

                return Configure;
            }());

            _export('Configure', Configure);
        }
    };
});