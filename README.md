# Leaflet.CustomLayer

[![Build Status](https://travis-ci.org/iDerekLi/Leaflet.CustomLayer.svg?branch=master)](https://travis-ci.org/iDerekLi/Leaflet.CustomLayer)
[![npm version](https://img.shields.io/npm/v/leaflet-customlayer.svg?style=flat-square)](https://www.npmjs.com/package/leaflet-customlayer)
[![npm downloads](https://img.shields.io/npm/dm/leaflet-customlayer.svg?style=flat-square)](https://www.npmjs.com/package/leaflet-customlayer)
[![npm license](https://img.shields.io/npm/l/leaflet-customlayer.svg?style=flat-square)](https://github.com/iderekli/Leaflet.CustomLayer)

Leaflet overlay plugin: L.CustomLayer - fully custom Layer.

## Features

- A custom layer is a layer that develops a defined drawing method.
  (For example: Canvas\SVG\Image\Video\DIV Layer)

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
<script type="text/javascript" src="https://unpkg.com/leaflet-customlayer@1.0.0/dist/Leaflet.CustomLayer.js"></script>
```

## Example

```javascript
var customLayer = new L.customLayer({
  el: document.createElement(element), // The DomElement object to display
  zooms: [0, 18], // Set the visibility level, [min, max]
  opacity: 1, // The opacity of the layer, [0,1]
  visible: true, // Is the layer visible
  zIndex: 120, // The zIndex of the layer 
  alwaysRender: true // Whether to redraw during zoom panning, complex drawing suggestions are set to false
});

customLayer.layerWillMount = function() {
  console.log("layerWillMount");
};

customLayer.layerDidMount = function() {
  console.log("layerDidMount");
};

customLayer.layerRender = function() {
  console.log("layerRender");
};

customLayer.layerWillUnmount = function() {
  console.log("WillUnmount");
};

customLayer.layerDidUnmount = function() {
  console.log("DidUnmount");
}

customLayer.addTo(map);
```

## API

### Options

| Option | Description | Type | Default |
| :------ | :------ | :------ | :------ |
| el | The DomElement object to display. | DomElement | - |
| zooms | Set the visibility level, [min, max]. | Array | [0, 18] |
| opacity | The opacity of the layer, [0, 1] | Number | 1 |
| visible | Is the layer visible. | Boolean | true |
| zIndex | The zIndex of the layer. | Nunber | 120 |
| alwaysRender | Whether to redraw during zoom panning, complex drawing suggestions are set to false | Boolean | true |

### Methods

| Method | Description | Return |
| :------ | :------ | :------ |
| addTo() | layer add to the map  |  |
| remove() | layer remove the map  |  |
| getElement() | Get the DomElement object | DomElement |
| setElement() | Set the DomElement object |  |
| getOpacity() | Get the opacity of the layer. | Number |
| setOpacity() | Set the opacity of the layer. |  |
| getZIndex() | Get the zIndex of the layer. | Number |
| setZIndex() | Set the zIndex of the layer. |  |
| show() | layer show | - |
| hide() | layer hide | - |

### Lifecycle

| Name | Description |
| :------ | :------ |
| layerWillMount | before adding a layer |
| layerDidMount | after the layer is added |
| layerRender | render |
| layerWillUnmount | before layer removal |
| layerDidUnmount | layer has been removed |

## License

MIT
