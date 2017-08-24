# aurelia-google-maps

[![Join the chat at https://gitter.im/Vheissu/aurelia-google-maps](https://badges.gitter.im/Vheissu/aurelia-google-maps.svg)](https://gitter.im/Vheissu/aurelia-google-maps?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
A highly configurable custom element for use in your Aurelia applications for
inserting Google Maps into your application.

## To Install

**Webpack/Aurelia CLI**

``` shell
npm install aurelia-google-maps --save
```

### CLI User?
The Aurelia CLI requires some additional configuration to use this plugin. Open up your `aurelia.json` file located in the `aurelia_project` directory and at the bottom of the `dependencies` section add in the following:

```
{
    "name": "aurelia-google-maps",
    "path": "../node_modules/aurelia-google-maps/dist/amd",
    "main": "index"
}
```

**Jspm**

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
                apiKey: 'myapiKey', // use `false` to disable the key
                apiLibraries: 'drawing,geometry', //get optional libraries like drawing, geometry, ... - comma seperated list
                options: { panControl: true, panControlOptions: { position: 9 } }, //add google.maps.MapOptions on construct (https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapOptions)
                language:'' | 'en', // default: uses browser configuration (recommended). Set this parameter to set another language (https://developers.google.com/maps/documentation/javascript/localization)
                region: '' | 'US' // default: it applies a default bias for application behavior towards the United States. (https://developers.google.com/maps/documentation/javascript/localization)
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

### Automatically update bounds from markers

Automatically adjust the bounds of the map by using the provided markers

``` html
<template>
    <google-map markers.bind="myMarkers" auto-update-bounds="true"></google-map>
</template>
```

These properties also support working with Aurelia's databinding, so you can
bind any of the above to variables in your viewmodel and the map updates
when these values are changed.

### Map loaded callback (with map reference)
When the map is loaded and instantiated, you can call a function inside of your view-model.

``` html
<template>
    <google-map map-loaded.call="myLoadedCallback(map, $event)"></google-map>
</template>
```

### Map Type

Set the Google Basic Map Type.  See [docs](https://developers.google.com/maps/documentation/javascript/maptypes#BasicMapTypes)

##### Supported Constants
* HYBRID - This map type displays a transparent layer of major streets on satellite images.
* ROADMAP -	This map type displays a normal street map.
* SATELLITE -	This map type displays satellite images.
* TERRAIN	- This map type displays maps with physical features such as terrain and vegetatio

##### Example
``` html
<template>
    <google-map markers.bind="myMarkers" map-type="HYBRID"></google-map>
</template>
```

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

*   `googlemap:marker:mouse_over`- emitted when the mouse enters the marker, payload is the `Marker`object for the entered marker

*   `googlemap:marker:mouse_out` - emitted when the mouse exits the marker, payload is the `Marker` object for the exited marker

*   `googlemap:infowindow:domready` - emitted when the infoWindow is fully loaded, payload is the `InfoWindow` object for the related marker

### Render array of markers

Markers can be bound to the element with the `markers` attribute like below:

``` html
<google-map markers.bind="myMarkers"></google-map>
```

This markers variable should be an array of objects with at minimum either both the `latitude` and `longitude` key/value pairs or just the `address` key/value pair.
Addresses for which geocoding fails get logged to the console as info:

``` javascript
var myMarkers = [
	{
        latitude: -27.451673,
        longitude: 153.043981
    },
    {
       address: '1 Avenue B New York, NY 10009'
    },
    {
        latitude: 37.754582,
        longitude: -122.446418,
        icon: '/images/bullseye.png',
        title: 'My Big Target',
        custom: {id: 123456},
        infoWindow: {content: `
                <div id="content">
                  <div id="siteNotice"></div>
                  <h1 id="firstHeading" class="firstHeading">Uluru</h1>
                  <div id="bodyContent">
                    <p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large sandstone rock formation in the southern part of the Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) south west of the nearest large town, Alice Springs; 450&#160;km (280&#160;mi) by road. Kata Tjuta and Uluru are the two major features of the Uluru - Kata Tjuta National Park. Uluru is sacred to the Pitjantjatjara and Yankunytjatjara, the Aboriginal people of the area. It has many springs, waterholes, rock caves and ancient paintings. Uluru is listed as a World Heritage Site.</p>
                    <p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">https://en.wikipedia.org/w/index.php?title=Uluru</a> last visited June 22, 2009).</p>
                  </div>
                </div>`}
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
*   `infoWindow` (optional) - object - If set, the `googlemap:marker:click` evetn will not be called, instead an infowindow containing the given content will show up - see [docs](https://developers.google.com/maps/documentation/javascript/infowindows)

### Drawing Mode

Allows usage of Google Maps' Drawing API to add Markers, Polylines, Polygons, Rectangles and Circles to the map instance. To allow this, simply set the defaults as below:

``` html
<google-map draw-enable.bind="true" draw-mode="polygon"></google-map>
```

The `draw-mode` can take the same values as defined [here](https://developers.google.com/maps/documentation/javascript/reference#OverlayType)

#### Drawing Events

One of the drawing events has been exposed to the element as a `CustomEvent` and a callback can be set as below:

``` html
<google-map map-overlay-complete.delegate="callback($event)"></google-map>
```

The event object is the same as given [here](https://developers.google.com/maps/documentation/javascript/reference#OverlayCompleteEvent) with the addition of the `encoded` variable. This is the encoded polyline (you can play around with it [here](https://developers.google.com/maps/documentation/utilities/polylineutility)).

In addition to the `map-overlay-complete` event, an event is also propagated through Aurelia's Event Aggregator:

* `googlemap:draw:overlaycomplete` - Emitted when an overlay drawing has been completed

## Supported Properties

*   latitude: A latitude value for the map
*   longitude: A longitude value for the map
*   address: Provide an address that gets geocoded into latitude and longitude coordinates
*   zoom: A zoom value, default is 8
*   disableDefaultUi: A boolean of true or false. Default is false. (use disable-default-ui="true")
##### Example:
``` html
<google-map disable-default-ui="true"></google-map>
```

*   markers: An array of objects with key/value pairs as described above.
*   options: A Google Maps options object specified [here](https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapOptions)

## Supported Events

- map-click: Delegate a handler with `map-click.delegate="callback($event)"`
- map-overlay-complete: Delegate a handler with `map-overlay-complete.delegate="callback($event)"`

## Todo
This element still is missing some features, but they are in development.

*   Expand upon markers ability to allow markers supplied by plugin to add
    themselves

*   Add in more configuration options

*   Work on making the custom element easier to extend

*   Work on supporting click events and events inside of the map,
    with callbacks support

*   Allow more marker options (color, label, etc.)
