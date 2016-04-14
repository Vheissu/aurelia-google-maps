import { Configure } from './configure';

export function configure(aurelia, configCallback) {
    let instance = aurelia.container.get(Configure);

    if (configCallback !== undefined && typeof configCallback === 'function') {
        configCallback(instance);
    }

    aurelia.globalResources('./google-maps');
}