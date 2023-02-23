"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMapsAPI = exports.GoogleMaps = exports.Configure = exports.configure = void 0;
const aurelia_pal_1 = require("aurelia-pal");
const configure_1 = require("./configure");
Object.defineProperty(exports, "Configure", { enumerable: true, get: function () { return configure_1.Configure; } });
const google_maps_1 = require("./google-maps");
Object.defineProperty(exports, "GoogleMaps", { enumerable: true, get: function () { return google_maps_1.GoogleMaps; } });
const google_maps_api_1 = require("./google-maps-api");
Object.defineProperty(exports, "GoogleMapsAPI", { enumerable: true, get: function () { return google_maps_api_1.GoogleMapsAPI; } });
function configure(aurelia, configCallback) {
    let instance = aurelia.container.get(configure_1.Configure);
    aurelia_pal_1.DOM.injectStyles(`google-map { display: block; height: 350px; }`);
    // Do we have a callback function?
    if (configCallback !== undefined && typeof (configCallback) === 'function') {
        configCallback(instance);
    }
    aurelia.globalResources([
        aurelia_pal_1.PLATFORM.moduleName('./google-maps')
    ]);
}
exports.configure = configure;
//# sourceMappingURL=index.js.map