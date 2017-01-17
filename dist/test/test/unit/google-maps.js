define(["require", "exports", "aurelia-task-queue", "aurelia-binding", "aurelia-event-aggregator", "../../src/configure", "../../src/google-maps"], function (require, exports, aurelia_task_queue_1, aurelia_binding_1, aurelia_event_aggregator_1, configure_1, google_maps_1) {
    "use strict";
    var mockElement = document.createElement('div');
    describe('google maps', function () {
        var sut;
        var mockTaskQueue = new aurelia_task_queue_1.TaskQueue();
        var mockConfigure = new configure_1.Configure();
        var mockBindingEngine = new aurelia_binding_1.BindingEngine();
        var mockEventAggregator = new aurelia_event_aggregator_1.EventAggregator();
        beforeEach(function () {
            sut = new google_maps_1.GoogleMaps(mockElement, mockTaskQueue, mockConfigure, mockBindingEngine, mockEventAggregator);
        });
        it('test passes', function () {
            expect(true);
        });
        it('defaults are set', function () {
            expect(sut.element).toEqual(mockElement);
            expect(sut.taskQueue).toEqual(mockTaskQueue);
            expect(sut.config).toEqual(mockConfigure);
            expect(sut.bindingEngine).toEqual(mockBindingEngine);
            expect(sut.eventAggregator).toEqual(mockEventAggregator);
        });
        it('expect loadApiScript to have been called', function () {
            spyOn(sut, 'loadApiScript').and.callThrough();
            sut.constructor(mockElement, mockTaskQueue, mockConfigure, mockBindingEngine, mockEventAggregator);
            expect(sut.loadApiScript).toHaveBeenCalled();
        });
    });
});
