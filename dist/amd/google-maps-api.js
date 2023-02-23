var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", "aurelia-dependency-injection", "./configure"], function (require, exports, aurelia_dependency_injection_1, configure_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GoogleMapsAPI = void 0;
    let GoogleMapsAPI = class GoogleMapsAPI {
        _scriptPromise = null;
        config;
        constructor(config) {
            this.config = config;
        }
        getMapsInstance() {
            if (this._scriptPromise !== null) {
                return this._scriptPromise;
            }
            if (window.google === undefined || window.google.maps === undefined) {
                // google has not been defined yet
                let script = document.createElement('script');
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
                document.body.appendChild(script);
                this._scriptPromise = new Promise((resolve, reject) => {
                    window.aureliaGoogleMapsCallback = () => {
                        resolve();
                    };
                    script.onerror = error => {
                        reject(error);
                    };
                });
                return this._scriptPromise;
            }
            if (window.google && window.google.maps) {
                // google has been defined already, so return an immediately resolved Promise that has scope
                this._scriptPromise = new Promise(resolve => { resolve(); });
                return this._scriptPromise;
            }
            return false;
        }
    };
    GoogleMapsAPI = __decorate([
        (0, aurelia_dependency_injection_1.inject)(configure_1.Configure),
        __metadata("design:paramtypes", [Object])
    ], GoogleMapsAPI);
    exports.GoogleMapsAPI = GoogleMapsAPI;
});
//# sourceMappingURL=google-maps-api.js.map