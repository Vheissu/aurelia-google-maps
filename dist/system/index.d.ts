import { FrameworkConfiguration } from 'aurelia-framework';
import { Configure } from './configure';
import { GoogleMaps, Marker } from './google-maps';
export declare function configure(aurelia: FrameworkConfiguration, configCallback?: (config: Configure) => Promise<any>): void;
export { Configure };
export { GoogleMaps };
export { Marker };
