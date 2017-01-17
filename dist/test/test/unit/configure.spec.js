define(["require", "exports", "../../src/configure"], function (require, exports, configure_1) {
    "use strict";
    describe('configure', function () {
        var sut;
        beforeEach(function () {
            sut = new configure_1.Configure();
        });
        it('test passes', function () {
            expect(true);
        });
        it('default configuration options are set', function () {
            expect(sut._config).toEqual({
                apiScript: 'https://maps.googleapis.com/maps/api/js',
                apiKey: '',
                apiLibraries: '',
                options: {}
            });
        });
        it('set a new option using options', function () {
            expect(sut.get('test-option')).toBeUndefined();
            sut.options({ 'test-option': 'test value123' });
            expect(sut.get('test-option')).toEqual('test value123');
        });
        it('override default option using options', function () {
            expect(sut.get('apiScript')).toEqual('https://maps.googleapis.com/maps/api/js');
            sut.options({ 'apiScript': 'http://facebook.com/123' });
            expect(sut.get('apiScript')).toEqual('http://facebook.com/123');
        });
        it('get an existing option', function () {
            expect(sut.get('apiScript')).toEqual('https://maps.googleapis.com/maps/api/js');
        });
        it('get an existing option that does not exist', function () {
            expect(sut.get('fsdfsdfsdf')).toBeUndefined();
        });
        it('set a new single option and return value', function () {
            expect(sut.set('fsdfsdfsdf', 'fdkj98340982')).toEqual('fdkj98340982');
        });
    });
});
