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
import { bindable, customElement } from 'aurelia-templating';
import { TaskQueue } from 'aurelia-task-queue';
import { BindingEngine } from 'aurelia-binding';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Configure } from './configure';
const GM = 'googlemap';
const BOUNDSCHANGED = `${GM}:bounds_changed`;
const CLICK = `${GM}:click`;
const INFOWINDOWDOMREADY = `${GM}:infowindow:domready`;
const MARKERCLICK = `${GM}:marker:click`;
const MARKERMOUSEOVER = `${GM}:marker:mouse_over`;
const MARKERMOUSEOUT = `${GM}:marker:mouse_out`;
const APILOADED = `${GM}:api:loaded`;
export let GoogleMaps = class GoogleMaps {
    constructor(element, taskQueue, config, bindingEngine, eventAggregator) {
        this.address = null;
        this.longitude = 0;
        this.latitude = 0;
        this.zoom = 8;
        this.disableDefaultUI = false;
        this.markers = [];
        this.autoUpdateBounds = false;
        this.mapType = 'ROADMAP';
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
        this.eventAggregator.subscribe('startMarkerHighlight', function (data) {
            let mrkr = self._renderedMarkers[data.index];
            mrkr.setIcon(mrkr.custom.altIcon);
            mrkr.setZIndex(window.google.maps.Marker.MAX_ZINDEX + 1);
        });
        this.eventAggregator.subscribe('stopMarkerHighLight', function (data) {
            let mrkr = self._renderedMarkers[data.index];
            mrkr.setIcon(mrkr.custom.defaultIcon);
        });
        this.eventAggregator.subscribe('panToMarker', function (data) {
            self.map.panTo(self._renderedMarkers[data.index].position);
            self.map.setZoom(17);
        });
    }
    attached() {
        this.element.addEventListener('dragstart', evt => {
            evt.preventDefault();
        });
        this.element.addEventListener("zoom_to_bounds", evt => {
            this.zoomToMarkerBounds();
        });
        this._scriptPromise.then(() => {
            let latLng = new window.google.maps.LatLng(parseFloat(this.latitude), parseFloat(this.longitude));
            let mapTypeId = this.getMapTypeId();
            let options = Object.assign(this.config.get('options'), {
                center: latLng,
                zoom: parseInt(this.zoom, 10),
                disableDefaultUI: this.disableDefaultUI,
                mapTypeId: mapTypeId
            });
            this.map = new window.google.maps.Map(this.element, options);
            this._mapResolve();
            this.map.addListener('click', (e) => {
                let changeEvent;
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
    sendApiLoadedEvent() {
        this.eventAggregator.publish(APILOADED, this._scriptPromise);
    }
    renderMarker(marker) {
        let markerLatLng = new window.google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));
        this._mapPromise.then(() => {
            this.createMarker({
                map: this.map,
                position: markerLatLng
            }).then(createdMarker => {
                createdMarker.addListener('click', () => {
                    if (!createdMarker.infoWindow) {
                        this.eventAggregator.publish(MARKERCLICK, createdMarker);
                    }
                    else {
                        createdMarker.infoWindow.open(this.map, createdMarker);
                    }
                });
                createdMarker.addListener('mouseover', () => {
                    this.eventAggregator.publish(MARKERMOUSEOVER, createdMarker);
                    createdMarker.setZIndex(window.google.maps.Marker.MAX_ZINDEX + 1);
                });
                createdMarker.addListener('mouseout', () => {
                    this.eventAggregator.publish(MARKERMOUSEOUT, createdMarker);
                });
                createdMarker.addListener('dblclick', () => {
                    this.map.setZoom(15);
                    this.map.panTo(createdMarker.position);
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
                    createdMarker.infoWindow = new window.google.maps.InfoWindow({
                        content: marker.infoWindow.content,
                        pixelOffset: marker.infoWindow.pixelOffset,
                        position: marker.infoWindow.position,
                        maxWidth: marker.infoWindow.maxWidth
                    });
                    createdMarker.infoWindow.addListener('domready', () => {
                        this.eventAggregator.publish(INFOWINDOWDOMREADY, createdMarker.infoWindow);
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
        this._mapPromise.then(() => {
            geocoder.geocode({ 'address': address }, (results, status) => {
                if (status === window.google.maps.GeocoderStatus.OK) {
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
            return navigator.geolocation.getCurrentPosition(position => Promise.resolve(position), evt => Promise.reject(evt));
        }
        return Promise.reject('Browser Geolocation not supported or found.');
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
            script.src = `${this.config.get('apiScript')}?key=${this.config.get('apiKey')}&libraries=${this.config.get('apiLibraries')}&callback=myGoogleMapsCallback`;
            document.body.appendChild(script);
            this._scriptPromise = new Promise((resolve, reject) => {
                window.myGoogleMapsCallback = () => {
                    this.sendApiLoadedEvent();
                    resolve();
                };
                script.onerror = error => {
                    reject(error);
                };
            });
            return this._scriptPromise;
        }
        if (window.google && window.google.maps) {
            this._scriptPromise = new Promise(resolve => { resolve(); });
            return this._scriptPromise;
        }
        return false;
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
    addressChanged(newValue) {
        this._mapPromise.then(() => {
            let geocoder = new window.google.maps.Geocoder;
            this.taskQueue.queueMicroTask(() => {
                this.geocodeAddress(newValue, geocoder);
            });
        });
    }
    latitudeChanged(newValue) {
        this._mapPromise.then(() => {
            this.taskQueue.queueMicroTask(() => {
                this.updateCenter();
            });
        });
    }
    longitudeChanged(newValue) {
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
    markersChanged(newValue) {
        if (this._markersSubscription !== null) {
            this._markersSubscription.dispose();
            for (let marker of this._renderedMarkers) {
                marker.setMap(null);
            }
            this._renderedMarkers = [];
        }
        this._markersSubscription = this.bindingEngine
            .collectionObserver(this.markers)
            .subscribe((splices) => { this.markerCollectionChange(splices); });
        this._mapPromise.then(() => {
            for (let marker of newValue) {
                this.renderMarker(marker);
            }
        });
        this.zoomToMarkerBounds();
    }
    markerCollectionChange(splices) {
        if (!splices.length) {
            return;
        }
        for (let splice of splices) {
            if (splice.removed.length) {
                for (let removedObj of splice.removed) {
                    for (let markerIndex in this._renderedMarkers) {
                        if (this._renderedMarkers.hasOwnProperty(markerIndex)) {
                            let renderedMarker = this._renderedMarkers[markerIndex];
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
                let addedMarker = this.markers[splice.index];
                this.renderMarker(addedMarker);
            }
        }
        this.zoomToMarkerBounds();
    }
    zoomToMarkerBounds() {
        if (!this.markers.length || !this.autoUpdateBounds) {
            return;
        }
        this._mapPromise.then(() => {
            let bounds = new window.google.maps.LatLngBounds();
            for (let marker of this.markers) {
                let markerLatLng = new window.google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));
                bounds.extend(markerLatLng);
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
    error() {
        console.error.apply(console, arguments);
    }
};
__decorate([
    bindable, 
    __metadata('design:type', Object)
], GoogleMaps.prototype, "address", void 0);
__decorate([
    bindable, 
    __metadata('design:type', Number)
], GoogleMaps.prototype, "longitude", void 0);
__decorate([
    bindable, 
    __metadata('design:type', Number)
], GoogleMaps.prototype, "latitude", void 0);
__decorate([
    bindable, 
    __metadata('design:type', Number)
], GoogleMaps.prototype, "zoom", void 0);
__decorate([
    bindable, 
    __metadata('design:type', Boolean)
], GoogleMaps.prototype, "disableDefaultUI", void 0);
__decorate([
    bindable, 
    __metadata('design:type', Object)
], GoogleMaps.prototype, "markers", void 0);
__decorate([
    bindable, 
    __metadata('design:type', Boolean)
], GoogleMaps.prototype, "autoUpdateBounds", void 0);
__decorate([
    bindable, 
    __metadata('design:type', Object)
], GoogleMaps.prototype, "mapType", void 0);
GoogleMaps = __decorate([
    customElement('google-map'),
    inject(Element, TaskQueue, Configure, BindingEngine, EventAggregator), 
    __metadata('design:paramtypes', [Object, Object, Object, Object, Object])
], GoogleMaps);
//# sourceMappingURL=google-maps.js.map