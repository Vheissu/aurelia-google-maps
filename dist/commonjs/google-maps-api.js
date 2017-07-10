"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
var configure_1 = require("./configure");
var GoogleMapsAPI = (function () {
    function GoogleMapsAPI(config) {
        this._scriptPromise = null;
        this.config = config;
    }
    GoogleMapsAPI.prototype.getMapsInstance = function () {
        if (this._scriptPromise !== null) {
            return this._scriptPromise;
        }
        if (window.google === undefined || window.google.maps === undefined) {
            var script_1 = document.createElement('script');
            script_1.type = 'text/javascript';
            script_1.async = true;
            script_1.defer = true;
            script_1.src = this.config.get('apiScript') + "?key=" + this.config.get('apiKey') + "&libraries=" + this.config.get('apiLibraries') + "&language=" + this.config.get('language') + "&region=" + this.config.get('region') + "&callback=aureliaGoogleMapsCallback";
            document.body.appendChild(script_1);
            this._scriptPromise = new Promise(function (resolve, reject) {
                window.aureliaGoogleMapsCallback = function () {
                    resolve();
                };
                script_1.onerror = function (error) {
                    reject(error);
                };
            });
            return this._scriptPromise;
        }
        if (window.google && window.google.maps) {
            this._scriptPromise = new Promise(function (resolve) { resolve(); });
            return this._scriptPromise;
        }
        return false;
    };
    GoogleMapsAPI = __decorate([
        aurelia_dependency_injection_1.inject(configure_1.Configure),
        __metadata("design:paramtypes", [Object])
    ], GoogleMapsAPI);
    return GoogleMapsAPI;
}());
exports.GoogleMapsAPI = GoogleMapsAPI;
//# sourceMappingURL=google-maps-api.js.map