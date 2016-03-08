System.register(['./configure'], function (_export) {
    'use strict';

    var Configure;

    _export('configure', configure);

    function configure(aurelia, configCallback) {
        var instance = aurelia.container.get(Configure);

        if (configCallback !== undefined && typeof configCallback === 'function') {
            configCallback(instance);
        }

        aurelia.globalResources('./google-maps');
    }

    return {
        setters: [function (_configure) {
            Configure = _configure.Configure;
        }],
        execute: function () {}
    };
});