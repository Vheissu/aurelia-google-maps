import { TaskQueue } from 'aurelia-task-queue';
import { BindingEngine } from 'aurelia-binding';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Configure } from './configure';
export declare class GoogleMaps {
    private element;
    private taskQueue;
    private config;
    private bindingEngine;
    private eventAggregator;
    address: null;
    longitude: number;
    latitude: number;
    zoom: number;
    disableDefaultUI: boolean;
    markers: any;
    autoUpdateBounds: boolean;
    mapType: string;
    options: {};
    map: any;
    _renderedMarkers: any;
    _markersSubscription: any;
    _scriptPromise: Promise<any> | any;
    _mapPromise: Promise<any> | any;
    _mapResolve: Promise<any> | any;
    _locationByAddressMarkers: any;
    constructor(element: Element, taskQueue: TaskQueue, config: Configure, bindingEngine: BindingEngine, eventAggregator: EventAggregator);
    clearMarkers(): void;
    attached(): void;
    /**
     * Send the map bounds as an EA event
     *
     * The `bounds` object is an instance of `LatLngBounds`
     * See https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
     */
    sendBoundsEvent(): void;
    /**
     * Send after the api is loaded
     * */
    sendApiLoadedEvent(): void;
    /**
     * Render a marker on the map and add it to collection of rendered markers
     *
     * @param marker
     *
     */
    renderMarker(marker: any): void;
    /**
     * Geocodes an address, once the Google Map script
     * has been properly loaded and promise instantiated.
     *
     * @param address string
     * @param geocoder any
     *
     */
    geocodeAddress(address: string, geocoder: any): void;
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
    setOptions(options: any): void;
    createMarker(options: any): any;
    getCenter(): void;
    setCenter(latLong: any): void;
    updateCenter(): void;
    addressChanged(newValue: any): void;
    latitudeChanged(): void;
    longitudeChanged(): void;
    zoomChanged(newValue: any): void;
    /**
     * Observing changes in the entire markers object. This is critical in case the user sets marker to a new empty Array,
     * where we need to resubscribe Observers and delete all previously rendered markers.
     *
     * @param newValue
     */
    markersChanged(newValue: any): void;
    /**
     * Handle the change to the marker collection. Collection observer returns an array of splices which contains
     * information about the change to the collection.
     *
     * @param splices
     */
    markerCollectionChange(splices: any): void;
    zoomToMarkerBounds(force?: boolean): void;
    getMapTypeId(): any;
    error(): void;
    resize(): void;
}
