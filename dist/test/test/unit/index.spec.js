define(["require", "exports", "../../src/index", "../../src/configure"], function (require, exports, index_1, configure_1) {
    "use strict";
    var mockFrameWorkConfiguration = {
        container: {
            get: function (instance) {
                return instance;
            }
        },
        globalResources: function (resources) {
            return resources;
        }
    };
    describe('index', function () {
        it('test passes', function () {
            expect(true);
        });
        it('configure function is returned', function () {
            expect(typeof index_1.configure).toBe('function');
        });
        it('configure options callback', function () {
            var configureCallback = function (instance) {
                return instance;
            };
            var configureCallbackTest = jasmine.createSpy('configureCallback', configureCallback);
            index_1.configure(mockFrameWorkConfiguration, configureCallbackTest);
            expect(configureCallbackTest).toHaveBeenCalledWith(configure_1.Configure);
        });
        it('plugin registers globalResources', function () {
            spyOn(mockFrameWorkConfiguration, 'globalResources');
            index_1.configure(mockFrameWorkConfiguration);
            expect(mockFrameWorkConfiguration.globalResources).toHaveBeenCalledWith([
                './google-maps'
            ]);
        });
    });
});
