import {configure} from '../../src/index';
import { Configure } from '../../src/configure';
import {FrameworkConfiguration} from 'aurelia-framework';

let mockFrameWorkConfiguration = {
    container: {
        get: function(instance: string) {
            return instance;
        }
    },
    globalResources: function(resources: any): FrameworkConfiguration {
        return resources;
    }
} as FrameworkConfiguration;

describe('index', () => {

    it('test passes', () => {
        expect(true);
    });

    it('configure function is returned', () => {
        expect(typeof configure).toBe('function');
    });

    it('configure options callback', () => {
        let configureCallback = function(instance: any) {
            return instance;
        }

        let configureCallbackTest = jasmine.createSpy('configureCallback', configureCallback);

        configure(mockFrameWorkConfiguration, configureCallbackTest);

        expect(configureCallbackTest).toHaveBeenCalledWith(Configure);
    });

    it('plugin registers globalResources', () => {
        spyOn(mockFrameWorkConfiguration, 'globalResources');
        configure(mockFrameWorkConfiguration);

        expect(mockFrameWorkConfiguration.globalResources).toHaveBeenCalledWith([
            './google-maps'
        ]);
    });

})
