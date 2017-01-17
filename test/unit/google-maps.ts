import {StageComponent} from 'aurelia-testing';
import {bootstrap} from 'aurelia-bootstrapper';

describe('google maps', () => {
    let component: any;

    beforeEach(() => {
        component = StageComponent
            .withResources('src/google-map')
            .inView('<google-map latitude="37.323" longitude="-122.0527"></google-map>');
    });

    it('test passes', () => {
        expect(true);
    });

    it('should render map', done => {
        component.create(bootstrap).then(() => {
            const mapElement = document.querySelector('src/google-map');
            expect(mapElement.innerHTML).not.toBe('');
            done();
       }).catch(e => console.log(e.toString()));
    });
    
    afterEach(() => {
        component.dispose();
    });

})
