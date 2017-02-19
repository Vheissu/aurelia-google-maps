define(["require", "exports", "aurelia-pal", "./configure", "./google-maps"], function (require, exports, aurelia_pal_1, configure_1, google_maps_1) {
    "use strict";
    exports.Configure = configure_1.Configure;
    exports.GoogleMaps = google_maps_1.GoogleMaps;
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
    exports.configure = configure;
});
//# sourceMappingURL=index.js.map