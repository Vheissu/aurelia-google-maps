var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;

function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
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

import { inject } from 'aurelia-dependency-injection';
import { bindable, customElement } from 'aurelia-templating';
import { TaskQueue } from 'aurelia-task-queue';
import { BindingEngine } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

import { Configure } from './configure';

const GM = 'googlemap';
const BOUNDSCHANGED = `${ GM }:bounds_changed`;
const CLICK = `${ GM }:click`;
const MARKERCLICK = `${ GM }:marker:click`;

export let GoogleMaps = (_dec = customElement('google-map'), _dec2 = inject(Element, TaskQueue, Configure, BindingEngine, EventAggregator), _dec(_class = _dec2(_class = (_class2 = class GoogleMaps {

    constructor(element, taskQueue, config, bindingEngine, eventAggregator) {
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

        let self = this;
        this._mapPromise = this._scriptPromise.then(() => {
            return new Promise((resolve, reject) => {
                self._mapResolve = resolve;
            });
        });
    }

    attached() {
        this.element.addEventListener('dragstart', evt => {
            evt.preventDefault();
        });

        this._scriptPromise.then(() => {
            let latLng = new google.maps.LatLng(parseFloat(this.latitude), parseFloat(this.longitude));

            let options = {
                center: latLng,
                zoom: parseInt(this.zoom, 10),
                disableDefaultUI: this.disableDefaultUI
            };

            this.map = new google.maps.Map(this.element, options);
            this._mapResolve();

            this.map.addListener('click', e => {
                let changeEvent;
                if (window.CustomEvent) {
                    changeEvent = new CustomEvent('map-click', {
                        detail: e,
                        bubbles: true
                    });
                } else {
                    changeEvent = document.createEvent('CustomEvent');
                    changeEvent.initCustomEvent('map-click', true, true, { data: e });
                }

                this.element.dispatchEvent(changeEvent);
                this.eventAggregator.publish(CLICK, e);
            });

            this.map.addListener('dragend', () => {
                this.sendBoundsEvent();
            });

            this.map.addListener('zoom_changed', () => {
                this.sendBoundsEvent();
            });
        });
    }

    sendBoundsEvent() {
        let bounds = this.map.getBounds();
        if (bounds) {
            this.eventAggregator.publish(BOUNDSCHANGED, bounds);
        }
    }

    renderMarker(marker) {
        let markerLatLng = new google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));

        this._scriptPromise.then(() => {
            this.createMarker({
                map: this.map,
                position: markerLatLng
            }).then(createdMarker => {
                createdMarker.addListener('click', () => {
                    if (!createdMarker.infoWindow) {
                        this.eventAggregator.publish(MARKERCLICK, createdMarker);
                    } else {
                        createdMarker.infoWindow.open(this.map, createdMarker);
                    }
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

                this._renderedMarkers.push(createdMarker);
            });
        });
    }

    geocodeAddress(address, geocoder) {
        this._scriptPromise.then(() => {
            geocoder.geocode({ 'address': address }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK) {
                    this.setCenter(results[0].geometry.location);

                    this.createMarker({
                        map: this.map,
                        position: results[0].geometry.location
                    });
                }
            });
        });
    }

    getCurrentPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => Promise.resolve(position), evt => Promise.reject(evt));
        } else {
            return Promise.reject('Browser Geolocation not supported or found.');
        }
    }

    loadApiScript() {
        if (this._scriptPromise) {
            return this._scriptPromise;
        }

        if (window.google === undefined || window.google.maps === undefined) {
            let script = document.createElement('script');

            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.src = `${ this.config.get('apiScript') }?key=${ this.config.get('apiKey') }&libraries=${ this.config.get('apiLibraries') }&callback=myGoogleMapsCallback`;
            document.body.appendChild(script);

            this._scriptPromise = new Promise((resolve, reject) => {
                window.myGoogleMapsCallback = () => {
                    resolve();
                };

                script.onerror = error => {
                    reject(error);
                };
            });

            return this._scriptPromise;
        } else {
            this._scriptPromise = new Promise(resolve => {
                resolve();
            });

            return this._scriptPromise;
        }
    }

    setOptions(options) {
        if (!this.map) {
            return;
        }

        this.map.setOptions(options);
    }

    createMarker(options) {
        return this._scriptPromise.then(() => {
            return Promise.resolve(new google.maps.Marker(options));
        });
    }

    getCenter() {
        this._scriptPromise.then(() => {
            return Promise.resolve(this.map.getCenter());
        });
    }

    setCenter(latLong) {
        this._mapPromise.then(() => {
            this.map.setCenter(latLong);
        });
    }

    updateCenter() {
        this._mapPromise.then(() => {
            let latLng = new google.maps.LatLng(parseFloat(this.latitude), parseFloat(this.longitude));
            this.setCenter(latLng);
        });
    }

    addressChanged(newValue) {
        this._scriptPromise.then(() => {
            let geocoder = new google.maps.Geocoder();

            this.taskQueue.queueMicroTask(() => {
                this.geocodeAddress(newValue, geocoder);
            });
        });
    }

    latitudeChanged(newValue) {
        this._scriptPromise.then(() => {
            this.taskQueue.queueMicroTask(() => {
                this.updateCenter();
            });
        });
    }

    longitudeChanged(newValue) {
        this._scriptPromise.then(() => {
            this.taskQueue.queueMicroTask(() => {
                this.updateCenter();
            });
        });
    }

    zoomChanged(newValue) {
        this._scriptPromise.then(() => {
            this.taskQueue.queueMicroTask(() => {
                let zoomValue = parseInt(newValue, 10);
                this.map.setZoom(zoomValue);
            });
        });
    }

    markersChanged(newValue) {
        if (this._markersSubscription !== null) {
            this._markersSubscription.dispose();

            for (let marker of this._renderedMarkers) {
                marker.setMap(null);
            }

            this._renderedMarkers = [];
        }

        this._markersSubscription = this.bindingEngine.collectionObserver(this.markers).subscribe(splices => {
            this.markerCollectionChange(splices);
        });

        this._mapPromise.then(() => {
            for (let marker of newValue) {
                this.renderMarker(marker);
            }
        });
    }

    markerCollectionChange(splices) {
        for (let splice of splices) {
            if (splice.removed.length) {
                for (let removedObj of splice.removed) {
                    for (let markerIndex in this._renderedMarkers) {
                        if (this._renderedMarkers.hasOwnProperty(markerIndex)) {
                            let renderedMarker = this._renderedMarkers[markerIndex];

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
                let addedMarker = this.markers[splice.index];

                this.renderMarker(addedMarker);
            }
        }
    }

    error() {
        console.log.apply(console, arguments);
    }
}, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'address', [bindable], {
    enumerable: true,
    initializer: function () {
        return null;
    }
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'longitude', [bindable], {
    enumerable: true,
    initializer: function () {
        return 0;
    }
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'latitude', [bindable], {
    enumerable: true,
    initializer: function () {
        return 0;
    }
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'zoom', [bindable], {
    enumerable: true,
    initializer: function () {
        return 8;
    }
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, 'disableDefaultUI', [bindable], {
    enumerable: true,
    initializer: function () {
        return false;
    }
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, 'markers', [bindable], {
    enumerable: true,
    initializer: function () {
        return [];
    }
})), _class2)) || _class) || _class);