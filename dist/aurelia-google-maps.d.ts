declare module 'aurelia-google-maps' {
  import {
    inject
  } from 'aurelia-dependency-injection';
  import {
    bindable,
    customElement
  } from 'aurelia-templating';
  import {
    TaskQueue
  } from 'aurelia-task-queue';
  import {
    BindingEngine
  } from 'aurelia-framework';
  import {
    EventAggregator
  } from 'aurelia-event-aggregator';
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
    markers: any;
    map: any;
    _renderedMarkers: any;
    _markersSubscription: any;
    _scriptPromise: any;
    _mapPromise: any;
    _mapResolve: any;
    constructor(element: any, taskQueue: any, config: any, bindingEngine: any, eventAggregator: any);
    attached(): any;
    
    /**
         * Send the map bounds as an EA event
         *
         * The `bounds` object is an instance of `LatLngBounds`
         * See https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
         */
    sendBoundsEvent(): any;
    
    /**
         * Send after the api is loaded
         */
    sendApiLoadedEvent(): any;
    
    /**
         * Render a marker on the map and add it to collection of rendered markers
         *
         * @param marker
         *
         */
    renderMarker(marker: any): any;
    
    /**
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
    
    /**
         * Observing changes in the entire markers object. This is critical in case the user sets marker to a new empty Array,
         * where we need to resubscribe Observers and delete all previously rendered markers.
         *
         * @param newValue
         */
    markersChanged(newValue: any): any;
    
    /**
         * Handle the change to the marker collection. Collection observer returns an array of splices which contains
         * information about the change to the collection.
         *
         * @param splices
         */
    markerCollectionChange(splices: any): any;
    error(): any;
  }
  export function configure(aurelia: any, configCallback: any): any;
}