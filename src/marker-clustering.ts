import { inject } from 'aurelia-dependency-injection';
import { Configure } from './configure';

@inject(Configure)
export class MarkerClustering {
    private config: Configure;

    constructor(config) {
        this.config = config;
    }

    isEnabled() {
        return this.config.get('markerCluster') && this.config.get('markerCluster').enable;
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

        new (<any>window).MarkerClusterer(map, markers, this.config.get('markerCluster'));
    }
}
