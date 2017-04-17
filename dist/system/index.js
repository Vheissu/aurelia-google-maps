System.register(["aurelia-pal", "./configure", "./google-maps", "./google-maps-api"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function configure(aurelia, configCallback) {
        var instance = aurelia.container.get(configure_1.Configure);
        aurelia_pal_1.DOM.injectStyles("google-map { display: block; height: 350px; }");
        if (configCallback !== undefined && typeof (configCallback) === 'function') {
            configCallback(instance);
        }
        aurelia.globalResources([
            aurelia_pal_1.PLATFORM.moduleName('./google-maps')
        ]);
    }
    exports_1("configure", configure);
    var aurelia_pal_1, configure_1, google_maps_1, google_maps_api_1;
    return {
        setters: [
            function (aurelia_pal_1_1) {
                aurelia_pal_1 = aurelia_pal_1_1;
            },
            function (configure_1_1) {
                configure_1 = configure_1_1;
            },
            function (google_maps_1_1) {
                google_maps_1 = google_maps_1_1;
            },
            function (google_maps_api_1_1) {
                google_maps_api_1 = google_maps_api_1_1;
            }
        ],
        execute: function () {
            exports_1("Configure", configure_1.Configure);
            exports_1("GoogleMaps", google_maps_1.GoogleMaps);
            exports_1("GoogleMapsAPI", google_maps_api_1.GoogleMapsAPI);
        }
    };
});
//# sourceMappingURL=index.js.map