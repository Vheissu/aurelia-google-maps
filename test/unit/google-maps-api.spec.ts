import 'reflect-metadata';

import { Configure } from '../../src/index';
import { GoogleMapsAPI } from '../../src/google-maps-api';

globalThis.aureliaGoogleMapsCallback = jest.fn();

globalThis.google = {
    maps: {
        Map: jest.fn()
    }
};

describe('google maps api', () => {
    let sut: GoogleMapsAPI;
    let config: Configure;
    let window: any;

    beforeEach(() => {
        config = new Configure();
        sut = new GoogleMapsAPI(config);
    });

    it('getMapsInstance returns a promise', () => {
        expect(sut.getMapsInstance()).toBeInstanceOf(Promise);
    });

    it('getMapsInstance returns the same promise', () => {
        expect(sut.getMapsInstance()).toBe(sut.getMapsInstance());
    });

    it('getMapsInstance returns resolves aureliaGoogleMapsCallback when script is loaded', async () => {
        let promise = sut.getMapsInstance();

        globalThis.aureliaGoogleMapsCallback();

        await promise;
    });

});
