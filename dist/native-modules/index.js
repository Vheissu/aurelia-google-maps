import { PLATFORM, DOM } from 'aurelia-pal';
import { Configure } from './configure';
import { GoogleMaps } from './google-maps';
import { GoogleMapsAPI } from './google-maps-api';
export function configure(aurelia, configCallback) {
    var instance = aurelia.container.get(Configure);
    DOM.injectStyles("google-map { display: block; height: 350px; }");
    if (configCallback !== undefined && typeof (configCallback) === 'function') {
        configCallback(instance);
    }
    aurelia.globalResources([
        PLATFORM.moduleName('./google-maps')
    ]);
}
export { Configure };
export { GoogleMaps };
export { GoogleMapsAPI };
//# sourceMappingURL=index.js.map