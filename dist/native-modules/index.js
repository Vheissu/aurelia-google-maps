import { PLATFORM } from 'aurelia-pal';
import { Configure } from './configure';
import { GoogleMaps } from './google-maps';
export function configure(aurelia, configCallback) {
    var instance = aurelia.container.get(Configure);
    if (configCallback !== undefined && typeof (configCallback) === 'function') {
        configCallback(instance);
    }
    aurelia.globalResources([
        PLATFORM.moduleName('./google-maps')
    ]);
}
export { Configure };
export { GoogleMaps };
//# sourceMappingURL=index.js.map