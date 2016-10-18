export declare class GoogleMaps {
    private element;
    private taskQueue;
    private config;
    private bindingEngine;
    private eventAggregator;
    address: any;
    longitude: number;
    latitude: number;
    zoom: number;
    disableDefaultUI: boolean;
    markers: any[];
    autoCloseInfoWindows: boolean;
    autoUpdateBounds: boolean;
    mapType: string;
    map: any;
    _renderedMarkers: any[];
    _markersSubscription: any;
    _scriptPromise: any;
    _mapPromise: any;
    _mapResolve: any;
    _previousInfoWindow: any;
    constructor(element: any, taskQueue: any, config: any, bindingEngine: any, eventAggregator: any);
    attached(): void;
    sendBoundsEvent(): void;
    sendApiLoadedEvent(): void;
    renderMarker(marker: any): void;
    geocodeAddress(address: any, geocoder: any): void;
    getCurrentPosition(): any;
    loadApiScript(): any;
    setOptions(options: any): void;
    createMarker(options: any): any;
    getCenter(): void;
    setCenter(latLong: any): void;
    updateCenter(): void;
    addressChanged(newValue: any): void;
    latitudeChanged(newValue: any): void;
    longitudeChanged(newValue: any): void;
    zoomChanged(newValue: any): void;
    markersChanged(newValue: any): void;
    markerCollectionChange(splices: any): void;
    zoomToMarkerBounds(): void;
    getMapTypeId(): any;
    error(): void;
}
