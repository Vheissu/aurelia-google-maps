"use strict";
var aurelia_pal_1 = require("aurelia-pal");
var configure_1 = require("./configure");
exports.Configure = configure_1.Configure;
var google_maps_1 = require("./google-maps");
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
//# sourceMappingURL=index.js.map