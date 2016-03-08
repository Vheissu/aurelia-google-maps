import { Configure } from './configure'

export function configure(aurelia, configCallback) {
    var instance = aurelia.container.get(Configure);

    // Do we have a callback function?
    if (configCallback !== undefined && typeof(configCallback) === 'function') {
        configCallback(instance);
    }

    aurelia.globalResources('./google-maps');
}
