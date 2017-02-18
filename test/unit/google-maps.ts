import {StageComponent} from 'aurelia-testing';
import {bootstrap} from 'aurelia-bootstrapper';

describe('google maps', () => {
    let component: any;

    beforeEach(() => {
        component = StageComponent
            .withResources('dist/test/src/google-maps')
            .inView('<google-map latitude="37.323" longitude="-122.0527"></google-map>');
    });

    it('test passes', () => {
        expect(true);
    });

    it('should render map', done => {
        component.create(bootstrap).then(() => {
            const mapElement: any = document.querySelector('google-map');
            expect(mapElement.innerHTML).not.toBe('');
            done();
       }).catch((e: Error) => console.log(e.toString()));
    });
    
    afterEach(() => {
        component.dispose();
    });

})
