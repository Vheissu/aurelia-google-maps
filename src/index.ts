import { FrameworkConfiguration } from 'aurelia-framework';
import { PLATFORM, DOM } from 'aurelia-pal';

import { Configure } from './configure';
import { GoogleMaps, Marker } from './google-maps';
import { GoogleMapsAPI } from './google-maps-api';

export function configure(aurelia: FrameworkConfiguration, configCallback?: (config: Configure) => Promise<any>) {
    let instance = aurelia.container.get(Configure) as Configure;

    DOM.injectStyles(`google-map { display: block; height: 350px; }`);

    // Do we have a callback function?
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
export { Marker };
