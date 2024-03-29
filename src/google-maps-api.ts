import { inject } from 'aurelia-dependency-injection';
import { Configure } from './configure';

@inject(Configure)
export class GoogleMapsAPI {
    _scriptPromise: Promise<void> = null;
    private config;


    constructor(config) {
        this.config = config;
    }

    getMapsInstance() {
        if (this._scriptPromise !== null) {
            return this._scriptPromise;
        }

        if (globalThis.google === undefined || globalThis.google.maps === undefined) {
            // google has not been defined yet
            let script = globalThis.document.createElement('script');

            let params = [
                this.config.get('apiKey') ? `key=${this.config.get('apiKey')}&` : '',
                this.config.get('client') ? `client=${this.config.get('client')}` : '',
                this.config.get('apiLibraries') ? `libraries=${this.config.get('apiLibraries')}` : '',
                this.config.get('language') ? `language=${this.config.get('language')}` : '',
                this.config.get('region') ? `region=${this.config.get('region')}` : '',
                'callback=aureliaGoogleMapsCallback',
            ];

            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.src = `${this.config.get('apiScript')}?${params.join('&')}`;
            globalThis.document.body.appendChild(script);

            this._scriptPromise = new Promise((resolve, reject) => {
                globalThis.aureliaGoogleMapsCallback = () => {
                    resolve();
                };
                script.onerror = error => {

                    reject(error);
                };
            });

            return this._scriptPromise;
        }

        if (globalThis.google && globalThis.google.maps) {
            // google has been defined already, so return an immediately resolved Promise that has scope
            this._scriptPromise = new Promise(resolve => { resolve(); });

            return this._scriptPromise;
        }

        return false;
    }
}
