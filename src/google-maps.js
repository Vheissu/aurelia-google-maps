import {bindable, inject, customElement, TaskQueue} from 'aurelia-framework';

import {Configure} from './configure';

@customElement('google-map')
@inject(Element, TaskQueue, Configure)
export class GoogleMaps {
    @bindable address = null;
    @bindable longitude = 0;
    @bindable latitude = 0;
    @bindable zoom = 8;
    @bindable disableDefaultUI = false;
    @bindable mapClick = mapClickCallback;

    map = null;

    constructor(element, taskQueue, config) {
        this.element = element;
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

    attached() {
        var classRef = this;

        this.element.addEventListener('dragstart', evt => {
            evt.preventDefault();
        });

        this.ea.subscribe('google.maps.ready', () => {
            let options = {
                center: {lat: this.latitude, lng: this.longitude},
                zoom: parseInt(this.zoom, 10),
                disableDefaultUI: this.disableDefaultUI
            }

            this.map = new google.maps.Map(this.element, options);
        });

        window.myGoogleMapsCallback = function() {
            classRef.ea.publish('google.maps.ready');
        };
    }

    geocodeAddress(address, geocoder) {
        geocoder.geocode({'address': address}, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                this.setCenter(results[0].geometry.location);

                this.createMarker({
                    map: this.map,
                    position: results[0].geometry.location
                });
            }
        });
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => resolve(position), evt => reject(evt));
            } else {
                reject('Browser Geolocation not supported or found.')
            }
        });
    }

    loadApiScript() {
        return new Promise((resolve, reject) => {
            if (window.google === undefined || window.google.maps === undefined) {
                let scriptEl = document.createElement('script');
                scriptEl.src = `${this.config.get('apiScript')}?key=${this.config.get('apiKey')}&callback=myGoogleMapsCallback`;
                document.body.appendChild(scriptEl);

                scriptEl.onload = () => {
                    resolve();
                };
            } else {
                resolve();
            }
        });
    }

    setOptions(options) {
        if (!this.map) {
            return;
        }

        this.map.setOptions(options);
    }

    createMarker(options) {
        return new google.maps.Marker(options);
    }

    getCenter() {
        if (!this.map) {
            return;
        }

        return this.map.getCenter();
    }

    setCenter(latLong) {
        if (!this.map || !latLong) {
            return;
        }

        return this.map.setCenter(latLong);
    }

    updateCenter() {
        this.setCenter({
            lat: this.latitude,
            lng: this.longitude
        });
    }

    addressChanged(newValue) {
        let geocoder = new google.maps.Geocoder;
        this.taskQueue.queueMicroTask(() => {
            this.geocodeAddress(newValue, geocoder);
        });
    }

    latitudeChanged(newValue) {
        this.taskQueue.queueMicroTask(() => {
            this.latitude = parseFloat(newValue);
            this.updateCenter();
        });
    }

    longitudeChanged(newValue) {
        this.taskQueue.queueMicroTask(() => {
            this.longitude = parseFloat(newValue);
            this.updateCenter();
        });
    }

    zoomChanged(newValue) {
        this.taskQueue.queueMicroTask(() => {
            if (!this.map) {
                return;
            }

            let zoomValue = parseInt(newValue, 10);
            this.map.setZoom(zoomValue);
        });
    }

    error() {
        console.log.apply(console, arguments);
    }
}

function mapClickCallback() {

}
