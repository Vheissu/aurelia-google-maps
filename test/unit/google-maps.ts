import {TaskQueue} from 'aurelia-task-queue';
import {BindingEngine} from 'aurelia-binding';
import {EventAggregator} from 'aurelia-event-aggregator';

import {Configure} from '../../src/configure';

import { GoogleMaps } from '../../src/google-maps';

let mockElement = document.createElement('div');

describe('google maps', () => {
    let sut: any;
    let mockTaskQueue = new TaskQueue();
    let mockConfigure = new Configure();
    let mockBindingEngine = new BindingEngine();
    let mockEventAggregator = new EventAggregator();

    beforeEach(() => {
        sut = new GoogleMaps(mockElement, mockTaskQueue, mockConfigure, mockBindingEngine, mockEventAggregator);
    });

    it('test passes', () => {
        expect(true);
    });

    it('defaults are set', () => {
        expect(sut.element).toEqual(mockElement);
        expect(sut.taskQueue).toEqual(mockTaskQueue);
        expect(sut.config).toEqual(mockConfigure);
        expect(sut.bindingEngine).toEqual(mockBindingEngine);
        expect(sut.eventAggregator).toEqual(mockEventAggregator);
    });

    it('expect loadApiScript to have been called', () => {
        spyOn(sut, 'loadApiScript').and.callThrough();
        sut.constructor(mockElement, mockTaskQueue, mockConfigure, mockBindingEngine, mockEventAggregator);
        expect(sut.loadApiScript).toHaveBeenCalled();
    });

})
