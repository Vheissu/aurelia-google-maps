declare module "configure" {
    export interface ConfigInterface {
        apiScript: string;
        apiKey: string;
        apiLibraries: string;
        options: any;
    }
    export class Configure {
        private _config;
        constructor();
        options(obj: ConfigInterface): void;
        get(key: any): any;
        set(key: any, val: any): any;
    }
}
declare module "google-maps" {
    export class GoogleMaps {
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
        autoUpdateBounds: boolean;
        mapType: string;
        map: any;
        _renderedMarkers: any[];
        _markersSubscription: any;
        _scriptPromise: any;
        _mapPromise: any;
        _mapResolve: any;
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
}
declare module "index" {
    import { Configure } from "configure";
    import { GoogleMaps } from "google-maps";
    export function configure(aurelia: any, configCallback: any): void;
    export { Configure };
    export { GoogleMaps };
}
