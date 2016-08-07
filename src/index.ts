import { Configure } from './configure';

export function configure(aurelia, configCallback) {
    let instance = aurelia.container.get(Configure);

    // Do we have a callback function?
    if (configCallback !== undefined && typeof(configCallback) === 'function') {
        configCallback(instance);
    }

    aurelia.globalResources('./google-maps');
}
