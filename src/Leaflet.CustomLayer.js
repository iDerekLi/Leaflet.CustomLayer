import L from "leaflet";

/*
// Exmaple
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
*/

class CustomLayer extends (L.Layer ? L.Layer : L.Class) {
  constructor(definition) {
    super(definition);

    const _definition = {
      el: null, // The DomElement object to display
      zooms: [0, 18], // Set the visibility level, [min, max]
      opacity: 1, // The opacity of the layer, [0,1]
      visible: true, // Is the layer visible
      zIndex: 120, // The zIndex of the layer
      alwaysRender: true, // Whether to redraw during zoom panning, complex drawing suggestions are set to false
      layerWillMount: null, // Lifecycle - before adding a layer
      layerDidMount: null, // Lifecycle - after the layer is added
      layerRender: null, // Lifecycle - render
      layerWillUnmount: null, // Lifecycle - before layer removal
      layerDidUnmount: null, // Lifecycle - layer has been removed
      ...definition
    };

    const _options = {
      el: _definition.el,
      opacity: _definition.opacity,
      visible: _definition.visible,
      zIndex: _definition.zIndex,
      zooms: _definition.zooms,
      alwaysRender: _definition.alwaysRender
    };
    L.setOptions(this, _options);

    if (typeof _definition.layerWillMount === "function") {
      this.layerWillMount = _definition.layerWillMount;
    }
    if (typeof _definition.layerDidMount === "function") {
      this.layerDidMount = _definition.layerDidMount;
    }
    if (typeof _definition.layerRender === "function") {
      this.layerRender = _definition.layerRender;
    }
    if (typeof _definition.layerWillUnmount === "function") {
      this.layerWillUnmount = _definition.layerWillUnmount;
    }
    if (typeof _definition.layerDidUnmount === "function") {
      this.layerDidUnmount = _definition.layerDidUnmount;
    }
  }

  // Built-in life cycle
  beforeAdd(map) {
    this._map = map;

    // register Events
    this._registerEvents = false;
    this._eventType = "";
    this._zoomVisible = true;

    // --If the Element instance already exists, simulate a position offset event。
    // (the map position changes when the layer is removed from the map, and if the layer is added to the map at a time, it will deviate)
    if (this.getElement()) {
      this._animateZoom({
        center: this._map.getCenter(),
        zoom: this._map.getZoom(),
        noUpdate: undefined,
        type: "zoomanim",
        target: this._map,
        sourceTarget: this._map
      });
    }

    this.layerWillMount && this.layerWillMount.bind(this)();
  }

  getEvents() {
    this._registerEvents = true;
    // Layer trigger priority
    // move: movestart -> move -> moveend
    // zoom: zoomstart -> movestart -> zoomanim -> zoom -> move -> zoomend -> moveend
    // resize: move -> resize -> moveend
    let events = {
      resize: this._onLayerResize,
      movestart: this._onLayerMovestart,
      move: this._onLayerMove,
      moveend: this._onLayerMoveend,
      zoomstart: this._onLayerZoomstart,
      zoom: this._onLayerZoom,
      zoomend: this._onLayerZoomend
    };
    if (this._map.options.zoomAnimation && L.Browser.any3d) {
      events.zoomanim = this._onLayerZoomanim;
    }

    return events;
  }

  onAdd(map) {
    this._map = map;

    const el = this.getElement();

    const size = this._map.getSize();
    this._setElementSize(size);

    this.setOpacity(this.options.opacity);
    this.setZIndex(this.options.zIndex);

    const animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(el, "leaflet-layer");
    L.DomUtil.addClass(el, `leaflet-zoom-${animated ? "animated" : "hide"}`);

    if (!this._registerEvents) {
      this._map.on(this.getEvents(), this);
    }

    if (!this.options.visible) {
      console.log(this.options.visible);
      this._map.off(this.getEvents(), this);
      return;
    }

    this._map.getPanes().overlayPane.appendChild(el);

    this.layerDidMount && this.layerDidMount.bind(this)();

    if (!this.options.visible) {
      this.hide();
    }

    this._needRedraw();
  }

  onRemove(map) {
    this.layerWillUnmount && this.layerWillUnmount.bind(this)();

    if (this._frame) {
      L.Util.cancelAnimFrame(this._frame);
      this._frame = null;
    }

    try {
      this._map.getPanes().overlayPane.removeChild(this.getElement());
    } catch (e) {}

    if (this._registerEvents) {
      this._registerEvents = false;
      this._map.off(this.getEvents(), this);
    }
    this._map.off({ zoom: this._onZoomVisible }, this);

    this.layerDidUnmount && this.layerDidUnmount.bind(this)();
  }

  _render() {
    this.layerRender && this.layerRender.bind(this)();
    this._frame = null;
  }

  // Built-in Event
  _onLayerResize(event) {
    if (this._eventType !== "") return;
    this._eventType = "resize";
    if (this._eventType !== "resize") return;
    // resize
    this._setElementSize(event.newSize);
    this._setElementPosition();
    this._render();

    this._eventType = "";
  }
  _onLayerMovestart(event) {
    if (this._eventType !== "") return;
    this._eventType = "move";
    if (this._eventType !== "move") return;
    // movestart
  }
  _onLayerMove(event) {
    if (this._eventType !== "move") return;
    if (!this.options.alwaysRender) return;
    // move
    this._setElementPosition();
    this._render();
  }
  _onLayerMoveend(event) {
    if (this._eventType !== "move") return;
    // moveend
    this._setElementPosition();
    this._render();

    this._eventType = "";
  }
  _onLayerZoomstart(event) {
    if (this._eventType !== "") return;
    this._eventType = "zoom";
    if (this._eventType !== "zoom") return;
    // zoomstart
  }
  _onLayerZoomanim(event) {
    if (this._eventType !== "zoom") return;
    // zoomanim
    this._animateZoom(event);
  }
  _onLayerZoom(event) {
    if (this._eventType !== "zoom") return;
    if (!this.options.alwaysRender) return;
    // zoom
    if (!this._isZoomVisible()) {
      this._zoomHide();
      this._eventType = "";
      return;
    }

    this._setElementPosition();
    this._render();
  }
  _onLayerZoomend(event) {
    if (this._eventType !== "zoom") return;
    // zoomend
    if (!this._isZoomVisible()) {
      this._zoomHide();
      this._eventType = "";
      return;
    }

    this._setElementPosition();
    this._render();

    this._eventType = "";
  }
  _onZoomVisible() {
    if (this._isZoomVisible()) {
      this._zoomShow();
    } else {
      this._zoomHide();
    }
  }

  // Built-in Methods
  _needRedraw() {
    if (!this._frame) {
      this._frame = L.Util.requestAnimFrame(this._render, this);
    }
    return this;
  }

  _setElementSize(size) {
    const element = this.getElement();
    element.setAttribute("width", size.x);
    element.setAttribute("height", size.y);
    element.style.width = size.x + "px";
    element.style.height = size.y + "px";
  }
  _setElementPosition(point = [0, 0]) {
    const topLeft = this._map.containerPointToLayerPoint(point);
    L.DomUtil.setPosition(this.getElement(), topLeft);
  }

  // L.DomUtil.setTransform stand-in
  _setTransform(el, offset, scale) {
    const pos = offset || new L.Point(0, 0);

    el.style[L.DomUtil.TRANSFORM] =
      (L.Browser.ie3d
        ? `translate(${pos.x}px, ${pos.y}px)`
        : `translate3d(${pos.x}px, ${pos.y}px, 0)`) +
      (scale ? ` scale(${scale})` : "");
  }

  _animateZoom(e) {
    let scale = this._map.getZoomScale(e.zoom);
    // -- different calc of animation zoom  in leaflet 1.0.3 thanks @peterkarabinovic, @jduggan1
    const offset = L.Layer
      ? this._map._latLngBoundsToNewLayerBounds(
          this._map.getBounds(),
          e.zoom,
          e.center
        ).min
      : this._map
          ._getCenterOffset(e.center)
          ._multiplyBy(-scale)
          .subtract(this._map._getMapPanePos());

    (L.DomUtil.setTransform || this._setTransform)(
      this.getElement(),
      offset,
      scale
    );
  }

  _isZoomVisible() {
    const minZoom = this.options.zooms[0];
    const maxZoom = this.options.zooms[1];
    const zoom = this._map.getZoom();

    const isVisible = zoom >= minZoom && zoom <= maxZoom;

    return isVisible;
  }

  _zoomShow() {
    if (this._zoomVisible) return;
    this._zoomVisible = true;

    this._map.off({ zoom: this._onZoomVisible }, this);

    if (!this.options.visible) return;
    this._map.on(this.getEvents(), this);
    this._map.getPanes().overlayPane.appendChild(this.getElement());
    this._setElementPosition();
    this._render();
  }

  _zoomHide() {
    if (!this._zoomVisible) return;
    this._zoomVisible = false;

    this._map.off(this.getEvents(), this);
    this._map.on({ zoom: this._onZoomVisible }, this);

    try {
      this._map.getPanes().overlayPane.removeChild(this.getElement());
    } catch (e) {}
  }

  // API
  addTo(map) {
    map.addLayer(this);
    return this;
  }

  getElement() {
    return this.options.el;
  }

  setElement(element) {
    this.options.el = element;
  }

  getOpacity() {
    return this.options.opacity;
  }

  setOpacity(opacity) {
    this.getElement().style.opacity = this.options.opacity = opacity;
    return opacity;
  }

  getZIndex() {
    return this.options.zIndex;
  }

  setZIndex(zIndex) {
    this.getElement().style.zIndex = this.options.zIndex = zIndex;
    return zIndex;
  }

  show() {
    if (this.options.visible) return;
    this.options.visible = true;

    this._map.on({ zoom: this._onZoomVisible }, this);
    this._onZoomVisible();
  }

  hide() {
    if (!this.options.visible) return;
    this.options.visible = false;

    this._map.off(this.getEvents(), this);
    this._map.off({ zoom: this._onZoomVisible }, this);

    try {
      this._map.getPanes().overlayPane.removeChild(this.getElement());
    } catch (e) {}
  }
}

function customLayer(definition) {
  return new CustomLayer(definition);
}

/**
 * Plugin Props
 */

L.CustomLayer = CustomLayer;
L.customLayer = customLayer;

/**
 * Exports
 */

export { CustomLayer };
export { customLayer };
export default customLayer;
