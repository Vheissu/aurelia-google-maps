# aurelia-google-maps

[![Join the chat at https://gitter.im/Vheissu/aurelia-google-maps](https://badges.gitter.im/Vheissu/aurelia-google-maps.svg)](https://gitter.im/Vheissu/aurelia-google-maps?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
A highly configurable custom element for use in your Aurelia applications for
inserting Google Maps into your application.

## To Install

``` shell
jspm install aurelia-google-maps
```

## Configuring For Use

Inside of your `main.js`/`main.ts` file simply load the plugin inside of
the configure method using `.plugin()`

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

Now you have Google Maps configured, to use it simply use the custom
element `<google-map></google-map>` in your views.

### Latitude/Longitude

Provide standard latitude and longitude values.

``` html
<template>
    <google-map latitude="37.323" longitude="-122.0527"></google-map>
</template>
```

### Address

Provide a string as an address which then gets geocoded and the map is
centred on this particular address.

``` html
<template>
    <google-map address="1600 Amphitheatre Parkway. Mountain View, CA 94043"></google-map>
</template>
```

### Zooming A Map

Taking the first example, let's add a `zoom` attribute and supply a value of 15.
By default this is 8 if you do not supply a zoom value.

``` html
<template>
    <google-map latitude="37.323" longitude="-122.0527" zoom="15"></google-map>
</template>
```

These properties also support working with Aurelia's databinding, so you can
bind any of the above to variables in your viewmodel and the map updates
when these values are changed.

### Map Click Event

It is possible to catch the map click events as specified by the [Google Maps documentation](https://developers.google.com/maps/documentation/javascript/events#ShapeEvents).
The map's `click` event is added as a CustomEvent to the `<google-map>` DOM
element with the event data added to the `detail` key.
Some events are also propagated via Aurelia's Event Aggregator.

#### Example

``` html
<google-map map-click.delegate="myEventHandler($event)"></google-map>
```

``` javascript
myEventHandler(event) {
    var latLng = event.detail.latLng,
        lat = latLng.lat(),
        lng = latLng.lng();
}
```

### Event Aggregation

In addition to the `map-click` event mentioned above, there are several events
propagated via the Aurelia Event Aggregator framework:

*   `googlemap:click` - The equivalent of the `map-click` above

*   `googlemap:bounds_changed` - emitted when the map is dragged or zoomed,
payload is the new map bounds as a `LatLngBounds` object.

*   `googlemap:marker:click` - emitted when a map marker is clicked, payload
is the `Marker` object for the clicked marker

### Render array of markers

Markers can be bound to the element with the `markers` attribute like below:

``` html
<google-map markers.bind="myMarkers"></google-map>
```

This markers variable should be an array of objects with at minimum the `latitude` and `longitude` key/value pairs:

``` javascript
var myMarkers = [
	{
        latitude: -27.451673,
        longitude: 153.043981
    },
    {
        latitude: 37.754582,
        longitude: -122.446418,
        icon: '/images/bullseye.png',
        title: 'My Big Target',
        custom: {id: 123456}
    }
];
```

#### Supported marker properties

*   `latitude` (required)
*   `longitude` (required)
*   `icon` (optional) - string|Icon|Symbol - see [docs](<https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions>)
*   `label` (optional) - string|MarkerLabel - see [docs](<https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions>)
*   `title` (optional) - string - Rollover text, see [docs](<https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions>)
*   `custom` (optional) - store arbitrary data (e.g. an `id` field) in this object, retrieve it from the `googlemap:marker:click` event payload

## Supported Properties

*   latitude: A latitude value for the map
*   longitude: A longitude value for the map
*   address: Provide an address that gets geocoded into latitude and longitude coordinates
*   zoom: A zoom value, default is 8
*   disableDefaultUI: A boolean of true or false. Default is false.
*   markers: An array of objects with key/value pairs as described above.

## Supported Events

- map-click: Delegate a handler with `map-click.delegate="callback($event)"`

## Todo
This element still is missing some features, but they are in development.

*   Expand upon markers ability to allow markers supplied by plugin to add
    themselves

*   Add in more configuration options

*   Work on making the custom element easier to extend

*   Work on supporting click events and events inside of the map,
    with callbacks support

*   Allow more marker options (color, label, etc.)
