'use strict';

System.register(['./configure'], function (_export, _context) {
    var Configure;
    return {
        setters: [function (_configure) {
            Configure = _configure.Configure;
        }],
        execute: function () {
            function configure(aurelia, configCallback) {
                var instance = aurelia.container.get(Configure);

                if (configCallback !== undefined && typeof configCallback === 'function') {
                    configCallback(instance);
                }

                aurelia.globalResources('./google-maps');
            }

            _export('configure', configure);
        }
    };
});