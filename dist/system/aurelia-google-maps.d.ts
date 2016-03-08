declare module 'aurelia-google-maps' {
  import { inject }  from 'aurelia-dependency-injection';
  import { bindable, customElement }  from 'aurelia-templating';
  import { TaskQueue }  from 'aurelia-task-queue';
  export class Configure {
    constructor();
    options(obj: any): any;
    get(key: any): any;
    set(key: any, val: any): any;
  }
  export class GoogleMaps {
    address: any;
    longitude: any;
    latitude: any;
    zoom: any;
    disableDefaultUI: any;
    map: any;
    constructor(element: any, taskQueue: any, config: any);
    attached(): any;
    
    /**
         * Geocode Address
         * 
         * Geocodes an address, once the Google Map script
         * has been properly loaded and promise instantiated.
         * 
         * @param address string
         * @param geocoder any
         * 
         */
    geocodeAddress(address: any, geocoder: any): any;
    
    /**
         * Get Current Position
         * 
         * Get the users current coordinate info from their browser
         * 
         */
    getCurrentPosition(): any;
    
    /**
         * Load API Script
         * 
         * Loads the Google Maps Javascript and then resolves a promise
         * if loaded. If Google Maps is already loaded, we just return
         * an immediately resolved promise.
         * 
         * @return Promise
         * 
         */
    loadApiScript(): any;
    setOptions(options: any): any;
    createMarker(options: any): any;
    getCenter(): any;
    setCenter(latLong: any): any;
    updateCenter(): any;
    addressChanged(newValue: any): any;
    latitudeChanged(newValue: any): any;
    longitudeChanged(newValue: any): any;
    zoomChanged(newValue: any): any;
    error(): any;
  }
  export function configure(aurelia: any, configCallback: any): any;
}