import {inject} from 'aurelia-dependency-injection';
import {bindable, customElement} from 'aurelia-templating';
import {TaskQueue} from 'aurelia-task-queue';

import {Configure} from './configure';

@customElement('google-map')
@inject(Element, TaskQueue, Configure)
export class GoogleMaps {
    @bindable address = null;
    @bindable longitude = 0;
    @bindable latitude = 0;
    @bindable zoom = 8;
    @bindable disableDefaultUI = false;

    map = null;
    _scriptPromise = null;

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

            this.map.addListener('click', (e) => {
                var changeEvent;
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
            });
            
            this.createMarker({
                map: this.map,
                position: latLng
            });
        });
    }
    
    /**
     * Geocode Address
     * 
     * Geocodes an address, once the Google Map script
     * has been properly loaded and promise instantiated.
     * 
     * @param address string
     * @param geocoder any
     * 
     */
    geocodeAddress(address, geocoder) {
        this._scriptPromise.then(() => {
            geocoder.geocode({'address': address}, (results, status) => {
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
    
    /**
     * Get Current Position
     * 
     * Get the users current coordinate info from their browser
     * 
     */
    getCurrentPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => Promise.resolve(position), evt => Promise.reject(evt));
        } else {
            return Promise.reject('Browser Geolocation not supported or found.')
        }
    }
    
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
    loadApiScript() {
        if (this._scriptPromise) {
            return this._scriptPromise;
        }
        
        if (window.google === undefined || window.google.maps === undefined) {
            let script = document.createElement('script');
            
            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.src = `${this.config.get('apiScript')}?key=${this.config.get('apiKey')}&callback=myGoogleMapsCallback`;
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
        }
    }

    setOptions(options) {
        if (!this.map) {
            return;
        }

        this.map.setOptions(options);
    }

    createMarker(options) {
        this._scriptPromise.then(() => {
            return Promise.resolve(new google.maps.Marker(options));
        });
    }

    getCenter() {
        this._scriptPromise.then(() => {
            return Promise.resolve(this.map.getCenter());
        });
    }

    setCenter(latLong) {
        this._scriptPromise.then(() => {
            this.map.setCenter(latLong)
        });
    }

    updateCenter() {
        this._scriptPromise.then(() => {
            let latLng = new google.maps.LatLng(parseFloat(this.latitude), parseFloat(this.longitude));
            this.setCenter(latLng);
        });
    }

    addressChanged(newValue) {
        this._scriptPromise.then(() => {
            let geocoder = new google.maps.Geocoder;
            
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

    error() {
        console.log.apply(console, arguments);
    }
}