define(['exports', 'aurelia-framework', 'aurelia-event-aggregator', './configure'], function (exports, _aureliaFramework, _aureliaEventAggregator, _configure) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

    var GoogleMaps = (function () {
        var _instanceInitializers = {};
        var _instanceInitializers = {};

        _createDecoratedClass(GoogleMaps, [{
            key: 'address',
            decorators: [_aureliaFramework.bindable],
            initializer: function initializer() {
                return null;
            },
            enumerable: true
        }, {
            key: 'longitude',
            decorators: [_aureliaFramework.bindable],
            initializer: function initializer() {
                return 0;
            },
            enumerable: true
        }, {
            key: 'latitude',
            decorators: [_aureliaFramework.bindable],
            initializer: function initializer() {
                return 0;
            },
            enumerable: true
        }, {
            key: 'zoom',
            decorators: [_aureliaFramework.bindable],
            initializer: function initializer() {
                return 8;
            },
            enumerable: true
        }, {
            key: 'disableDefaultUI',
            decorators: [_aureliaFramework.bindable],
            initializer: function initializer() {
                return false;
            },
            enumerable: true
        }, {
            key: 'mapClick',
            decorators: [_aureliaFramework.bindable],
            initializer: function initializer() {
                return mapClickCallback;
            },
            enumerable: true
        }], null, _instanceInitializers);

        function GoogleMaps(element, ea, taskQueue, config) {
            _classCallCheck(this, _GoogleMaps);

            _defineDecoratedPropertyDescriptor(this, 'address', _instanceInitializers);

            _defineDecoratedPropertyDescriptor(this, 'longitude', _instanceInitializers);

            _defineDecoratedPropertyDescriptor(this, 'latitude', _instanceInitializers);

            _defineDecoratedPropertyDescriptor(this, 'zoom', _instanceInitializers);

            _defineDecoratedPropertyDescriptor(this, 'disableDefaultUI', _instanceInitializers);

            _defineDecoratedPropertyDescriptor(this, 'mapClick', _instanceInitializers);

            this.map = null;

            this.element = element;
            this.ea = ea;
            this.taskQueue = taskQueue;
            this.config = config;

            if (!config.get('apiScript')) {
                console.error('No API script is defined.');
            }

            if (!config.get('apiKey')) {
                console.error('No API key has been specified.');
            }

            this.loadApiScript();
        }

        _createDecoratedClass(GoogleMaps, [{
            key: 'attached',
            value: function attached() {
                var _this = this;

                var classRef = this;

                this.element.addEventListener('dragstart', function (evt) {
                    evt.preventDefault();
                });

                this.ea.subscribe('google.maps.ready', function () {
                    var options = {
                        center: { lat: _this.latitude, lng: _this.longitude },
                        zoom: parseInt(_this.zoom, 10),
                        disableDefaultUI: _this.disableDefaultUI
                    };

                    _this.map = new google.maps.Map(_this.element, options);
                });

                window.myGoogleMapsCallback = function () {
                    classRef.ea.publish('google.maps.ready');
                };
            }
        }, {
            key: 'geocodeAddress',
            value: function geocodeAddress(address, geocoder) {
                var _this2 = this;

                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        console.log(results);
                        _this2.setCenter(results[0].geometry.location);

                        _this2.createMarker({
                            map: _this2.map,
                            position: results[0].geometry.location
                        });
                    }
                });
            }
        }, {
            key: 'getCurrentPosition',
            value: function getCurrentPosition() {
                return new Promise(function (resolve, reject) {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            return resolve(position);
                        }, function (evt) {
                            return reject(evt);
                        });
                    } else {
                        reject('Browser Geolocation not supported or found.');
                    }
                });
            }
        }, {
            key: 'loadApiScript',
            value: function loadApiScript() {
                var _this3 = this;

                return new Promise(function (resolve, reject) {
                    if (window.google === undefined || window.google.maps === undefined) {
                        var scriptEl = document.createElement('script');
                        scriptEl.src = _this3.config.get('apiScript') + '?key=' + _this3.config.get('apiKey') + '&callback=myGoogleMapsCallback';
                        document.body.appendChild(scriptEl);

                        scriptEl.onload = function () {
                            resolve();
                        };
                    } else {
                        resolve();
                    }
                });
            }
        }, {
            key: 'setOptions',
            value: function setOptions(options) {
                if (!this.map) {
                    return;
                }

                this.map.setOptions(options);
            }
        }, {
            key: 'createMarker',
            value: function createMarker(options) {
                return new google.maps.Marker(options);
            }
        }, {
            key: 'getCenter',
            value: function getCenter() {
                if (!this.map) {
                    return;
                }

                return this.map.getCenter();
            }
        }, {
            key: 'setCenter',
            value: function setCenter(latLong) {
                if (!this.map || !latLong) {
                    return;
                }

                return this.map.setCenter(latLong);
            }
        }, {
            key: 'updateCenter',
            value: function updateCenter() {
                this.setCenter({
                    lat: this.latitude,
                    lng: this.longitude
                });
            }
        }, {
            key: 'addressChanged',
            value: function addressChanged(newValue) {
                var _this4 = this;

                var geocoder = new google.maps.Geocoder();
                this.taskQueue.queueMicroTask(function () {
                    _this4.geocodeAddress(newValue, geocoder);
                });
            }
        }, {
            key: 'latitudeChanged',
            value: function latitudeChanged(newValue) {
                var _this5 = this;

                this.taskQueue.queueMicroTask(function () {
                    _this5.latitude = parseFloat(newValue);
                    _this5.updateCenter();
                });
            }
        }, {
            key: 'longitudeChanged',
            value: function longitudeChanged(newValue) {
                var _this6 = this;

                this.taskQueue.queueMicroTask(function () {
                    _this6.longitude = parseFloat(newValue);
                    _this6.updateCenter();
                });
            }
        }, {
            key: 'zoomChanged',
            value: function zoomChanged(newValue) {
                var _this7 = this;

                this.taskQueue.queueMicroTask(function () {
                    if (!_this7.map) {
                        return;
                    }

                    var zoomValue = parseInt(newValue, 10);
                    _this7.map.setZoom(zoomValue);
                });
            }
        }, {
            key: 'error',
            value: function error() {
                console.log.apply(console, arguments);
            }
        }], null, _instanceInitializers);

        var _GoogleMaps = GoogleMaps;
        GoogleMaps = (0, _aureliaFramework.inject)(Element, _aureliaEventAggregator.EventAggregator, _aureliaFramework.TaskQueue, _configure.Configure)(GoogleMaps) || GoogleMaps;
        GoogleMaps = (0, _aureliaFramework.customElement)('google-map')(GoogleMaps) || GoogleMaps;
        return GoogleMaps;
    })();

    exports.GoogleMaps = GoogleMaps;

    function mapClickCallback() {}
});