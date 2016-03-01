define(['exports', './configure'], function (exports, _configure) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    exports.configure = configure;

    function configure(aurelia, configCallback) {
        var instance = aurelia.container.get(_configure.Configure);

        if (configCallback !== undefined && typeof configCallback === 'function') {
            configCallback(instance);
        }

        aurelia.globalResources('./google-maps');
    }
});