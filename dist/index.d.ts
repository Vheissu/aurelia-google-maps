import { FrameworkConfiguration } from 'aurelia-framework';
import { Configure } from './configure';
import { GoogleMaps, Marker } from './google-maps';
import { GoogleMapsAPI } from './google-maps-api';
export declare function configure(aurelia: FrameworkConfiguration, configCallback?: (config: Configure) => Promise<any>): void;
export { Configure };
export { GoogleMaps };
export { GoogleMapsAPI };
export { Marker };
