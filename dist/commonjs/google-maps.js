"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
var aurelia_templating_1 = require("aurelia-templating");
var aurelia_task_queue_1 = require("aurelia-task-queue");
var aurelia_binding_1 = require("aurelia-binding");
var aurelia_event_aggregator_1 = require("aurelia-event-aggregator");
var aurelia_logging_1 = require("aurelia-logging");
var configure_1 = require("./configure");
var GM = 'googlemap';
var BOUNDSCHANGED = GM + ":bounds_changed";
var CLICK = GM + ":click";
var INFOWINDOWDOMREADY = GM + ":infowindow:domready";
var MARKERCLICK = GM + ":marker:click";
var MARKERMOUSEOVER = GM + ":marker:mouse_over";
var MARKERMOUSEOUT = GM + ":marker:mouse_out";
var APILOADED = GM + ":api:loaded";
var LOCATIONADDED = GM + ":marker:added";
var logger = aurelia_logging_1.getLogger('aurelia-google-maps');
var isAddressMarker = function (marker) {
    return marker.address !== undefined;
};
var GoogleMaps = (function () {
    function GoogleMaps(element, taskQueue, config, bindingEngine, eventAggregator) {
        this.address = null;
        this.longitude = 0;
        this.latitude = 0;
        this.zoom = 8;
        this.disableDefaultUI = false;
        this.markers = [];
        this.autoUpdateBounds = false;
        this.mapType = 'ROADMAP';
        this.options = {};
        this.map = null;
        this._renderedMarkers = [];
        this._markersSubscription = null;
        this._scriptPromise = null;
        this._mapPromise = null;
        this._mapResolve = null;
        this._locationByAddressMarkers = [];
        this.element = element;
        this.taskQueue = taskQueue;
        this.config = config;
        this.bindingEngine = bindingEngine;
        this.eventAggregator = eventAggregator;
        if (!config.get('apiScript')) {
            logger.error('No API script is defined.');
        }
        if (!config.get('apiKey') && config.get('apiKey') !== false) {
            logger.error('No API key has been specified.');
        }
        this.loadApiScript();
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
        if (!this._locationByAddressMarkers || !this._renderedMarkers) {
            return;
        }
        this._locationByAddressMarkers.concat(this._renderedMarkers).forEach(function (marker) {
            marker.setMap(null);
        });
        this._locationByAddressMarkers = [];
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
                disableDefaultUI: _this.disableDefaultUI,
                mapTypeId: mapTypeId
            });
            _this.map = new window.google.maps.Map(_this.element, options);
            if (_this.mapLoaded) {
                _this.mapLoaded(_this.map);
            }
            _this._mapResolve();
            _this.map.addListener('click', function (e) {
                var changeEvent;
                if (window.CustomEvent) {
                    changeEvent = new CustomEvent('map-click', {
                        detail: e,
                        bubbles: true
                    });
                }
                else {
                    changeEvent = document.createEvent('CustomEvent');
                    changeEvent.initCustomEvent('map-click', true, true, { data: e });
                }
                _this.element.dispatchEvent(changeEvent);
                _this.eventAggregator.publish(CLICK, e);
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
            this.eventAggregator.publish(BOUNDSCHANGED, bounds);
        }
    };
    GoogleMaps.prototype.sendApiLoadedEvent = function () {
        this.eventAggregator.publish(APILOADED, this._scriptPromise);
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
                    if (!createdMarker.infoWindow) {
                        _this.eventAggregator.publish(MARKERCLICK, createdMarker);
                    }
                    else {
                        createdMarker.infoWindow.open(_this.map, createdMarker);
                    }
                });
                createdMarker.addListener('mouseover', function () {
                    _this.eventAggregator.publish(MARKERMOUSEOVER, createdMarker);
                    createdMarker.setZIndex(window.google.maps.Marker.MAX_ZINDEX + 1);
                });
                createdMarker.addListener('mouseout', function () {
                    _this.eventAggregator.publish(MARKERMOUSEOUT, createdMarker);
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
                        _this.eventAggregator.publish(INFOWINDOWDOMREADY, createdMarker.infoWindow);
                    });
                }
                if (marker.custom) {
                    createdMarker.custom = marker.custom;
                }
                _this._renderedMarkers.push(createdMarker);
            });
        });
    };
    GoogleMaps.prototype.geocodeAddress = function (address) {
        var _this = this;
        this.geocode(address).then(function (firstResult) {
            _this.setCenter(firstResult.geometry.location);
            _this.createMarker({
                map: _this.map,
                position: firstResult.geometry.location
            }).then(function (createdMarker) {
                _this._locationByAddressMarkers.push(createdMarker);
                _this.eventAggregator.publish(LOCATIONADDED, Object.assign(createdMarker, { placeId: firstResult.place_id }));
            });
        }).catch(console.info);
    };
    GoogleMaps.prototype.addressMarkerToMarker = function (marker) {
        return this.geocode(marker.address).then(function (firstResults) {
            return __assign({}, marker, { latitude: firstResults.geometry.location.lat(), longitude: firstResults.geometry.location.lng() });
        }).catch(console.info);
    };
    GoogleMaps.prototype.geocode = function (address) {
        var _this = this;
        return this._mapPromise.then(function () {
            return new Promise(function (resolve, reject) {
                _this.geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status !== window.google.maps.GeocoderStatus.OK) {
                        reject(new Error("Failed to geocode address '" + address + "' with status: " + status));
                    }
                    resolve(results[0]);
                });
            });
        });
    };
    Object.defineProperty(GoogleMaps.prototype, "geocoder", {
        get: function () {
            if (!this._geocoder) {
                this._geocoder = new window.google.maps.Geocoder;
            }
            return this._geocoder;
        },
        enumerable: true,
        configurable: true
    });
    GoogleMaps.prototype.getCurrentPosition = function () {
        if (navigator.geolocation) {
            return navigator.geolocation.getCurrentPosition(function (position) { return Promise.resolve(position); }, function (evt) { return Promise.reject(evt); });
        }
        return Promise.reject('Browser Geolocation not supported or found.');
    };
    GoogleMaps.prototype.loadApiScript = function () {
        var _this = this;
        if (this._scriptPromise) {
            return this._scriptPromise;
        }
        if (window.google === undefined || window.google.maps === undefined) {
            var script_1 = document.createElement('script');
            var apiScript = this.config.get('apiScript');
            var apiKey = this.config.get('apiKey') || '';
            var apiLibraries = this.config.get('apiLibraries');
            script_1.type = 'text/javascript';
            script_1.async = true;
            script_1.defer = true;
            script_1.src = apiScript + "?key=" + apiKey + "&libraries=" + apiLibraries + "&callback=myGoogleMapsCallback";
            document.body.appendChild(script_1);
            this._scriptPromise = new Promise(function (resolve, reject) {
                window.myGoogleMapsCallback = function () {
                    _this.sendApiLoadedEvent();
                    resolve();
                };
                script_1.onerror = function (error) {
                    reject(error);
                };
            });
            return this._scriptPromise;
        }
        if (window.google && window.google.maps) {
            this._scriptPromise = new Promise(function (resolve) { resolve(); });
            return this._scriptPromise;
        }
        return false;
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
    GoogleMaps.prototype.addressChanged = function (newValue) {
        var _this = this;
        this._mapPromise.then(function () {
            _this.taskQueue.queueMicroTask(function () {
                _this.geocodeAddress(newValue);
            });
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
            Promise.all(newValue.map(function (marker) {
                if (isAddressMarker(marker)) {
                    return _this.addressMarkerToMarker(marker);
                }
                else {
                    return marker;
                }
            })).then(function (validMarkers) {
                _this.validMarkers = validMarkers.filter(function (marker) { return typeof marker !== 'undefined'; });
                return Promise.all(_this.validMarkers.map(_this.renderMarker.bind(_this)));
            }).then(function () {
                _this.taskQueue.queueTask(function () {
                    _this.zoomToMarkerBounds();
                });
            });
        });
    };
    GoogleMaps.prototype.markerCollectionChange = function (splices) {
        var _this = this;
        if (!splices.length) {
            return;
        }
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
                    this.renderMarker(addedMarker);
                }
            }
        }
        this.taskQueue.queueTask(function () {
            _this.zoomToMarkerBounds();
        });
    };
    GoogleMaps.prototype.zoomToMarkerBounds = function (force) {
        var _this = this;
        if (force === void 0) { force = false; }
        if (typeof force === 'undefined') {
            force = false;
        }
        if (!force && (!this.validMarkers.length || !this.autoUpdateBounds)) {
            return;
        }
        this._mapPromise.then(function () {
            var bounds = new window.google.maps.LatLngBounds();
            for (var _i = 0, _a = _this.validMarkers; _i < _a.length; _i++) {
                var marker = _a[_i];
                var markerLatLng = new window.google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));
                bounds.extend(markerLatLng);
            }
            _this.map.fitBounds(bounds);
            var listener = google.maps.event.addListener(_this.map, 'idle', function () {
                if (_this.map.getZoom() > _this.zoom)
                    _this.map.setZoom(_this.zoom);
                google.maps.event.removeListener(listener);
            });
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
    return GoogleMaps;
}());
__decorate([
    aurelia_templating_1.bindable,
    __metadata("design:type", Object)
], GoogleMaps.prototype, "address", void 0);
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
], GoogleMaps.prototype, "disableDefaultUI", void 0);
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
GoogleMaps = __decorate([
    aurelia_templating_1.noView(),
    aurelia_templating_1.customElement('google-map'),
    aurelia_dependency_injection_1.inject(Element, aurelia_task_queue_1.TaskQueue, configure_1.Configure, aurelia_binding_1.BindingEngine, aurelia_event_aggregator_1.EventAggregator),
    __metadata("design:paramtypes", [Element, aurelia_task_queue_1.TaskQueue, configure_1.Configure, aurelia_binding_1.BindingEngine, aurelia_event_aggregator_1.EventAggregator])
], GoogleMaps);
exports.GoogleMaps = GoogleMaps;
//# sourceMappingURL=google-maps.js.map