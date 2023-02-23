import 'reflect-metadata';
import { configure } from '../../src/index';
import { Configure } from '../../src/configure';
import { FrameworkConfiguration } from 'aurelia-framework';
import { DOM } from 'aurelia-pal';

// Mock DOM injectStyles from aurelia-pal
DOM.injectStyles = jest.fn();

let mockFrameWorkConfiguration = {
    container: {
        get: function (instance: string) {
            return instance;
        }
    },
    globalResources: function (resources: any): FrameworkConfiguration {
        return resources;
    }
} as FrameworkConfiguration;

describe('index', () => {

    it('configure function is returned', () => {
        expect(typeof configure).toBe('function');
    });

    it('configure options callback', () => {
        let configureCallback = jest.fn();

        configure(mockFrameWorkConfiguration, configureCallback);

        expect(configureCallback).toHaveBeenCalledWith(Configure);
    });

    it('plugin registers globalResources', () => {
        jest.spyOn(mockFrameWorkConfiguration, 'globalResources');
        configure(mockFrameWorkConfiguration);

        expect(mockFrameWorkConfiguration.globalResources).toHaveBeenCalledWith([
            './google-maps'
        ]);
    });

    it('configure function calls injectStyles', () => {
        configure(mockFrameWorkConfiguration);

        expect(DOM.injectStyles).toHaveBeenCalled();
    });

    it('configure function calls injectStyles with correct styles', () => {
        configure(mockFrameWorkConfiguration);

        expect(DOM.injectStyles).toHaveBeenCalledWith('google-map { display: block; height: 350px; }');
    });

})
