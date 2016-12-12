define(["require", "exports", "./configure", "./google-maps"], function (require, exports, configure_1, google_maps_1) {
    "use strict";
    exports.Configure = configure_1.Configure;
    exports.GoogleMaps = google_maps_1.GoogleMaps;
    function configure(aurelia, configCallback) {
        var instance = aurelia.container.get(configure_1.Configure);
        // Do we have a callback function?
        if (configCallback !== undefined && typeof (configCallback) === 'function') {
            configCallback(instance);
        }
        aurelia.globalResources([
            './google-maps'
        ]);
    }
    exports.configure = configure;
});
