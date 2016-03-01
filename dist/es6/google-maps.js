import {bindable, inject, customElement, TaskQueue} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

import {Configure} from './configure';

@customElement('google-map')
@inject(Element, EventAggregator, TaskQueue, Configure)
export class GoogleMaps {
    @bindable longitude = 0;
    @bindable latitude = 0;
    @bindable zoom = 8;
    @bindable disableDefaultUI = false;
    @bindable mapClick = mapClickCallback;

    map = null;

    constructor(element, ea, taskQueue, config) {
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

    attached() {
        var classRef = this;

        this.element.addEventListener('dragstart', evt => {
            evt.preventDefault();
        });

        this.ea.subscribe('google.maps.ready', () => {
            this.map = new google.maps.Map(this.element, {
                center: {lat: this.latitude, lng: this.longitude},
                zoom: parseInt(this.zoom, 10),
                disableDefaultUI: this.disableDefaultUI
            });
        });

        window.myGoogleMapsCallback = function() {
            classRef.ea.publish('google.maps.ready');
        };
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
        if (!this.map) {
            return;
        }

        return this.map.setCenter(latLong);
    }

    updateCenter() {
        this.setCenter({
            lat: parseFloat(this.latitude),
            lng: parseFloat(this.longitude)
        });
    }

    latitudeChanged(newValue) {
        this.taskQueue.queueMicroTask(() => {
            this.updateCenter();
        });
    }

    longitudeChanged(newValue) {
        this.taskQueue.queueMicroTask(() => {
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
