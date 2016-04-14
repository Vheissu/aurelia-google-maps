System.register([], function (_export) {
    'use strict';

    var Configure;

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    return {
        setters: [],
        execute: function () {
            Configure = (function () {
                function Configure() {
                    _classCallCheck(this, Configure);

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
            })();

            _export('Configure', Configure);
        }
    };
});