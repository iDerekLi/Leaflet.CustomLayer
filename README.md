# Leaflet.CustomLayer

[![Build Status](https://travis-ci.org/iDerekLi/Leaflet.CustomLayer.svg?branch=master)](https://travis-ci.org/iDerekLi/Leaflet.CustomLayer)
[![npm version](https://img.shields.io/npm/v/leaflet-customlayer.svg?style=flat-square)](https://www.npmjs.com/package/leaflet-customlayer)
[![npm downloads](https://img.shields.io/npm/dm/leaflet-customlayer.svg?style=flat-square)](https://www.npmjs.com/package/leaflet-customlayer)
[![npm license](https://img.shields.io/npm/l/leaflet-customlayer.svg?style=flat-square)](https://github.com/iderekli/Leaflet.CustomLayer)

Leaflet overlay plugin: L.CustomLayer - fully custom Layer.

## Features

- A custom layer is a layer that develops a defined drawing method.
  (For example: Canvas\SVG\Image\Video\DIV Layer)

![Screenshot canvasLayer](/screenshots/canvasLayer.jpg?raw=true)

![Screenshot svgLayerLayer](/screenshots/svgLayer.jpg?raw=true)

## Installation

Using npm:

```shell
$ npm install leaflet-customlayer
```

or Yarn:

```shell
$ yarn add leaflet-customlayer
```

Using cdn:

```html
<script type="text/javascript" src="https://unpkg.com/leaflet-customlayer@2.0.0/dist/Leaflet.CustomLayer.js"></script>
```

## Example

```javascript
var customLayer = new L.customLayer({
  container: document.createElement(element), // The DomElement object to display.
  minZoom: 0, // Minimum zoom level of the layer.
  maxZoom: 18, // Maximum zoom level of the layer.
  opacity: 1, // Opacity of the layer.
  visible: true, // Visible of the layer.
  zIndex: 100 // The explicit zIndex of the layer.
});

customLayer.on("layer-beforemount", function() {
  console.log("layerBeforeMount");
});

customLayer.on("layer-mounted", function() {
  console.log("layerMounted");
})

customLayer.on("layer-render", function() {
  console.log("layerRender");
});

customLayer.on("layer-beforedestroy", function() {
  console.log("layerBeforeDestroy");
});

customLayer.on("layer-destroyed", function() {
  console.log("layerDestroyed");
});

customLayer.addTo(map);
```

## API

### CustomLayer

Leaflet overlay plugin: L.CustomLayer - fully custom Layer. Extends [Layer](https://leafletjs.com/reference-1.4.0.html#layer).

#### Options

| Option | Description | Type | Default |
| :------ | :------ | :------ | :------ |
| container | The DomElement object to display. | DomElement | - |
| minZoom | Minimum zoom level of the layer. | Number | * |
| maxZoom | Maximum zoom level of the layer. | Number | * |
| opacity | Opacity of the layer. | Number | 1 |
| visible | Visible of the layer. | Boolean | true |
| zIndex | The explicit zIndex of the layer. | Number | canvas: 100\ svg: 200\ other: 100 |
| padding | How much to extend the clip area around the map view (relative to its size) e.g. 0.1 would be 10% of map view in each direction. | Number | 0 |
| tolerance | How much to extend click tolerance round a path/object on the map. | Number | 0 |

#### Methods

| Method | Description | Return |
| :------ | :------ | :------ |
| addTo() | layer add to the map  |  |
| remove() | layer remove the map  |  |
| getContainer() | Get the DomElement object | DomElement |
| setContainer(container) | Set the DomElement object | this |
| getOpacity() | Get the opacity of the layer. | Number |
| setOpacity(<Number>opacity) | Set the opacity of the layer. | this |
| getZIndex() | Get the zIndex of the layer. | Number |
| setZIndex(<Number>zIndex) | Set the zIndex of the layer. | this |
| show() | layer show | this |
| hide() | layer hide | this |

#### Events

| Event | Data | Description |
| :------ | :------ | :------ |
| layer-beforemount | Event | Fired before the layer is mounting begins. |
| layer-mounted | Event | Fired after the layer is has been mounted. |
| layer-render | Event | Fired when the layer render its bounds, center and zoom, for example when its map has moved. |
| layer-beforedestroy | Event | Fired before the layer is destroyed. |
| layer-destroyed | Event | Fired after the layer is has been destroyed. |

## License

MIT
