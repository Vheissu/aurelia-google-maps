"use strict";
var configure_1 = require('./configure');
exports.Configure = configure_1.Configure;
var google_maps_1 = require('./google-maps');
exports.GoogleMaps = google_maps_1.GoogleMaps;
function configure(aurelia, configCallback) {
    var instance = aurelia.container.get(configure_1.Configure);
    if (configCallback !== undefined && typeof (configCallback) === 'function') {
        configCallback(instance);
    }
    aurelia.globalResources('./google-maps');
}
exports.configure = configure;
//# sourceMappingURL=index.js.map