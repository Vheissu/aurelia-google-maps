define(['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-task-queue', 'aurelia-framework', 'aurelia-event-aggregator', './configure'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaTaskQueue, _aureliaFramework, _aureliaEventAggregator, _configure) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.GoogleMaps = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;

    var GM = 'googlemap';
    var BOUNDSCHANGED = GM + ':bounds_changed';
    var CLICK = GM + ':click';
    var MARKERCLICK = GM + ':marker:click';
    var MARKERMOUSEOVER = GM + ':marker:mouse_over';
    var MARKERMOUSEOUT = GM + ':marker:mouse_out';
    var APILOADED = GM + ':api:loaded';

    var GoogleMaps = exports.GoogleMaps = (_dec = (0, _aureliaTemplating.customElement)('google-map'), _dec2 = (0, _aureliaDependencyInjection.inject)(Element, _aureliaTaskQueue.TaskQueue, _configure.Configure, _aureliaFramework.BindingEngine, _aureliaEventAggregator.EventAggregator), _dec(_class = _dec2(_class = (_class2 = function () {
        function GoogleMaps(element, taskQueue, config, bindingEngine, eventAggregator) {
            _classCallCheck(this, GoogleMaps);

            _initDefineProp(this, 'address', _descriptor, this);

            _initDefineProp(this, 'longitude', _descriptor2, this);

            _initDefineProp(this, 'latitude', _descriptor3, this);

            _initDefineProp(this, 'zoom', _descriptor4, this);

            _initDefineProp(this, 'disableDefaultUI', _descriptor5, this);

            _initDefineProp(this, 'markers', _descriptor6, this);

            this.map = null;
            this._renderedMarkers = [];
            this._markersSubscription = null;
            this._scriptPromise = null;
            this._mapPromise = null;
            this._mapResolve = null;

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
                return new Promise(function (resolve, reject) {
                    self._mapResolve = resolve;
                });
            });
        }

        GoogleMaps.prototype.attached = function attached() {
            var _this = this;

            this.element.addEventListener('dragstart', function (evt) {
                evt.preventDefault();
            });

            this._scriptPromise.then(function () {
                var latLng = new google.maps.LatLng(parseFloat(_this.latitude), parseFloat(_this.longitude));

                var options = {
                    center: latLng,
                    zoom: parseInt(_this.zoom, 10),
                    disableDefaultUI: _this.disableDefaultUI
                };

                _this.map = new google.maps.Map(_this.element, options);
                _this._mapResolve();

                _this.map.addListener('click', function (e) {
                    var changeEvent = void 0;
                    if (window.CustomEvent) {
                        changeEvent = new CustomEvent('map-click', {
                            detail: e,
                            bubbles: true
                        });
                    } else {
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

        GoogleMaps.prototype.sendBoundsEvent = function sendBoundsEvent() {
            var bounds = this.map.getBounds();
            if (bounds) {
                this.eventAggregator.publish(BOUNDSCHANGED, bounds);
            }
        };

        GoogleMaps.prototype.sendApiLoadedEvent = function sendApiLoadedEvent() {
            this.eventAggregator.publish(APILOADED, this._scriptPromise);
        };

        GoogleMaps.prototype.renderMarker = function renderMarker(marker) {
            var _this2 = this;

            var markerLatLng = new google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));

            this._scriptPromise.then(function () {
                _this2.createMarker({
                    map: _this2.map,
                    position: markerLatLng
                }).then(function (createdMarker) {
                    createdMarker.addListener('click', function () {
                        if (!createdMarker.infoWindow) {
                            _this2.eventAggregator.publish(MARKERCLICK, createdMarker);
                        } else {
                            createdMarker.infoWindow.open(_this2.map, createdMarker);
                        }
                    });

                    createdMarker.addListener('mouseover', function () {
                        _this2.eventAggregator.publish(MARKERMOUSEOVER, createdMarker);
                    });

                    createdMarker.addListener('mouseout', function () {
                        _this2.eventAggregator.publish(MARKERMOUSEOUT, createdMarker);
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

                    if (marker.infoWindow) {
                        createdMarker.infoWindow = new google.maps.InfoWindow({
                            content: marker.infoWindow.content,
                            pixelOffset: marker.infoWindow.pixelOffset,
                            position: marker.infoWindow.position,
                            maxWidth: marker.infoWindow.maxWidth
                        });
                    }

                    if (marker.custom) {
                        createdMarker.custom = marker.custom;
                    }

                    _this2._renderedMarkers.push(createdMarker);
                });
            });
        };

        GoogleMaps.prototype.geocodeAddress = function geocodeAddress(address, geocoder) {
            var _this3 = this;

            this._scriptPromise.then(function () {
                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        _this3.setCenter(results[0].geometry.location);

                        _this3.createMarker({
                            map: _this3.map,
                            position: results[0].geometry.location
                        });
                    }
                });
            });
        };

        GoogleMaps.prototype.getCurrentPosition = function getCurrentPosition() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    return Promise.resolve(position);
                }, function (evt) {
                    return Promise.reject(evt);
                });
            } else {
                return Promise.reject('Browser Geolocation not supported or found.');
            }
        };

        GoogleMaps.prototype.loadApiScript = function loadApiScript() {
            var _this4 = this;

            if (this._scriptPromise) {
                return this._scriptPromise;
            }

            if (window.google === undefined || window.google.maps === undefined) {
                var _ret = function () {
                    var script = document.createElement('script');

                    script.type = 'text/javascript';
                    script.async = true;
                    script.defer = true;
                    script.src = _this4.config.get('apiScript') + '?key=' + _this4.config.get('apiKey') + '&libraries=' + _this4.config.get('apiLibraries') + '&callback=myGoogleMapsCallback';
                    document.body.appendChild(script);

                    _this4._scriptPromise = new Promise(function (resolve, reject) {
                        window.myGoogleMapsCallback = function () {
                            _this4.sendApiLoadedEvent();
                            resolve();
                        };

                        script.onerror = function (error) {
                            reject(error);
                        };
                    });

                    return {
                        v: _this4._scriptPromise
                    };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            } else {
                this._scriptPromise = new Promise(function (resolve) {
                    resolve();
                });

                return this._scriptPromise;
            }
        };

        GoogleMaps.prototype.setOptions = function setOptions(options) {
            if (!this.map) {
                return;
            }

            this.map.setOptions(options);
        };

        GoogleMaps.prototype.createMarker = function createMarker(options) {
            return this._scriptPromise.then(function () {
                return Promise.resolve(new google.maps.Marker(options));
            });
        };

        GoogleMaps.prototype.getCenter = function getCenter() {
            var _this5 = this;

            this._scriptPromise.then(function () {
                return Promise.resolve(_this5.map.getCenter());
            });
        };

        GoogleMaps.prototype.setCenter = function setCenter(latLong) {
            var _this6 = this;

            this._mapPromise.then(function () {
                _this6.map.setCenter(latLong);
                _this6.sendBoundsEvent();
            });
        };

        GoogleMaps.prototype.updateCenter = function updateCenter() {
            var _this7 = this;

            this._mapPromise.then(function () {
                var latLng = new google.maps.LatLng(parseFloat(_this7.latitude), parseFloat(_this7.longitude));
                _this7.setCenter(latLng);
            });
        };

        GoogleMaps.prototype.addressChanged = function addressChanged(newValue) {
            var _this8 = this;

            this._scriptPromise.then(function () {
                var geocoder = new google.maps.Geocoder();

                _this8.taskQueue.queueMicroTask(function () {
                    _this8.geocodeAddress(newValue, geocoder);
                });
            });
        };

        GoogleMaps.prototype.latitudeChanged = function latitudeChanged(newValue) {
            var _this9 = this;

            this._scriptPromise.then(function () {
                _this9.taskQueue.queueMicroTask(function () {
                    _this9.updateCenter();
                });
            });
        };

        GoogleMaps.prototype.longitudeChanged = function longitudeChanged(newValue) {
            var _this10 = this;

            this._scriptPromise.then(function () {
                _this10.taskQueue.queueMicroTask(function () {
                    _this10.updateCenter();
                });
            });
        };

        GoogleMaps.prototype.zoomChanged = function zoomChanged(newValue) {
            var _this11 = this;

            this._scriptPromise.then(function () {
                _this11.taskQueue.queueMicroTask(function () {
                    var zoomValue = parseInt(newValue, 10);
                    _this11.map.setZoom(zoomValue);
                });
            });
        };

        GoogleMaps.prototype.markersChanged = function markersChanged(newValue) {
            var _this12 = this;

            if (this._markersSubscription !== null) {
                this._markersSubscription.dispose();

                for (var _iterator = this._renderedMarkers, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                    var _ref;

                    if (_isArray) {
                        if (_i >= _iterator.length) break;
                        _ref = _iterator[_i++];
                    } else {
                        _i = _iterator.next();
                        if (_i.done) break;
                        _ref = _i.value;
                    }

                    var marker = _ref;

                    marker.setMap(null);
                }

                this._renderedMarkers = [];
            }

            this._markersSubscription = this.bindingEngine.collectionObserver(this.markers).subscribe(function (splices) {
                _this12.markerCollectionChange(splices);
            });

            this._mapPromise.then(function () {
                for (var _iterator2 = newValue, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                    var _ref2;

                    if (_isArray2) {
                        if (_i2 >= _iterator2.length) break;
                        _ref2 = _iterator2[_i2++];
                    } else {
                        _i2 = _iterator2.next();
                        if (_i2.done) break;
                        _ref2 = _i2.value;
                    }

                    var _marker = _ref2;

                    _this12.renderMarker(_marker);
                }
            });
        };

        GoogleMaps.prototype.markerCollectionChange = function markerCollectionChange(splices) {
            for (var _iterator3 = splices, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
                var _ref3;

                if (_isArray3) {
                    if (_i3 >= _iterator3.length) break;
                    _ref3 = _iterator3[_i3++];
                } else {
                    _i3 = _iterator3.next();
                    if (_i3.done) break;
                    _ref3 = _i3.value;
                }

                var splice = _ref3;

                if (splice.removed.length) {
                    for (var _iterator4 = splice.removed, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
                        var _ref4;

                        if (_isArray4) {
                            if (_i4 >= _iterator4.length) break;
                            _ref4 = _iterator4[_i4++];
                        } else {
                            _i4 = _iterator4.next();
                            if (_i4.done) break;
                            _ref4 = _i4.value;
                        }

                        var removedObj = _ref4;

                        for (var markerIndex in this._renderedMarkers) {
                            if (this._renderedMarkers.hasOwnProperty(markerIndex)) {
                                var renderedMarker = this._renderedMarkers[markerIndex];

                                if (renderedMarker.position.lat() === removedObj.latitude && renderedMarker.position.lng() === removedObj.longitude) {
                                    renderedMarker.setMap(null);

                                    this._renderedMarkers.splice(markerIndex, 1);
                                    break;
                                }
                            }
                        }
                    }
                }

                if (splice.addedCount) {
                    var addedMarker = this.markers[splice.index];

                    this.renderMarker(addedMarker);
                }
            }
        };

        GoogleMaps.prototype.error = function error() {
            console.log.apply(console, arguments);
        };

        return GoogleMaps;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'address', [_aureliaTemplating.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return null;
        }
    }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'longitude', [_aureliaTemplating.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return 0;
        }
    }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'latitude', [_aureliaTemplating.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return 0;
        }
    }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'zoom', [_aureliaTemplating.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return 8;
        }
    }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, 'disableDefaultUI', [_aureliaTemplating.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return false;
        }
    }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, 'markers', [_aureliaTemplating.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return [];
        }
    })), _class2)) || _class) || _class);
});