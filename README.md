# aurelia-google-maps

[![Join the chat at https://gitter.im/Vheissu/aurelia-google-maps](https://badges.gitter.im/Vheissu/aurelia-google-maps.svg)](https://gitter.im/Vheissu/aurelia-google-maps?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
A highly configurable custom element for use in your Aurelia applications for inserting Google Maps into your application.

## To Install

``` shell
jspm install npm:aurelia-google-maps
```

## Configuring For Use
Inside of your `main.js`/`main.ts` file simply load the plugin inside of the configure method using `.plugin()`

``` javascript
export function configure(aurelia) {
    aurelia.use
        .plugin('aurelia-google-maps', config => {
            config.options({
                apiKey: 'myapiKey'
            });
        })
}
```

## Using It
Now you have Google Maps configure, to use it simply use the custom element `<google-map></google-map>` in your views.

``` html
<template>
    <google-map latitude="37.323" longitude="-122.0527" zoom="15"></google-map>
</template>
```

These properties also support working with Aurelia's databinding, so you can bind any of the above to variables in your viewmodel and the map updates when these values are changed.

## Supported Properties

- latitude: A latitude value for the map
- longitude: A longitude value for the map
- zoom: A zoom value, default is 8
- disableDefaultUI: A boolean of true or false. Default is false.

## Todo
This element still is missing some features, but they are in development.

- Ability to provide a full address via a `address` property which then gets geocoded into the right coordinates
- Ability to add in markers to a map
- Add in more configuration options
- Work on making the custom element easier to extend
- Work on supporting click events and events inside of the map, with callbacks support