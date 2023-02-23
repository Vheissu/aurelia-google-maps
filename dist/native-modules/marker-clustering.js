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
import { Configure } from './configure';
let MarkerClustering = class MarkerClustering {
    config;
    markerClusterer;
    constructor(config) {
        this.config = config;
    }
    isEnabled() {
        return this.config.get('markerCluster') && this.config.get('markerCluster').enable;
    }
    clearMarkers() {
        if (this.markerClusterer) {
            this.markerClusterer.clearMarkers();
        }
    }
    loadScript() {
        if (!this.isEnabled()) {
            return;
        }
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.config.get('markerCluster').src;
        document.body.appendChild(script);
    }
    renderClusters(map, markers) {
        if (!this.isEnabled()) {
            return;
        }
        this.markerClusterer = new window.MarkerClusterer(map, markers, this.config.get('markerCluster'));
    }
};
MarkerClustering = __decorate([
    inject(Configure),
    __metadata("design:paramtypes", [Object])
], MarkerClustering);
export { MarkerClustering };
//# sourceMappingURL=marker-clustering.js.map