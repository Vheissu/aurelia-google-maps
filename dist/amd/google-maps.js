var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "aurelia-dependency-injection", "aurelia-templating", "aurelia-task-queue", "aurelia-binding", "aurelia-event-aggregator", "./configure"], function (require, exports, aurelia_dependency_injection_1, aurelia_templating_1, aurelia_task_queue_1, aurelia_binding_1, aurelia_event_aggregator_1, configure_1) {
    "use strict";
    // use constants to guard against typos
    var GM = 'googlemap';
    var BOUNDSCHANGED = GM + ":bounds_changed";
    var CLICK = GM + ":click";
    var INFOWINDOWDOMREADY = GM + ":infowindow:domready";
    var MARKERCLICK = GM + ":marker:click";
    //const MARKERDOUBLECLICK = `${GM}:marker:dblclick`;
    var MARKERMOUSEOVER = GM + ":marker:mouse_over";
    var MARKERMOUSEOUT = GM + ":marker:mouse_out";
    var APILOADED = GM + ":api:loaded";
    var LOCATIONADDED = GM + ":marker:added";
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
                console.error('No API script is defined.');
            }
            if (!config.get('apiKey')) {
                console.error('No API key has been specified.');
            }
            this.loadApiScript();
            var self = this;
            this._mapPromise = this._scriptPromise.then(function () {
                return new Promise(function (resolve) {
                    // Register the the resolve method for _mapPromise
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
                _this._mapResolve();
                // Add event listener for click event
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
                /**
                 * As a proxy for the very noisy bounds_changed event, we'll
                 * listen to these two instead:
                 *
                 * dragend */
                _this.map.addListener('dragend', function () {
                    _this.sendBoundsEvent();
                });
                /* zoom_changed */
                _this.map.addListener('zoom_changed', function () {
                    _this.sendBoundsEvent();
                });
            });
        };
        /**
         * Send the map bounds as an EA event
         *
         * The `bounds` object is an instance of `LatLngBounds`
         * See https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
         */
        GoogleMaps.prototype.sendBoundsEvent = function () {
            var bounds = this.map.getBounds();
            if (bounds) {
                this.eventAggregator.publish(BOUNDSCHANGED, bounds);
            }
        };
        /**
         * Send after the api is loaded
         * */
        GoogleMaps.prototype.sendApiLoadedEvent = function () {
            this.eventAggregator.publish(APILOADED, this._scriptPromise);
        };
        /**
         * Render a marker on the map and add it to collection of rendered markers
         *
         * @param marker
         *
         */
        GoogleMaps.prototype.renderMarker = function (marker) {
            var _this = this;
            var markerLatLng = new window.google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));
            this._mapPromise.then(function () {
                // Create the marker
                _this.createMarker({
                    map: _this.map,
                    position: markerLatLng
                }).then(function (createdMarker) {
                    /* add event listener for click on the marker,
                     * the event payload is the marker itself */
                    createdMarker.addListener('click', function () {
                        if (!createdMarker.infoWindow) {
                            _this.eventAggregator.publish(MARKERCLICK, createdMarker);
                        }
                        else {
                            createdMarker.infoWindow.open(_this.map, createdMarker);
                        }
                    });
                    /*add event listener for hover over the marker,
                     *the event payload is the marker itself*/
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
                    // Allows arbitrary data to be stored on the marker
                    if (marker.custom) {
                        createdMarker.custom = marker.custom;
                    }
                    // Add it the array of rendered markers
                    _this._renderedMarkers.push(createdMarker);
                });
            });
        };
        /**
         * Geocodes an address, once the Google Map script
         * has been properly loaded and promise instantiated.
         *
         * @param address string
         * @param geocoder any
         *
         */
        GoogleMaps.prototype.geocodeAddress = function (address, geocoder) {
            var _this = this;
            this._mapPromise.then(function () {
                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status !== window.google.maps.GeocoderStatus.OK) {
                        return;
                    }
                    var firstResultLocation = results[0].geometry.location;
                    _this.setCenter(firstResultLocation);
                    _this.createMarker({
                        map: _this.map,
                        position: firstResultLocation
                    }).then(function (createdMarker) {
                        _this._locationByAddressMarkers.push(createdMarker);
                        _this.eventAggregator.publish(LOCATIONADDED, Object.assign(createdMarker, { placeId: results[0].place_id }));
                    });
                });
            });
        };
        /**
         * Get Current Position
         *
         * Get the users current coordinate info from their browser
         *
         */
        GoogleMaps.prototype.getCurrentPosition = function () {
            if (navigator.geolocation) {
                return navigator.geolocation.getCurrentPosition(function (position) { return Promise.resolve(position); }, function (evt) { return Promise.reject(evt); });
            }
            return Promise.reject('Browser Geolocation not supported or found.');
        };
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
        GoogleMaps.prototype.loadApiScript = function () {
            var _this = this;
            if (this._scriptPromise) {
                return this._scriptPromise;
            }
            if (window.google === undefined || window.google.maps === undefined) {
                // google has not been defined yet
                var script_1 = document.createElement('script');
                script_1.type = 'text/javascript';
                script_1.async = true;
                script_1.defer = true;
                script_1.src = this.config.get('apiScript') + "?key=" + this.config.get('apiKey') + "&libraries=" + this.config.get('apiLibraries') + "&callback=myGoogleMapsCallback";
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
                // google has been defined already, so return an immediately resolved Promise that has scope
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
                var geocoder = new window.google.maps.Geocoder;
                _this.taskQueue.queueMicroTask(function () {
                    _this.geocodeAddress(newValue, geocoder);
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
        /**
         * Observing changes in the entire markers object. This is critical in case the user sets marker to a new empty Array,
         * where we need to resubscribe Observers and delete all previously rendered markers.
         *
         * @param newValue
         */
        GoogleMaps.prototype.markersChanged = function (newValue) {
            var _this = this;
            // If there was a previous subscription
            if (this._markersSubscription !== null) {
                // Dispose of the subscription
                this._markersSubscription.dispose();
                // Remove all the currently rendered markers
                for (var _i = 0, _a = this._renderedMarkers; _i < _a.length; _i++) {
                    var marker = _a[_i];
                    marker.setMap(null);
                }
                // And empty the renderMarkers collection
                this._renderedMarkers = [];
            }
            // Add the subcription to markers
            this._markersSubscription = this.bindingEngine
                .collectionObserver(this.markers)
                .subscribe(function (splices) { _this.markerCollectionChange(splices); });
            // Render all markers again
            this._mapPromise.then(function () {
                for (var _i = 0, newValue_1 = newValue; _i < newValue_1.length; _i++) {
                    var marker = newValue_1[_i];
                    _this.renderMarker(marker);
                }
            });
            /**
             * We queue up a task to update the bounds, because in the case of multiple bound properties changing all at once,
             * we need to let Aurelia handle updating the other properties before we actually trigger a re-render of the map
             */
            this.taskQueue.queueTask(function () {
                _this.zoomToMarkerBounds();
            });
        };
        /**
         * Handle the change to the marker collection. Collection observer returns an array of splices which contains
         * information about the change to the collection.
         *
         * @param splices
         */
        GoogleMaps.prototype.markerCollectionChange = function (splices) {
            var _this = this;
            if (!splices.length) {
                // Collection changed but the splices didn't
                return;
            }
            for (var _i = 0, splices_1 = splices; _i < splices_1.length; _i++) {
                var splice = splices_1[_i];
                if (splice.removed.length) {
                    // Iterate over all the removed markers
                    for (var _a = 0, _b = splice.removed; _a < _b.length; _a++) {
                        var removedObj = _b[_a];
                        // Iterate over all the rendered markers to find the one to remove
                        for (var markerIndex in this._renderedMarkers) {
                            if (this._renderedMarkers.hasOwnProperty(markerIndex)) {
                                var renderedMarker = this._renderedMarkers[markerIndex];
                                // Check if the latitude/longitude matches - cast to string of float precision (1e-12)
                                if (renderedMarker.position.lat().toFixed(12) === removedObj.latitude.toFixed(12) &&
                                    renderedMarker.position.lng().toFixed(12) === removedObj.longitude.toFixed(12)) {
                                    // Set the map to null;
                                    renderedMarker.setMap(null);
                                    // Splice out this rendered marker as well
                                    this._renderedMarkers.splice(markerIndex, 1);
                                    break;
                                }
                            }
                        }
                    }
                }
                // Add the new markers to the map
                if (splice.addedCount) {
                    var addedMarkers = this.markers.slice(splice.index, splice.addedCount);
                    for (var _c = 0, addedMarkers_1 = addedMarkers; _c < addedMarkers_1.length; _c++) {
                        var addedMarker = addedMarkers_1[_c];
                        this.renderMarker(addedMarker);
                    }
                }
            }
            /**
             * We queue up a task to update the bounds, because in the case of multiple bound properties changing all at once,
             * we need to let Aurelia handle updating the other properties before we actually trigger a re-render of the map
             */
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
            // Unless forced, if there's no markers, or not auto update bounds
            if (!force && (!this.markers.length || !this.autoUpdateBounds)) {
                return;
            }
            this._mapPromise.then(function () {
                var bounds = new window.google.maps.LatLngBounds();
                for (var _i = 0, _a = _this.markers; _i < _a.length; _i++) {
                    var marker = _a[_i];
                    // extend the bounds to include each marker's position
                    var markerLatLng = new window.google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));
                    bounds.extend(markerLatLng);
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
            console.error.apply(console, arguments);
        };
        GoogleMaps.prototype.resize = function () {
            window.google.maps.event.trigger(this.map, 'resize');
        };
        return GoogleMaps;
    }());
    __decorate([
        aurelia_templating_1.bindable
    ], GoogleMaps.prototype, "address", void 0);
    __decorate([
        aurelia_templating_1.bindable
    ], GoogleMaps.prototype, "longitude", void 0);
    __decorate([
        aurelia_templating_1.bindable
    ], GoogleMaps.prototype, "latitude", void 0);
    __decorate([
        aurelia_templating_1.bindable
    ], GoogleMaps.prototype, "zoom", void 0);
    __decorate([
        aurelia_templating_1.bindable
    ], GoogleMaps.prototype, "disableDefaultUI", void 0);
    __decorate([
        aurelia_templating_1.bindable
    ], GoogleMaps.prototype, "markers", void 0);
    __decorate([
        aurelia_templating_1.bindable
    ], GoogleMaps.prototype, "autoUpdateBounds", void 0);
    __decorate([
        aurelia_templating_1.bindable
    ], GoogleMaps.prototype, "mapType", void 0);
    __decorate([
        aurelia_templating_1.bindable
    ], GoogleMaps.prototype, "options", void 0);
    GoogleMaps = __decorate([
        aurelia_templating_1.customElement('google-map'),
        aurelia_dependency_injection_1.inject(Element, aurelia_task_queue_1.TaskQueue, configure_1.Configure, aurelia_binding_1.BindingEngine, aurelia_event_aggregator_1.EventAggregator)
    ], GoogleMaps);
    exports.GoogleMaps = GoogleMaps;
});
