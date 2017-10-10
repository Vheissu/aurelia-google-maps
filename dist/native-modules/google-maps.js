var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { inject } from 'aurelia-dependency-injection';
import { bindable, customElement, noView } from 'aurelia-templating';
import { TaskQueue } from 'aurelia-task-queue';
import { BindingEngine } from 'aurelia-binding';
import { EventAggregator } from 'aurelia-event-aggregator';
import { getLogger } from 'aurelia-logging';
import { Configure } from './configure';
import { GoogleMapsAPI } from './google-maps-api';
var GM = 'googlemap';
var Events = (function () {
    function Events() {
    }
    Events.BOUNDSCHANGED = GM + ":bounds_changed";
    Events.CLICK = GM + ":click";
    Events.INFOWINDOWDOMREADY = GM + ":infowindow:domready";
    Events.MARKERCLICK = GM + ":marker:click";
    Events.MARKERMOUSEOVER = GM + ":marker:mouse_over";
    Events.MARKERMOUSEOUT = GM + ":marker:mouse_out";
    Events.POLYGONCLICK = GM + ":polygon:click";
    Events.POLYGONCLICKEVENT = 'polygon-click';
    Events.APILOADED = GM + ":api:loaded";
    Events.LOCATIONADDED = GM + ":marker:added";
    Events.OVERLAYCOMPLETE = GM + ":draw:overlaycomplete";
    Events.MAPCLICK = 'map-click';
    Events.INFOWINDOWSHOW = 'info-window-show';
    Events.MARKERRENDERED = 'marker-rendered';
    Events.MAPOVERLAYCOMPLETE = 'map-overlay-complete';
    return Events;
}());
export { Events };
var logger = getLogger('aurelia-google-maps');
var GoogleMaps = (function () {
    function GoogleMaps(element, taskQueue, config, bindingEngine, eventAggregator, googleMapsApi) {
        this._currentInfoWindow = null;
        this.longitude = 0;
        this.latitude = 0;
        this.zoom = 8;
        this.disableDefaultUi = false;
        this.markers = [];
        this.autoUpdateBounds = false;
        this.autoInfoWindow = true;
        this.mapType = 'ROADMAP';
        this.options = {};
        this.drawEnabled = false;
        this.drawMode = 'MARKER';
        this.drawOverlayCompleteEvent = null;
        this.polygons = [];
        this.map = null;
        this._renderedMarkers = [];
        this._markersSubscription = null;
        this._scriptPromise = null;
        this._mapPromise = null;
        this._mapResolve = null;
        this.drawingManager = null;
        this._renderedPolygons = [];
        this._polygonsSubscription = null;
        this.element = element;
        this.taskQueue = taskQueue;
        this.config = config;
        this.bindingEngine = bindingEngine;
        this.eventAggregator = eventAggregator;
        this.googleMapsApi = googleMapsApi;
        if (!config.get('apiScript')) {
            logger.error('No API script is defined.');
        }
        if (!config.get('apiKey') && config.get('apiKey') !== false) {
            logger.error('No API key has been specified.');
        }
        this._scriptPromise = this.googleMapsApi.getMapsInstance();
        var self = this;
        this._mapPromise = this._scriptPromise.then(function () {
            return new Promise(function (resolve) {
                self._mapResolve = resolve;
            });
        });
        this.eventAggregator.subscribe('startMarkerHighlight', function (data) {
            var mrkr = self._renderedMarkers[data.index];
            mrkr.setIcon(mrkr.custom.altIcon);
            mrkr.setZIndex(window.google.maps.Marker.MAX_ZINDEX + 1);
        });
        this.eventAggregator.subscribe('stopMarkerHighLight', function (data) {
            var mrkr = self._renderedMarkers[data.index];
            mrkr.setIcon(mrkr.custom.defaultIcon);
        });
        this.eventAggregator.subscribe('panToMarker', function (data) {
            self.map.panTo(self._renderedMarkers[data.index].position);
            self.map.setZoom(17);
        });
        this.eventAggregator.subscribe("clearMarkers", function () {
            this.clearMarkers();
        });
    }
    GoogleMaps.prototype.clearMarkers = function () {
        if (!this._renderedMarkers) {
            return;
        }
        this._renderedMarkers.forEach(function (marker) {
            marker.setMap(null);
        });
        this._renderedMarkers = [];
    };
    GoogleMaps.prototype.attached = function () {
        var _this = this;
        this.element.addEventListener('dragstart', function (evt) {
            evt.preventDefault();
        });
        this.element.addEventListener('zoom_to_bounds', function () {
            _this.zoomToMarkerBounds(true);
        });
        this._scriptPromise.then(function () {
            var latLng = new window.google.maps.LatLng(parseFloat(_this.latitude), parseFloat(_this.longitude));
            var mapTypeId = _this.getMapTypeId();
            var options = Object.assign({}, _this.options, _this.config.get('options'), {
                center: latLng,
                zoom: parseInt(_this.zoom, 10),
                disableDefaultUI: _this.disableDefaultUi,
                mapTypeId: mapTypeId
            });
            _this.map = new window.google.maps.Map(_this.element, options);
            if (_this.mapLoaded) {
                _this.mapLoaded(_this.map);
            }
            _this._mapResolve();
            _this.map.addListener('click', function (e) {
                dispatchEvent(Events.MAPCLICK, e, _this.element);
                _this.eventAggregator.publish(Events.CLICK, e);
                if (!_this.autoInfoWindow)
                    return;
                if (_this._currentInfoWindow) {
                    _this._currentInfoWindow.close();
                }
            });
            _this.map.addListener('dragend', function () {
                _this.sendBoundsEvent();
            });
            _this.map.addListener('zoom_changed', function () {
                _this.sendBoundsEvent();
            });
        });
    };
    GoogleMaps.prototype.sendBoundsEvent = function () {
        var bounds = this.map.getBounds();
        if (bounds) {
            this.eventAggregator.publish(Events.BOUNDSCHANGED, bounds);
        }
    };
    GoogleMaps.prototype.sendApiLoadedEvent = function () {
        this.eventAggregator.publish(Events.APILOADED, this._scriptPromise);
    };
    GoogleMaps.prototype.renderMarker = function (marker) {
        var _this = this;
        var markerLatLng = new window.google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));
        return this._mapPromise.then(function () {
            _this.createMarker({
                map: _this.map,
                position: markerLatLng
            }).then(function (createdMarker) {
                createdMarker.addListener('click', function () {
                    _this.eventAggregator.publish(Events.MARKERCLICK, createdMarker);
                    if (!_this.autoInfoWindow)
                        return;
                    if (_this._currentInfoWindow) {
                        _this._currentInfoWindow.close();
                    }
                    if (!createdMarker.infoWindow) {
                        _this._currentInfoWindow = null;
                        return;
                    }
                    _this._currentInfoWindow = createdMarker.infoWindow;
                    createdMarker.infoWindow.open(_this.map, createdMarker);
                });
                createdMarker.addListener('mouseover', function () {
                    _this.eventAggregator.publish(Events.MARKERMOUSEOVER, createdMarker);
                    createdMarker.setZIndex(window.google.maps.Marker.MAX_ZINDEX + 1);
                });
                createdMarker.addListener('mouseout', function () {
                    _this.eventAggregator.publish(Events.MARKERMOUSEOUT, createdMarker);
                });
                createdMarker.addListener('dblclick', function () {
                    _this.map.setZoom(15);
                    _this.map.panTo(createdMarker.position);
                });
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
                        maxWidth: marker.infoWindow.maxWidth
                    });
                    createdMarker.infoWindow.addListener('domready', function () {
                        dispatchEvent(Events.INFOWINDOWSHOW, createdMarker.infoWindow, _this.element);
                        _this.eventAggregator.publish(Events.INFOWINDOWDOMREADY, createdMarker.infoWindow);
                    });
                }
                if (marker.custom) {
                    createdMarker.custom = marker.custom;
                }
                _this._renderedMarkers.push(createdMarker);
                dispatchEvent(Events.MARKERRENDERED, { createdMarker: createdMarker, marker: marker }, _this.element);
            });
        });
    };
    GoogleMaps.prototype.getCurrentPosition = function () {
        if (navigator.geolocation) {
            return navigator.geolocation.getCurrentPosition(function (position) { return Promise.resolve(position); }, function (evt) { return Promise.reject(evt); });
        }
        return Promise.reject('Browser Geolocation not supported or found.');
    };
    GoogleMaps.prototype.setOptions = function (options) {
        if (!this.map) {
            return;
        }
        this.map.setOptions(options);
    };
    GoogleMaps.prototype.createMarker = function (options) {
        return this._scriptPromise.then(function () {
            return Promise.resolve(new window.google.maps.Marker(options));
        });
    };
    GoogleMaps.prototype.getCenter = function () {
        var _this = this;
        this._mapPromise.then(function () {
            return Promise.resolve(_this.map.getCenter());
        });
    };
    GoogleMaps.prototype.setCenter = function (latLong) {
        var _this = this;
        this._mapPromise.then(function () {
            _this.map.setCenter(latLong);
            _this.sendBoundsEvent();
        });
    };
    GoogleMaps.prototype.updateCenter = function () {
        var _this = this;
        this._mapPromise.then(function () {
            var latLng = new window.google.maps.LatLng(parseFloat(_this.latitude), parseFloat(_this.longitude));
            _this.setCenter(latLng);
        });
    };
    GoogleMaps.prototype.latitudeChanged = function () {
        var _this = this;
        this._mapPromise.then(function () {
            _this.taskQueue.queueMicroTask(function () {
                _this.updateCenter();
            });
        });
    };
    GoogleMaps.prototype.longitudeChanged = function () {
        var _this = this;
        this._mapPromise.then(function () {
            _this.taskQueue.queueMicroTask(function () {
                _this.updateCenter();
            });
        });
    };
    GoogleMaps.prototype.zoomChanged = function (newValue) {
        var _this = this;
        this._mapPromise.then(function () {
            _this.taskQueue.queueMicroTask(function () {
                var zoomValue = parseInt(newValue, 10);
                _this.map.setZoom(zoomValue);
            });
        });
    };
    GoogleMaps.prototype.markersChanged = function (newValue) {
        var _this = this;
        if (this._markersSubscription !== null) {
            this._markersSubscription.dispose();
            for (var _i = 0, _a = this._renderedMarkers; _i < _a.length; _i++) {
                var marker = _a[_i];
                marker.setMap(null);
            }
            this._renderedMarkers = [];
        }
        this._markersSubscription = this.bindingEngine
            .collectionObserver(this.markers)
            .subscribe(function (splices) { _this.markerCollectionChange(splices); });
        this._mapPromise.then(function () {
            var markerPromises = newValue.map(function (marker) {
                return _this.renderMarker(marker);
            });
            return Promise.all(markerPromises);
        }).then(function () {
            _this.taskQueue.queueTask(function () {
                _this.zoomToMarkerBounds();
            });
        });
    };
    GoogleMaps.prototype.markerCollectionChange = function (splices) {
        var _this = this;
        if (!splices.length) {
            return;
        }
        var renderPromises = [];
        for (var _i = 0, splices_1 = splices; _i < splices_1.length; _i++) {
            var splice = splices_1[_i];
            if (splice.removed.length) {
                for (var _a = 0, _b = splice.removed; _a < _b.length; _a++) {
                    var removedObj = _b[_a];
                    for (var markerIndex in this._renderedMarkers) {
                        if (this._renderedMarkers.hasOwnProperty(markerIndex)) {
                            var renderedMarker = this._renderedMarkers[markerIndex];
                            if (renderedMarker.position.lat().toFixed(12) === removedObj.latitude.toFixed(12) &&
                                renderedMarker.position.lng().toFixed(12) === removedObj.longitude.toFixed(12)) {
                                renderedMarker.setMap(null);
                                this._renderedMarkers.splice(markerIndex, 1);
                                break;
                            }
                        }
                    }
                }
            }
            if (splice.addedCount) {
                var addedMarkers = this.markers.slice(-splice.addedCount);
                for (var _c = 0, addedMarkers_1 = addedMarkers; _c < addedMarkers_1.length; _c++) {
                    var addedMarker = addedMarkers_1[_c];
                    renderPromises.push(this.renderMarker(addedMarker));
                }
            }
        }
        Promise.all(renderPromises).then(function () {
            _this.taskQueue.queueTask(function () {
                _this.zoomToMarkerBounds();
            });
        });
    };
    GoogleMaps.prototype.zoomToMarkerBounds = function (force) {
        var _this = this;
        if (force === void 0) { force = false; }
        if (typeof force === 'undefined') {
            force = false;
        }
        if (!force && (!this._renderedMarkers || !this.autoUpdateBounds)) {
            return;
        }
        this._mapPromise.then(function () {
            var bounds = new window.google.maps.LatLngBounds();
            for (var _i = 0, _a = _this._renderedMarkers; _i < _a.length; _i++) {
                var marker = _a[_i];
                var markerLatLng = new window.google.maps.LatLng(parseFloat(marker.position.lat()), parseFloat(marker.position.lng()));
                bounds.extend(markerLatLng);
            }
            for (var _b = 0, _c = _this._renderedPolygons; _b < _c.length; _b++) {
                var polygon = _c[_b];
                polygon.getPath().forEach(function (element) {
                    bounds.extend(element);
                });
            }
            _this.map.fitBounds(bounds);
        });
    };
    GoogleMaps.prototype.getMapTypeId = function () {
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
    };
    GoogleMaps.prototype.error = function () {
        logger.error.apply(logger, arguments);
    };
    GoogleMaps.prototype.resize = function () {
        var _this = this;
        this._mapPromise.then(function () {
            _this.taskQueue.queueMicroTask(function () {
                window.google.maps.event.trigger(_this.map, 'resize');
            });
        });
    };
    GoogleMaps.prototype.initDrawingManager = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this._mapPromise.then(function () {
            if (_this.drawingManager)
                return Promise.resolve();
            var config = Object.assign({}, {
                drawingMode: _this.getOverlayType(_this.drawMode),
                drawingControl: _this.drawingControl,
                drawingControlOptions: _this.drawingControlOptions
            }, options);
            _this.drawingManager = new window.google.maps.drawing.DrawingManager(config);
            _this.drawingManager.addListener('overlaycomplete', function (evt) {
                Object.assign(evt, {
                    path: evt.overlay.getPath().getArray().map(function (x) { return { latitude: x.lat(), longitude: x.lng() }; }),
                    encode: _this.encodePath(evt.overlay.getPath())
                });
                dispatchEvent(Events.MAPOVERLAYCOMPLETE, evt, _this.element);
                _this.eventAggregator.publish(Events.OVERLAYCOMPLETE, evt);
            });
            return Promise.resolve();
        });
    };
    GoogleMaps.prototype.destroyDrawingManager = function () {
        if (!this.drawingManager)
            return;
        this.drawingManager.setMap(null);
        this.drawingManager = null;
    };
    GoogleMaps.prototype.getOverlayType = function (type) {
        if (type === void 0) { type = ''; }
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
    };
    GoogleMaps.prototype.drawEnabledChanged = function (newval, oldval) {
        var _this = this;
        this.initDrawingManager()
            .then(function () {
            if (newval && !oldval) {
                _this.drawingManager.setMap(_this.map);
            }
            else if (oldval && !newval) {
                _this.destroyDrawingManager();
            }
        });
    };
    GoogleMaps.prototype.drawModeChanged = function (newval) {
        var _this = this;
        if (newval === void 0) { newval = ''; }
        this.initDrawingManager()
            .then(function () {
            _this.drawingManager.setOptions({
                drawingMode: _this.getOverlayType(newval)
            });
        });
    };
    GoogleMaps.prototype.encodePath = function (path) {
        if (path === void 0) { path = []; }
        return window.google.maps.geometry.encoding.encodePath(path);
    };
    GoogleMaps.prototype.decodePath = function (polyline) {
        return window.google.maps.geometry.encoding.decodePath(polyline);
    };
    GoogleMaps.prototype.renderPolygon = function (polygonObject) {
        var _this = this;
        if (polygonObject === void 0) { polygonObject = []; }
        var paths = polygonObject.paths;
        if (!paths)
            return;
        if (Array.isArray(paths)) {
            paths = paths.map(function (x) {
                return new window.google.maps.LatLng(x.latitude, x.longitude);
            });
        }
        var polygon = new window.google.maps.Polygon(Object.assign({}, polygonObject, { paths: paths }));
        polygon.addListener('click', function () {
            dispatchEvent(Events.POLYGONCLICKEVENT, { polygon: polygon }, _this.element);
        });
        polygon.setMap(this.map);
        this._renderedPolygons.push(polygon);
    };
    GoogleMaps.prototype.polygonsChanged = function (newValue) {
        var _this = this;
        if (this._polygonsSubscription !== null) {
            this._polygonsSubscription.dispose();
            for (var _i = 0, _a = this._renderedPolygons; _i < _a.length; _i++) {
                var polygon = _a[_i];
                polygon.setMap(null);
            }
            this._renderedPolygons = [];
        }
        this._polygonsSubscription = this.bindingEngine
            .collectionObserver(this.polygons)
            .subscribe(function (splices) { _this.polygonCollectionChange(splices); });
        this._mapPromise.then(function () {
            Promise.all(newValue.map(function (polygon) {
                if (typeof polygon === 'string') {
                    return _this.decodePath(polygon);
                }
                return polygon;
            })).then(function (polygons) {
                return Promise.all(polygons.map(_this.renderPolygon.bind(_this)));
            }).then(function () {
                _this.taskQueue.queueTask(function () {
                    _this.zoomToMarkerBounds();
                });
            });
        });
    };
    GoogleMaps.prototype.polygonCollectionChange = function (splices) {
        var _this = this;
        if (!splices.length) {
            return;
        }
        for (var _i = 0, splices_2 = splices; _i < splices_2.length; _i++) {
            var splice = splices_2[_i];
            if (splice.removed.length) {
                for (var _a = 0, _b = splice.removed; _a < _b.length; _a++) {
                    var removedObj = _b[_a];
                    for (var polygonIndex in this._renderedPolygons) {
                        if (this._renderedPolygons.hasOwnProperty(polygonIndex)) {
                            var renderedPolygon = this._renderedPolygons[polygonIndex];
                            var strRendered = void 0, strRemoved = void 0;
                            strRendered = this.encodePath(renderedPolygon.getPath());
                            var removedPaths = removedObj.paths.map(function (x) {
                                return new window.google.maps.LatLng(x.latitude, x.longitude);
                            });
                            strRemoved = this.encodePath(removedPaths);
                            if (strRendered === strRemoved) {
                                renderedPolygon.setMap(null);
                                this._renderedPolygons.splice(polygonIndex, 1);
                                break;
                            }
                        }
                    }
                }
            }
            if (splice.addedCount) {
                var addedPolygons = this.polygons.slice(splice.index, splice.index + splice.addedCount);
                for (var _c = 0, addedPolygons_1 = addedPolygons; _c < addedPolygons_1.length; _c++) {
                    var addedPolygon = addedPolygons_1[_c];
                    this.renderPolygon(addedPolygon);
                }
            }
        }
        this.taskQueue.queueTask(function () {
            _this.zoomToMarkerBounds();
        });
    };
    __decorate([
        bindable,
        __metadata("design:type", Number)
    ], GoogleMaps.prototype, "longitude", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Number)
    ], GoogleMaps.prototype, "latitude", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Number)
    ], GoogleMaps.prototype, "zoom", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Boolean)
    ], GoogleMaps.prototype, "disableDefaultUi", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "markers", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Boolean)
    ], GoogleMaps.prototype, "autoUpdateBounds", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Boolean)
    ], GoogleMaps.prototype, "autoInfoWindow", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "mapType", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "options", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "mapLoaded", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Boolean)
    ], GoogleMaps.prototype, "drawEnabled", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "drawMode", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "drawOverlayCompleteEvent", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "polygons", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Boolean)
    ], GoogleMaps.prototype, "drawingControl", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Object)
    ], GoogleMaps.prototype, "drawingControlOptions", void 0);
    GoogleMaps = __decorate([
        noView(),
        customElement('google-map'),
        inject(Element, TaskQueue, Configure, BindingEngine, EventAggregator, GoogleMapsAPI),
        __metadata("design:paramtypes", [Element, TaskQueue, Configure, BindingEngine, EventAggregator, GoogleMapsAPI])
    ], GoogleMaps);
    return GoogleMaps;
}());
export { GoogleMaps };
function dispatchEvent(name, detail, target, bubbles) {
    if (bubbles === void 0) { bubbles = true; }
    var changeEvent;
    if (window.CustomEvent) {
        changeEvent = new CustomEvent(name, { detail: detail, bubbles: bubbles });
    }
    else {
        changeEvent = document.createEvent('CustomEvent');
        changeEvent.initCustomEvent(name, bubbles, true, { data: detail });
    }
    target.dispatchEvent(changeEvent);
}
//# sourceMappingURL=google-maps.js.map