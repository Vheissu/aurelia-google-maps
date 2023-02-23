var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", "aurelia-dependency-injection", "aurelia-templating", "aurelia-task-queue", "aurelia-binding", "aurelia-logging", "./configure", "./google-maps-api", "./marker-clustering", "./events", "aurelia-framework"], function (require, exports, aurelia_dependency_injection_1, aurelia_templating_1, aurelia_task_queue_1, aurelia_binding_1, aurelia_logging_1, configure_1, google_maps_api_1, marker_clustering_1, events_1, aurelia_framework_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GoogleMaps = void 0;
    const logger = (0, aurelia_logging_1.getLogger)('aurelia-google-maps');
    let GoogleMaps = class GoogleMaps {
        element;
        taskQueue;
        config;
        bindingEngine;
        googleMapsApi;
        markerClustering;
        _currentInfoWindow = null;
        longitude = 0;
        latitude = 0;
        zoom = 8;
        disableDefaultUi = false;
        markers = [];
        autoUpdateBounds = false;
        autoInfoWindow = true;
        mapType = 'ROADMAP';
        options = {};
        mapLoaded;
        drawEnabled = false;
        drawMode = 'MARKER';
        polygons = [];
        drawingControl;
        drawingControlOptions;
        map = null;
        _renderedMarkers = [];
        _markersSubscription = null;
        _scriptPromise = null;
        _mapPromise = null;
        _mapResolve = null;
        drawingManager = null;
        _renderedPolygons = [];
        _polygonsSubscription = null;
        constructor(element, taskQueue, config, bindingEngine, googleMapsApi, markerClustering) {
            this.element = element;
            this.taskQueue = taskQueue;
            this.config = config;
            this.bindingEngine = bindingEngine;
            this.googleMapsApi = googleMapsApi;
            this.markerClustering = markerClustering;
            if (!config.get('apiScript')) {
                logger.error('No API script is defined.');
            }
            if ((!config.get('apiKey') && config.get('apiKey') !== false) && (!config.get('client') && config.get('client') !== false)) {
                logger.error('No API key or client ID has been specified.');
            }
            this.markerClustering.loadScript();
            this._scriptPromise = this.googleMapsApi.getMapsInstance();
            let self = this;
            this._mapPromise = this._scriptPromise.then(() => {
                return new Promise((resolve) => {
                    // Register the the resolve method for _mapPromise
                    self._mapResolve = resolve;
                });
            });
            /**
             * Events which the element listens to
             */
            this.element.addEventListener(events_1.Events.START_MARKER_HIGHLIGHT, (data) => {
                let marker = self._renderedMarkers[data.detail.index];
                marker.setIcon(marker.custom.altIcon);
                marker.setZIndex(window.google.maps.Marker.MAX_ZINDEX + 1);
            });
            this.element.addEventListener(events_1.Events.STOP_MARKER_HIGHLIGHT, (data) => {
                let marker = self._renderedMarkers[data.detail.index];
                marker.setIcon(marker.custom.defaultIcon);
            });
            this.element.addEventListener(events_1.Events.PAN_TO_MARKER, (data) => {
                self.map.panTo(self._renderedMarkers[data.detail.index].position);
                self.map.setZoom(17);
            });
            this.element.addEventListener(events_1.Events.CLEAR_MARKERS, () => {
                this.clearMarkers();
            });
        }
        clearMarkers() {
            if (!this._renderedMarkers) {
                return;
            }
            this._renderedMarkers.forEach(function (marker) {
                marker.setMap(null);
            });
            this._renderedMarkers = [];
            if (this.markerClustering) {
                this.markerClustering.clearMarkers();
            }
        }
        attached() {
            this.element.addEventListener('dragstart', evt => {
                evt.preventDefault();
            });
            this.element.addEventListener('zoom_to_bounds', () => {
                this.zoomToMarkerBounds(true);
            });
            this._scriptPromise.then(() => {
                let latLng = new window.google.maps.LatLng(parseFloat(this.latitude), parseFloat(this.longitude));
                let mapTypeId = this.getMapTypeId();
                let options = Object.assign({}, this.options, this.config.get('options'), {
                    center: latLng,
                    zoom: parseInt(this.zoom, 10),
                    disableDefaultUI: this.disableDefaultUi,
                    mapTypeId: mapTypeId
                });
                this.map = new window.google.maps.Map(this.element, options);
                if (this.mapLoaded) {
                    this.mapLoaded(this.map);
                }
                this._mapResolve();
                // Add event listener for click event
                this.map.addListener('click', (e) => {
                    dispatchEvent(events_1.Events.MAPCLICK, e, this.element);
                    // If there is an infoWindow open, close it
                    if (!this.autoInfoWindow)
                        return;
                    if (this._currentInfoWindow) {
                        this._currentInfoWindow.close();
                        // Dispatch and event that the info window has been closed
                        dispatchEvent(events_1.Events.INFOWINDOWCLOSE, { infoWindow: this._currentInfoWindow }, this.element);
                    }
                });
                /**
                 * As a proxy for the very noisy bounds_changed event, we'll
                 * listen to these two instead:
                 *
                 * dragend */
                this.map.addListener('dragend', () => {
                    this.sendBoundsEvent();
                });
                /* zoom_changed */
                this.map.addListener('zoom_changed', () => {
                    this.sendBoundsEvent();
                });
            });
        }
        /**
         * Send the map bounds as a DOM Event
         *
         * The `bounds` object is an instance of `LatLngBounds`
         * See https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
         */
        sendBoundsEvent() {
            let bounds = this.map.getBounds();
            if (!bounds)
                return;
            dispatchEvent(events_1.Events.BOUNDSCHANGED, { bounds }, this.element);
        }
        /**
         * Render a marker on the map and add it to collection of rendered markers
         *
         * @param marker
         *
         */
        renderMarker(marker) {
            return this._mapPromise.then(() => {
                let markerLatLng = new window.google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));
                // Create the marker
                this.createMarker({
                    map: this.map,
                    position: markerLatLng
                }).then((createdMarker) => {
                    /* add event listener for click on the marker,
                     * the event payload is the marker itself */
                    createdMarker.addListener('click', () => {
                        dispatchEvent(events_1.Events.MARKERCLICK, { marker, createdMarker }, this.element);
                        // Only continue if there autoInfoWindow is enabled
                        if (!this.autoInfoWindow)
                            return;
                        if (this._currentInfoWindow) {
                            this._currentInfoWindow.close();
                        }
                        if (!createdMarker.infoWindow) {
                            this._currentInfoWindow = null;
                            return;
                        }
                        this._currentInfoWindow = createdMarker.infoWindow;
                        createdMarker.infoWindow.open(this.map, createdMarker);
                    });
                    /*add event listener for hover over the marker,
                     *the event payload is the marker itself*/
                    createdMarker.addListener('mouseover', () => {
                        dispatchEvent(events_1.Events.MARKERMOUSEOVER, { marker: createdMarker }, this.element);
                        createdMarker.setZIndex(window.google.maps.Marker.MAX_ZINDEX + 1);
                    });
                    createdMarker.addListener('mouseout', () => {
                        dispatchEvent(events_1.Events.MARKERMOUSEOUT, { marker: createdMarker }, this.element);
                    });
                    createdMarker.addListener('dblclick', () => {
                        this.map.setZoom(15);
                        this.map.panTo(createdMarker.position);
                    });
                    // Set some optional marker properties if they exist
                    if (marker.icon) {
                        createdMarker.setIcon(marker.icon);
                    }
                    if (marker.label) {
                        createdMarker.setLabel(marker.label);
                    }
                    if (marker.title) {
                        createdMarker.setTitle(marker.title);
                    }
                    if (marker.draggable) {
                        createdMarker.setDraggable(marker.draggable);
                    }
                    if (marker.infoWindow) {
                        createdMarker.infoWindow = new window.google.maps.InfoWindow({
                            content: marker.infoWindow.content,
                            pixelOffset: marker.infoWindow.pixelOffset,
                            position: marker.infoWindow.position,
                            maxWidth: marker.infoWindow.maxWidth,
                            parentMarker: { ...marker }
                        });
                        createdMarker.infoWindow.addListener('domready', () => {
                            dispatchEvent(events_1.Events.INFOWINDOWSHOW, { infoWindow: createdMarker.infoWindow }, this.element);
                        });
                        createdMarker.infoWindow.addListener('closeclick', () => {
                            dispatchEvent(events_1.Events.INFOWINDOWCLOSE, { infoWindow: createdMarker.infoWindow }, this.element);
                        });
                    }
                    // Allows arbitrary data to be stored on the marker
                    if (marker.custom) {
                        createdMarker.custom = marker.custom;
                    }
                    // Add it the array of rendered markers
                    this._renderedMarkers.push(createdMarker);
                    // Send up and event to let the parent know a new marker has been rendered
                    dispatchEvent(events_1.Events.MARKERRENDERED, { createdMarker, marker }, this.element);
                });
            });
        }
        setOptions(options) {
            if (!this.map) {
                return;
            }
            this.map.setOptions(options);
        }
        createMarker(options) {
            return this._scriptPromise.then(() => {
                return Promise.resolve(new window.google.maps.Marker(options));
            });
        }
        getCenter() {
            this._mapPromise.then(() => {
                return Promise.resolve(this.map.getCenter());
            });
        }
        setCenter(latLong) {
            this._mapPromise.then(() => {
                this.map.setCenter(latLong);
                this.sendBoundsEvent();
            });
        }
        updateCenter() {
            this._mapPromise.then(() => {
                let latLng = new window.google.maps.LatLng(parseFloat(this.latitude), parseFloat(this.longitude));
                this.setCenter(latLng);
            });
        }
        latitudeChanged() {
            this._mapPromise.then(() => {
                this.taskQueue.queueMicroTask(() => {
                    this.updateCenter();
                });
            });
        }
        longitudeChanged() {
            this._mapPromise.then(() => {
                this.taskQueue.queueMicroTask(() => {
                    this.updateCenter();
                });
            });
        }
        zoomChanged(newValue) {
            this._mapPromise.then(() => {
                this.taskQueue.queueMicroTask(() => {
                    let zoomValue = parseInt(newValue, 10);
                    this.map.setZoom(zoomValue);
                });
            });
        }
        /**
         * Observing changes in the entire markers object. This is critical in case the user sets marker to a new empty Array,
         * where we need to resubscribe Observers and delete all previously rendered markers.
         *
         * @param newValue
         */
        markersChanged(newValue) {
            // If there was a previous subscription
            if (this._markersSubscription !== null) {
                this.clearMarkers();
                // Dispose of the subscription
                this._markersSubscription.dispose();
            }
            // Add the subscription to markers
            this._markersSubscription = this.bindingEngine
                .collectionObserver(this.markers)
                .subscribe((splices) => { this.markerCollectionChange(splices); });
            if (!newValue.length)
                return;
            // Render all markers again
            let markerPromises = [];
            this._mapPromise.then(() => {
                markerPromises = newValue.map(marker => {
                    return this.renderMarker(marker);
                });
                return markerPromises;
            }).then((p) => {
                /**
                 * Wait for all of the promises to resolve for rendering markers
                 */
                Promise.all(p).then(() => {
                    /**
                     * We queue up a task to update the bounds, because in the case of multiple bound properties changing all at once,
                     * we need to let Aurelia handle updating the other properties before we actually trigger a re-render of the map
                     */
                    this.taskQueue.queueTask(() => {
                        this.markerClustering.renderClusters(this.map, this._renderedMarkers);
                        this.zoomToMarkerBounds();
                    });
                });
            });
        }
        /**
         * Handle the change to the marker collection. Collection observer returns an array of splices which contains
         * information about the change to the collection.
         *
         * @param splices
         */
        markerCollectionChange(splices) {
            if (!splices.length) {
                // Collection changed but the splices didn't
                return;
            }
            let renderPromises = [];
            for (let splice of splices) {
                if (splice.removed.length) {
                    // Iterate over all the removed markers
                    for (let removedObj of splice.removed) {
                        // Iterate over all the rendered markers to find the one to remove
                        for (let markerIndex in this._renderedMarkers) {
                            if (!this._renderedMarkers.hasOwnProperty(markerIndex)) {
                                continue;
                            }
                            let renderedMarker = this._renderedMarkers[markerIndex];
                            // Check if the latitude/longitude matches - cast to string of float precision (1e-12)
                            if (renderedMarker.position.lat().toFixed(12) !== removedObj.latitude.toFixed(12) ||
                                renderedMarker.position.lng().toFixed(12) !== removedObj.longitude.toFixed(12)) {
                                continue;
                            }
                            // Set the map to null;
                            renderedMarker.setMap(null);
                            // Splice out this rendered marker as well
                            this._renderedMarkers.splice(markerIndex, 1);
                            // We found the marker, so break from the first level for-loop
                            break;
                        }
                    }
                }
                // Add the new markers to the map
                if (splice.addedCount) {
                    let addedMarkers = this.markers.slice(splice.index, splice.index + splice.addedCount);
                    for (let addedMarker of addedMarkers) {
                        renderPromises.push(this.renderMarker(addedMarker));
                    }
                }
            }
            /**
             * Wait for all of the promises to resolve for rendering markers
             */
            Promise.all(renderPromises).then(() => {
                this.markerClustering.renderClusters(this.map, this._renderedMarkers);
                /**
                 * We queue up a task to update the bounds, because in the case of multiple bound properties changing all at once,
                 * we need to let Aurelia handle updating the other properties before we actually trigger a re-render of the map
                 */
                this.taskQueue.queueTask(() => {
                    this.zoomToMarkerBounds();
                });
            });
        }
        zoomToMarkerBounds(force = false) {
            if (typeof force === 'undefined') {
                force = false;
            }
            // Unless forced, if there's no markers, or not auto update bounds
            if (!force && (!this._renderedMarkers || !this.autoUpdateBounds)) {
                return;
            }
            this._mapPromise.then(() => {
                let bounds = new window.google.maps.LatLngBounds();
                for (let marker of this._renderedMarkers) {
                    // extend the bounds to include each marker's position
                    let lat = parseFloat(marker.position.lat());
                    let lng = parseFloat(marker.position.lng());
                    if (isNaN(lat) || isNaN(lng)) {
                        console.warn(`Marker returned NaN for lat/lng`, { marker, lat, lng });
                        return;
                    }
                    let markerLatLng = new window.google.maps.LatLng(parseFloat(marker.position.lat()), parseFloat(marker.position.lng()));
                    bounds.extend(markerLatLng);
                }
                for (let polygon of this._renderedPolygons) {
                    polygon.getPath().forEach(element => {
                        bounds.extend(element);
                    });
                }
                this.map.fitBounds(bounds);
            });
        }
        getMapTypeId() {
            if (this.mapType.toUpperCase() === 'HYBRID') {
                return window.google.maps.MapTypeId.HYBRID;
            }
            else if (this.mapType.toUpperCase() === 'SATELLITE') {
                return window.google.maps.MapTypeId.SATELLITE;
            }
            else if (this.mapType.toUpperCase() === 'TERRAIN') {
                return window.google.maps.MapTypeId.TERRAIN;
            }
            return window.google.maps.MapTypeId.ROADMAP;
        }
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
        initDrawingManager(options = {}) {
            return this._mapPromise.then(() => {
                // If its been initialized, we don't need to do so anymore
                if (this.drawingManager)
                    return Promise.resolve();
                // Set the config defaults, and override if we were given any configs
                const config = Object.assign({}, {
                    drawingMode: this.getOverlayType(this.drawMode),
                    drawingControl: this.drawingControl,
                    drawingControlOptions: this.drawingControlOptions
                }, options);
                this.drawingManager = new window.google.maps.drawing.DrawingManager(config);
                // Add Event listeners and forward them to as a custom event on the element
                this.drawingManager.addListener('overlaycomplete', evt => {
                    // Add the encoded polyline to the event
                    if (evt.type.toUpperCase() == 'POLYGON' || evt.type.toUpperCase() == 'POLYLINE') {
                        Object.assign(evt, {
                            path: evt.overlay.getPath().getArray().map(x => { return { latitude: x.lat(), longitude: x.lng() }; }),
                            encode: this.encodePath(evt.overlay.getPath())
                        });
                    }
                    dispatchEvent(events_1.Events.MAPOVERLAYCOMPLETE, evt, this.element);
                });
                return Promise.resolve();
            });
        }
        /**
         * Destroy the drawing manager when no longer required
         */
        destroyDrawingManager() {
            // Has not been initialized or has been destroyed, just ignore
            if (!this.drawingManager)
                return;
            // Remove the map and then remove the reference
            this.drawingManager.setMap(null);
            this.drawingManager = null;
        }
        /**
         * Get the given constant that Google's library uses. Defaults to MARKER
         * @param type
         */
        getOverlayType(type = '') {
            switch (type.toUpperCase()) {
                case 'POLYGON':
                    return window.google.maps.drawing.OverlayType.POLYGON;
                case 'POLYLINE':
                    return window.google.maps.drawing.OverlayType.POLYLINE;
                case 'RECTANGLE':
                    return window.google.maps.drawing.OverlayType.RECTANGLE;
                case 'CIRCLE':
                    return window.google.maps.drawing.OverlayType.CIRCLE;
                case 'MARKER':
                    return window.google.maps.drawing.OverlayType.MARKER;
                default:
                    return null;
            }
        }
        /**
         * Update the editing state, called by aurelia binding
         * @param newval
         * @param oldval
         */
        drawEnabledChanged(newval, oldval) {
            this.initDrawingManager()
                .then(() => {
                if (newval && !oldval) {
                    this.drawingManager.setMap(this.map);
                }
                else if (oldval && !newval) {
                    this.destroyDrawingManager();
                }
            });
        }
        /**
         * Update the drawing mode, called by aurelia binding
         * @param newval
         */
        drawModeChanged(newval = '') {
            this.initDrawingManager()
                .then(() => {
                this.drawingManager.setOptions({
                    drawingMode: this.getOverlayType(newval)
                });
            });
        }
        /*************************************************************************
         * POLYLINE ENCODING
         *************************************************************************/
        /**
         * Encode the given path to be a Polyline encoded string
         * more info: https://developers.google.com/maps/documentation/utilities/polylineutility
         * @param path
         */
        encodePath(path = []) {
            return window.google.maps.geometry.encoding.encodePath(path);
        }
        /**
         * Decode the given Polyline encoded string to be an array of Paths
         * more info: https://developers.google.com/maps/documentation/utilities/polylineutility
         * @param polyline
         */
        decodePath(polyline) {
            return window.google.maps.geometry.encoding.decodePath(polyline);
        }
        /*************************************************************************
         * POLYGONS
         *************************************************************************/
        /**
         * Render a single polygon on the map and add it to the _renderedPolygons
         * array.
         * @param polygonObject - paths defining a polygon or a string
         */
        renderPolygon(polygonObject = []) {
            let paths = polygonObject.paths;
            if (!paths)
                return;
            if (Array.isArray(paths)) {
                paths = paths.map(x => {
                    return new window.google.maps.LatLng(x.latitude, x.longitude);
                });
            }
            let polygon = new window.google.maps.Polygon(Object.assign({}, polygonObject, { paths }));
            polygon.addListener('click', () => {
                dispatchEvent(events_1.Events.POLYGONCLICK, { polygon }, this.element);
            });
            polygon.setMap(this.map);
            if (polygonObject.infoWindow) {
                polygon.infoWindow = new window.google.maps.InfoWindow({
                    content: polygonObject.infoWindow.content,
                    pixelOffset: polygonObject.infoWindow.pixelOffset,
                    position: polygonObject.infoWindow.position,
                    maxWidth: polygonObject.infoWindow.maxWidth,
                    parentPolygon: { ...polygonObject }
                });
                // polygonObject.infoWindow.addListener('domready', () => {
                //     dispatchEvent(Events.INFOWINDOWSHOW, { infoWindow: polygonObject.infoWindow }, this.element);
                // });
            }
            dispatchEvent(events_1.Events.POLYGONRENDERED, { polygon, polygonObject }, this.element);
            this._renderedPolygons.push(polygon);
        }
        /**
         * Observing changes in the entire polygons object. This is critical in
         * case the user sets polygons to a new empty Array, where we need to
         * resubscribe Observers and delete all previously rendered polygons.
         *
         * @param newValue
         */
        polygonsChanged(newValue) {
            // If there was a previous subscription
            if (this._polygonsSubscription !== null) {
                // Dispose of the subscription
                this._polygonsSubscription.dispose();
                // Remove all the currently rendered polygons
                for (let polygon of this._renderedPolygons) {
                    polygon.setMap(null);
                }
                // And empty the renderMarkers collection
                this._renderedPolygons = [];
            }
            // Add the subscription to markers
            this._polygonsSubscription = this.bindingEngine
                .collectionObserver(this.polygons)
                .subscribe((splices) => { this.polygonCollectionChange(splices); });
            if (!newValue.length)
                return;
            // Render all markers again
            this._mapPromise.then(() => {
                Promise.all(newValue.map(polygon => {
                    if (typeof polygon === 'string') {
                        return this.decodePath(polygon);
                    }
                    return polygon;
                })).then(polygons => {
                    return Promise.all(polygons.map(this.renderPolygon.bind(this)));
                }).then(() => {
                    /**
                     * We queue up a task to update the bounds, because in the case of multiple bound properties changing all at once,
                     * we need to let Aurelia handle updating the other properties before we actually trigger a re-render of the map
                     */
                    this.taskQueue.queueTask(() => {
                        this.zoomToMarkerBounds();
                    });
                });
            });
        }
        /**
         * Handle the change to the polygon collection. Collection observer returns an array of splices which contains
         * information about the change to the collection.
         *
         * @param splices
         */
        polygonCollectionChange(splices) {
            if (!splices.length) {
                // Collection changed but the splices didn't
                return;
            }
            this._mapPromise.then(() => {
                for (let splice of splices) {
                    if (splice.removed.length) {
                        // Iterate over all the removed markers
                        for (let removedObj of splice.removed) {
                            // Iterate over all the rendered markers to find the one to remove
                            for (let polygonIndex in this._renderedPolygons) {
                                if (!this._renderedPolygons.hasOwnProperty(polygonIndex)) {
                                    continue;
                                }
                                let renderedPolygon = this._renderedPolygons[polygonIndex];
                                // Get string representation
                                let strRendered, strRemoved;
                                strRendered = this.encodePath(renderedPolygon.getPath());
                                let removedPaths = removedObj.paths.map(x => {
                                    return new window.google.maps.LatLng(x.latitude, x.longitude);
                                });
                                strRemoved = this.encodePath(removedPaths);
                                // Check based on string representation
                                if (strRendered !== strRemoved) {
                                    continue;
                                }
                                // Set the map to null;
                                renderedPolygon.setMap(null);
                                // Splice out this rendered marker as well
                                this._renderedPolygons.splice(polygonIndex, 1);
                                break;
                            }
                        }
                    }
                    // Add the new polygons to the map
                    if (splice.addedCount) {
                        let addedPolygons = this.polygons.slice(splice.index, splice.index + splice.addedCount);
                        for (let addedPolygon of addedPolygons) {
                            this.renderPolygon(addedPolygon);
                        }
                    }
                }
            }).then(() => {
                /**
                 * We queue up a task to update the bounds, because in the case of multiple bound properties changing all at once,
                 * we need to let Aurelia handle updating the other properties before we actually trigger a re-render of the map
                 */
                this.taskQueue.queueTask(() => {
                    this.zoomToMarkerBounds();
                });
            });
        }
    };
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Number)
    ], GoogleMaps.prototype, "longitude", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Number)
    ], GoogleMaps.prototype, "latitude", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Number)
    ], GoogleMaps.prototype, "zoom", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Boolean)
    ], GoogleMaps.prototype, "disableDefaultUi", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "markers", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Boolean)
    ], GoogleMaps.prototype, "autoUpdateBounds", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Boolean)
    ], GoogleMaps.prototype, "autoInfoWindow", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "mapType", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "options", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "mapLoaded", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Boolean)
    ], GoogleMaps.prototype, "drawEnabled", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "drawMode", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "polygons", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Boolean)
    ], GoogleMaps.prototype, "drawingControl", void 0);
    __decorate([
        aurelia_templating_1.bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "drawingControlOptions", void 0);
    GoogleMaps = __decorate([
        (0, aurelia_templating_1.noView)(),
        (0, aurelia_templating_1.customElement)('google-map'),
        (0, aurelia_dependency_injection_1.inject)(aurelia_framework_1.DOM.Element, aurelia_task_queue_1.TaskQueue, configure_1.Configure, aurelia_binding_1.BindingEngine, google_maps_api_1.GoogleMapsAPI, marker_clustering_1.MarkerClustering),
        __metadata("design:paramtypes", [Element,
            aurelia_task_queue_1.TaskQueue,
            configure_1.Configure,
            aurelia_binding_1.BindingEngine,
            google_maps_api_1.GoogleMapsAPI,
            marker_clustering_1.MarkerClustering])
    ], GoogleMaps);
    exports.GoogleMaps = GoogleMaps;
    function dispatchEvent(name, detail, target, bubbles = true) {
        let changeEvent;
        if (window.CustomEvent) {
            changeEvent = new CustomEvent(name, { detail, bubbles });
        }
        else {
            changeEvent = document.createEvent('CustomEvent');
            changeEvent.initCustomEvent(name, bubbles, true, { data: detail });
        }
        target.dispatchEvent(changeEvent);
    }
});
//# sourceMappingURL=google-maps.js.map