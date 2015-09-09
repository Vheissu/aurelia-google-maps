import {bindable, inject, customElement} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@customElement('google-map')
@inject(Element, EventAggregator)
export class GoogleMaps {
    constructor(element, ea) {
        this.element = element;
        this.ea = ea;
    }

    attached() {
        var classRef = this;

        this.element.addEventListener('dragstart', evt => {
            evt.preventDefault();
        });

        this.ea.subscrube('google.maps.ready', () => {
            this.map = new google.maps.Map(this.element);
            this.map.markers = {};
            this.map.shapes = {};
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
        if (window.google === undefined || window.google.maps === undefined) {
            let scriptEl = document.createElement('script');
            scriptEl.src = 'https://maps.googleapis.com/maps/api/js&callback=myGoogleMapsCallback';
            document.body.appendChild(scriptEl);
        }
    }

    error() {
        console.log.apply(console, arguments);
    }
}
