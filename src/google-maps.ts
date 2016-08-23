import {inject} from 'aurelia-dependency-injection';
import {bindable, customElement} from 'aurelia-templating';
import {TaskQueue} from 'aurelia-task-queue';
import {BindingEngine} from 'aurelia-binding';
import {EventAggregator} from 'aurelia-event-aggregator';

import {Configure} from './configure';

// use constants to guard against typos
const GM = 'googlemap';
const BOUNDSCHANGED = `${GM}:bounds_changed`;
const CLICK = `${GM}:click`;
const MARKERCLICK = `${GM}:marker:click`;
//const MARKERDOUBLECLICK = `${GM}:marker:dblclick`;
const MARKERMOUSEOVER = `${GM}:marker:mouse_over`;
const MARKERMOUSEOUT = `${GM}:marker:mouse_out`;
const APILOADED = `${GM}:api:loaded`;

@customElement('google-map')
@inject(Element, TaskQueue, Configure, BindingEngine, EventAggregator)
export class GoogleMaps {
    private element: Element;
    private taskQueue: TaskQueue;
    private config;
    private bindingEngine: BindingEngine;
    private eventAggregator: EventAggregator;

    @bindable address = null;
    @bindable longitude: number = 0;
    @bindable latitude: number = 0;
    @bindable zoom: number = 8;
    @bindable disableDefaultUI: boolean = false;
    @bindable markers = [];
    @bindable autoUpdateBounds: boolean = false;
    @bindable mapType = 'ROADMAP';

    map = null;
    _renderedMarkers = [];
    _markersSubscription = null;
    _scriptPromise = null;
    _mapPromise = null;
    _mapResolve = null;

    constructor(element, taskQueue, config, bindingEngine, eventAggregator) {
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
                // Register the the resolve method for _mapPromise
                self._mapResolve = resolve;
            });
        });

        this.eventAggregator.subscribe('startMarkerHighlight', function(data) {
            let mrkr = self._renderedMarkers[data.index];
            mrkr.setIcon(mrkr.custom.altIcon);
            mrkr.setZIndex((<any>window).google.maps.Marker.MAX_ZINDEX + 1);
        });

        this.eventAggregator.subscribe('stopMarkerHighLight', function(data) {
            let mrkr = self._renderedMarkers[data.index];
            mrkr.setIcon( mrkr.custom.defaultIcon);
        });

        this.eventAggregator.subscribe('panToMarker', function(data) {
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
            let latLng = new (<any>window).google.maps.LatLng(parseFloat((<any>this.latitude)), parseFloat((<any>this.longitude)));
            let mapTypeId = this.getMapTypeId();

            let options: any = {
                center: latLng,
                zoom: parseInt((<any>this.zoom), 10),
                disableDefaultUI: this.disableDefaultUI,
                mapTypeId: mapTypeId
            };

            this.map = new (<any>window).google.maps.Map(this.element, options);
            this._mapResolve();

            // Add event listener for click event
            this.map.addListener('click', (e) => {
                let changeEvent;
                if ((<any>window).CustomEvent) {
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

            /**
             * As a proxy for the very noisy bounds_changed event, we'll
             * listen to these two instead:
             *
             * dragend */
            this.map.addListener('dragend', () => {
                this.sendBoundsEvent();
            });
            /* zoom_changed */
            this.map.addListener('zoom_changed', () => {
                this.sendBoundsEvent();
            });
        });
    }

    /**
     * Send the map bounds as an EA event
     *
     * The `bounds` object is an instance of `LatLngBounds`
     * See https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
     */
    sendBoundsEvent() { 
        let bounds = this.map.getBounds();
        if (bounds) {
            this.eventAggregator.publish(BOUNDSCHANGED, bounds);
        }
    }

    /**
     * Send after the api is loaded
     * */
    sendApiLoadedEvent() {
        this.eventAggregator.publish(APILOADED, this._scriptPromise);
    }

    /**
     * Render a marker on the map and add it to collection of rendered markers
     *
     * @param marker
     *
     */
    renderMarker(marker) {
        let markerLatLng = new (<any>window).google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));

        this._mapPromise.then(() => {
            // Create the marker
            this.createMarker({
                map: this.map,
                position: markerLatLng
            }).then(createdMarker => {
                /* add event listener for click on the marker,
                 * the event payload is the marker itself */
                createdMarker.addListener('click', () => {
                    if (!createdMarker.infoWindow) {
                        this.eventAggregator.publish(MARKERCLICK, createdMarker);
                    } else {
                        createdMarker.infoWindow.open(this.map, createdMarker);
                    }
                });

                /*add event listener for hover over the marker,
                 *the event payload is the marker itself*/
                createdMarker.addListener('mouseover', () => {
                    this.eventAggregator.publish(MARKERMOUSEOVER, createdMarker);
                    createdMarker.setZIndex((<any>window).google.maps.Marker.MAX_ZINDEX + 1);
                });

                createdMarker.addListener('mouseout', () => {
                    this.eventAggregator.publish(MARKERMOUSEOUT, createdMarker);
                });

                createdMarker.addListener('dblclick', () => {
                    this.map.setZoom(15);
                    this.map.panTo(createdMarker.position);
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
                    createdMarker.infoWindow = new (<any>window).google.maps.InfoWindow({
                        content: marker.infoWindow.content,
                        pixelOffset: marker.infoWindow.pixelOffset,
                        position: marker.infoWindow.position,
                        maxWidth: marker.infoWindow.maxWidth
                    });
                }

                // Allows arbitrary data to be stored on the marker
                if (marker.custom) {
                    createdMarker.custom = marker.custom;
                }

                // Add it the array of rendered markers
                this._renderedMarkers.push(createdMarker);
            });
        });
    }

    /**
     * Geocodes an address, once the Google Map script
     * has been properly loaded and promise instantiated.
     *
     * @param address string
     * @param geocoder any
     *
     */
    geocodeAddress(address, geocoder) {
        this._mapPromise.then(() => {
            geocoder.geocode({'address': address}, (results, status) => {
                if (status === (<any>window).google.maps.GeocoderStatus.OK) {
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
    getCurrentPosition(): any {
        if (navigator.geolocation) {
            return navigator.geolocation.getCurrentPosition(position => Promise.resolve(position), evt => Promise.reject(evt));
        }

        return Promise.reject('Browser Geolocation not supported or found.');
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

        if ((<any>window).google === undefined || (<any>window).google.maps === undefined) {
            // google has not been defined yet
            let script = document.createElement('script');

            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.src = `${this.config.get('apiScript')}?key=${this.config.get('apiKey')}&libraries=${this.config.get('apiLibraries')}&callback=myGoogleMapsCallback`;
            document.body.appendChild(script);

            this._scriptPromise = new Promise((resolve, reject) => {
                (<any>window).myGoogleMapsCallback = () => {
                    this.sendApiLoadedEvent();
                    resolve();
                };

                script.onerror = error => {
                    reject(error);
                };
            });

            return this._scriptPromise;
        }

        if ((<any>window).google && (<any>window).google.maps) {
            // google has been defined already, so return an immediately resolved Promise that has scope
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
            return Promise.resolve(new (<any>window).google.maps.Marker(options));
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
            let latLng = new (<any>window).google.maps.LatLng(parseFloat((<any>this.latitude)), parseFloat((<any>this.longitude)));
            this.setCenter(latLng);
        });
    }

    addressChanged(newValue) {
        this._mapPromise.then(() => {
            let geocoder = new (<any>window).google.maps.Geocoder;

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

    /**
     * Observing changes in the entire markers object. This is critical in case the user sets marker to a new empty Array,
     * where we need to resubscribe Observers and delete all previously rendered markers.
     *
     * @param newValue
     */
    markersChanged(newValue) {
        // If there was a previous subscription
        if (this._markersSubscription !== null) {
            // Dispose of the subscription
            this._markersSubscription.dispose();

            // Remove all the currently rendered markers
            for (let marker of this._renderedMarkers) {
                marker.setMap(null);
            }

            // And empty the renderMarkers collection
            this._renderedMarkers = [];
        }

        // Add the subcription to markers
        this._markersSubscription = this.bindingEngine
            .collectionObserver(this.markers)
            .subscribe((splices) => { this.markerCollectionChange(splices); });

        // Render all markers again
        this._mapPromise.then(() => {
            for (let marker of newValue) {
                this.renderMarker(marker);
            }
        });

        this.zoomToMarkerBounds();
    }

    /**
     * Handle the change to the marker collection. Collection observer returns an array of splices which contains
     * information about the change to the collection.
     *
     * @param splices
     */
    markerCollectionChange(splices) {
        if (!splices.length) {
            // Collection changed but the splices didn't
            return;
        }

        for (let splice of splices) {
            if (splice.removed.length) {
                // Iterate over all the removed markers
                for (let removedObj of splice.removed) {
                    // Iterate over all the rendered markers to find the one to remove
                    for (let markerIndex in this._renderedMarkers) {
                        if (this._renderedMarkers.hasOwnProperty(markerIndex)) {
                            let renderedMarker = this._renderedMarkers[markerIndex];

                            // Check if the latitude/longitude matches - cast to string of float precision (1e-12)
                            if (renderedMarker.position.lat().toFixed(12) === removedObj.latitude.toFixed(12) &&
                                renderedMarker.position.lng().toFixed(12) === removedObj.longitude.toFixed(12)) {
                                // Set the map to null;
                                renderedMarker.setMap(null);

                                // Splice out this rendered marker as well
                                this._renderedMarkers.splice((<any>markerIndex), 1);
                                break;
                            }
                        }
                    }
                }
            }

            // Add the new markers to the map
            if (splice.addedCount) {
                let addedMarker = this.markers[splice.index];

                this.renderMarker(addedMarker);
            }
        }

        this.zoomToMarkerBounds();
    }

    zoomToMarkerBounds() {
        if (this.autoUpdateBounds) {
            this._mapPromise.then(() => {
                let bounds = new (<any>window).google.maps.LatLngBounds();

                for (let marker of this.markers) {
                    // extend the bounds to include each marker's position
                    let markerLatLng = new (<any>window).google.maps.LatLng(parseFloat(marker.latitude), parseFloat(marker.longitude));
                    bounds.extend(markerLatLng);
                }
                this.map.fitBounds(bounds);
            });
        }
    }

    getMapTypeId() {
        if (this.mapType.toUpperCase() === 'HYBRID') {
            return (<any>window).google.maps.MapTypeId.HYBRID;
        } else if (this.mapType.toUpperCase() === 'SATELLITE') {
            return (<any>window).google.maps.MapTypeId.SATELLITE;
        } else if (this.mapType.toUpperCase() === 'TERRAIN') {
            return (<any>window).google.maps.MapTypeId.TERRAIN;
        }

        return (<any>window).google.maps.MapTypeId.ROADMAP;
    }

    error() {
        console.error.apply(console, arguments);
    }
}
