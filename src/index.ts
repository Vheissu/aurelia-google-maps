import {FrameworkConfiguration} from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';

import { Configure } from './configure';
import { GoogleMaps } from './google-maps';

export function configure(aurelia: FrameworkConfiguration, configCallback?: (config: Configure) => Promise<any>) {
    let instance = aurelia.container.get(Configure) as Configure;

    // Do we have a callback function?
    if (configCallback !== undefined && typeof(configCallback) === 'function') {
        configCallback(instance);
    }

    aurelia.globalResources([
        PLATFORM.moduleName('./google-maps')
    ]);
}

export { Configure };
export { GoogleMaps };
