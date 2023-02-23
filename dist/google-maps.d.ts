import { TaskQueue } from 'aurelia-task-queue';
import { BindingEngine } from 'aurelia-binding';
import { Configure } from './configure';
import { GoogleMapsAPI } from './google-maps-api';
import { MarkerClustering } from './marker-clustering';
export interface Marker {
    icon?: string;
    label?: string;
    title?: string;
    draggable?: boolean;
    custom?: any;
    infoWindow?: {
        pixelOffset?: number;
        content: string;
        position?: number;
        maxWidth?: number;
    };
    latitude: number | string;
    longitude: number | string;
}
export declare class GoogleMaps {
    private element;
    private taskQueue;
    private config;
    private bindingEngine;
    private googleMapsApi;
    private markerClustering;
    private _currentInfoWindow;
    longitude: number;
    latitude: number;
    zoom: number;
    disableDefaultUi: boolean;
    markers: any;
    autoUpdateBounds: boolean;
    autoInfoWindow: boolean;
    mapType: string;
    options: {};
    mapLoaded: any;
    drawEnabled: boolean;
    drawMode: string;
    polygons: any;
    drawingControl: true;
    drawingControlOptions: {};
    map: any;
    _renderedMarkers: any[];
    _markersSubscription: any;
    _scriptPromise: Promise<any> | any;
    _mapPromise: Promise<any> | any;
    _mapResolve: Promise<any> | any;
    drawingManager: any;
    _renderedPolygons: any;
    _polygonsSubscription: any;
    constructor(element: Element, taskQueue: TaskQueue, config: Configure, bindingEngine: BindingEngine, googleMapsApi: GoogleMapsAPI, markerClustering: MarkerClustering);
    clearMarkers(): void;
    attached(): void;
    /**
     * Send the map bounds as a DOM Event
     *
     * The `bounds` object is an instance of `LatLngBounds`
     * See https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
     */
    sendBoundsEvent(): void;
    /**
     * Render a marker on the map and add it to collection of rendered markers
     *
     * @param marker
     *
     */
    renderMarker(marker: Marker): Promise<void>;
    setOptions(options: any): void;
    createMarker(options: any): any;
    getCenter(): void;
    setCenter(latLong: any): void;
    updateCenter(): void;
    latitudeChanged(): void;
    longitudeChanged(): void;
    zoomChanged(newValue: any): void;
    /**
     * Observing changes in the entire markers object. This is critical in case the user sets marker to a new empty Array,
     * where we need to resubscribe Observers and delete all previously rendered markers.
     *
     * @param newValue
     */
    markersChanged(newValue: Marker[]): void;
    /**
     * Handle the change to the marker collection. Collection observer returns an array of splices which contains
     * information about the change to the collection.
     *
     * @param splices
     */
    markerCollectionChange(splices: any): void;
    zoomToMarkerBounds(force?: boolean): void;
    getMapTypeId(): any;
    /*************************************************************************
     * Google Maps Drawing Manager
     * The below methods are related to the drawing manager, and exposing some
     * of the Google Maps Drawing API out
     *************************************************************************/
    /**
     * Initialize the drawing manager
     *
     * @param options - the option object passed into the drawing manager
     */
    initDrawingManager(options?: any): any;
    /**
     * Destroy the drawing manager when no longer required
     */
    destroyDrawingManager(): void;
    /**
     * Get the given constant that Google's library uses. Defaults to MARKER
     * @param type
     */
    getOverlayType(type?: any): any;
    /**
     * Update the editing state, called by aurelia binding
     * @param newval
     * @param oldval
     */
    drawEnabledChanged(newval: any, oldval: any): void;
    /**
     * Update the drawing mode, called by aurelia binding
     * @param newval
     */
    drawModeChanged(newval?: any): void;
    /*************************************************************************
     * POLYLINE ENCODING
     *************************************************************************/
    /**
     * Encode the given path to be a Polyline encoded string
     * more info: https://developers.google.com/maps/documentation/utilities/polylineutility
     * @param path
     */
    encodePath(path?: any): any;
    /**
     * Decode the given Polyline encoded string to be an array of Paths
     * more info: https://developers.google.com/maps/documentation/utilities/polylineutility
     * @param polyline
     */
    decodePath(polyline: string): any;
    /*************************************************************************
     * POLYGONS
     *************************************************************************/
    /**
     * Render a single polygon on the map and add it to the _renderedPolygons
     * array.
     * @param polygonObject - paths defining a polygon or a string
     */
    renderPolygon(polygonObject?: any): void;
    /**
     * Observing changes in the entire polygons object. This is critical in
     * case the user sets polygons to a new empty Array, where we need to
     * resubscribe Observers and delete all previously rendered polygons.
     *
     * @param newValue
     */
    polygonsChanged(newValue: any): void;
    /**
     * Handle the change to the polygon collection. Collection observer returns an array of splices which contains
     * information about the change to the collection.
     *
     * @param splices
     */
    polygonCollectionChange(splices: any): void;
}
