import {bindable, inject, customElement} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@customElement('google-map')
@inject(Element, EventAggregator)
export class GoogleMaps {
    @bindable id = null;
    @bindable markers = {};
    @bindable shapes = {};

    constructor(element, ea) {
        this.element = element;
        this.ea = ea;

        this.apikey = '';
    }

    attached() {
        var classRef = this;

        if (this.id == null) {
            this.id = guid();
        }

        this.element.addEventListener('dragstart', evt => {
            evt.preventDefault();
        });

        this.ea.subscribe('google.maps.ready', () => {
            this.map = new google.maps.Map(document.getElementById(this.id));
            this.map.markers = {};
            this.map.shapes = {};
        });

        window.myGoogleMapsCallback = function() {
            classRef.ea.publish('google.maps.ready');
        };

        this.loadApiScript();
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
            scriptEl.src = `https://maps.googleapis.com/maps/api/js?key=${this.apikey}&callback=myGoogleMapsCallback`;
            document.body.appendChild(scriptEl);
        }
    }

    error() {
        console.log.apply(console, arguments);
    }
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
