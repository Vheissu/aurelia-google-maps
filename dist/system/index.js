System.register(["./configure", "./google-maps"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
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
    exports_1("configure", configure);
    var configure_1, google_maps_1;
    return {
        setters: [
            function (configure_1_1) {
                configure_1 = configure_1_1;
            },
            function (google_maps_1_1) {
                google_maps_1 = google_maps_1_1;
            }
        ],
        execute: function () {
            exports_1("Configure", configure_1.Configure);
            exports_1("GoogleMaps", google_maps_1.GoogleMaps);
        }
    };
});
