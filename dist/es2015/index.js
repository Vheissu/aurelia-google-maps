import { Configure } from './configure';
import { GoogleMaps } from './google-maps';
export function configure(aurelia, configCallback) {
    let instance = aurelia.container.get(Configure);
    if (configCallback !== undefined && typeof (configCallback) === 'function') {
        configCallback(instance);
    }
    aurelia.globalResources('./google-maps');
}
export { Configure };
export { GoogleMaps };
//# sourceMappingURL=index.js.map