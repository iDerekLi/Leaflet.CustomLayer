import L from "leaflet";

/**
 * @class CustomLayer
 * @inherits Layer
 *
 * Leaflet overlay plugin: L.CustomLayer - fully custom Layer.
 */
const CustomLayer = L.Layer.extend({
  // CustomLayer options
  options: {
    // How much to extend the clip area around the map view (relative to its size)
    // e.g. 0.1 would be 10% of map view in each direction
    padding: 0,

    // How much to extend click tolerance round a path/object on the map
    tolerance: 0,

    // The DomElement object to display
    container: null,

    // The opacity of the layer, [0,1]
    opacity: 1,

    // Is the layer visible
    visible: true,

    // The zIndex of the layer
    zIndex: undefined,

    // Set the visibility min zoom level
    minZoom: 0,

    // Set the visibility max zoom level
    maxZoom: 18

    // Whether to redraw during zoom panning, complex drawing suggestions are set to false (next version)
    // alwaysRender: true
  },

  initialize(options) {
    L.setOptions(this, options);

    /* Built-in Date */
    L.stamp(this);
    this._map = undefined;
    this._container = undefined;
    this._bounds = undefined;
    this._center = undefined;
    this._zoom = undefined;
    this._padding = undefined;
  },

  /* Built-in Lifecycle */

  beforeAdd() {
    this._zoomVisible = true;
  },

  getEvents() {
    // Layer trigger priority
    // move: movestart -> move -> moveend
    // zoom: zoomstart -> movestart -> zoomanim -> zoom -> move -> zoomend -> moveend
    // resize: move -> resize -> moveend
    let events = {
      viewreset: this._onLayerViewReset,
      zoom: this._onLayerZoom,
      moveend: this._onLayerMoveEnd,
      zoomend: this._onLayerZoomEnd
    };
    if (this._zoomAnimated) {
      events.zoomanim = this._onLayerAnimZoom;
    }
    return events;
  },

  onAdd() {
    this.fire("layer-beforemount"); // Lifecycle beforeMount

    if (!this._container) {
      this._initContainer(); // defined by renderer implementations
    }

    this.setOpacity(this.options.opacity);

    if (window.isNaN(this.options.zIndex)) {
      switch (this._container.tagName) {
        case "CANVAS": {
          this.setZIndex(100);
          break;
        }
        case "SVG": {
          this.setZIndex(200);
          break;
        }
        default: {
          this.setZIndex(100);
        }
      }
    } else {
      this.setZIndex(this.options.zIndex);
    }

    this.getPane().appendChild(this._container);

    this._onZoomVisible();

    this.fire("layer-mounted"); // Lifecycle mounted

    this._update();
  },

  onRemove() {
    this.fire("layer-beforedestroy"); // Lifecycle beforeDestroy

    this._destroyContainer();

    this.fire("layer-destroyed"); // Lifecycle destroyed
  },

  /* Built-in Events */

  _onLayerViewReset() {
    this._reset();
  },

  _onLayerAnimZoom(ev) {
    this._updateTransform(ev.center, ev.zoom);
  },

  _onLayerZoom() {
    this._updateTransform(this._map.getCenter(), this._map.getZoom());
  },

  _onLayerZoomEnd() {},

  _onLayerMoveEnd() {
    if (!this._isZoomVisible()) {
      this._zoomHide();
      return;
    }

    this._update();
  },

  _onZoomVisible() {
    if (this._isZoomVisible()) {
      this._zoomShow();
    } else {
      this._zoomHide();
    }
  },

  /* Built-in Methods */

  _initContainer() {
    const container = (this._container = this.options.container);

    L.DomUtil.addClass(container, "leaflet-layer");

    if (this._zoomAnimated) {
      L.DomUtil.addClass(this._container, "leaflet-zoom-animated");
    }
  },

  _destroyContainer() {
    L.DomUtil.remove(this._container);
    delete this._container;
  },

  _isZoomVisible() {
    const minZoom = this.options.minZoom;
    const maxZoom = this.options.maxZoom;
    const zoom = this._map.getZoom();

    const isVisible = zoom >= minZoom && zoom <= maxZoom;

    return isVisible;
  },

  _zoomShow() {
    if (this._zoomVisible) return;
    this._zoomVisible = true;

    this._map.off({ zoomend: this._onZoomVisible }, this);

    if (!this.options.visible) return;
    this._map.on(this.getEvents(), this);

    this.getContainer().style.display = "";

    // Subsequent moveend events take the place of update
    // this._update();
  },

  _zoomHide() {
    if (!this._zoomVisible) return;
    this._zoomVisible = false;

    this._map.off(this.getEvents(), this);
    this._map.on({ zoomend: this._onZoomVisible }, this);

    this.getContainer().style.display = "none";
  },

  _updateTransform(center, zoom) {
    const scale = this._map.getZoomScale(zoom, this._zoom);
    const position = L.DomUtil.getPosition(this._container);
    const viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding);
    const currentCenterPoint = this._map.project(this._center, zoom);
    const destCenterPoint = this._map.project(center, zoom);
    const centerOffset = destCenterPoint.subtract(currentCenterPoint);
    const topLeftOffset = viewHalf
      .multiplyBy(-scale)
      .add(position)
      .add(viewHalf)
      .subtract(centerOffset);

    if (L.Browser.any3d) {
      L.DomUtil.setTransform(this._container, topLeftOffset, scale);
    } else {
      L.DomUtil.setPosition(this._container, topLeftOffset);
    }
  },

  _update() {
    if (this._map._animatingZoom && this._bounds) {
      return;
    }

    this.__update();

    let b = this._bounds;
    let container = this._container;

    L.DomUtil.setPosition(container, b.min);

    this.fire("layer-render"); // Lifecycle render
  },
  __update() {
    // Update pixel bounds of renderer container (for positioning/sizing/clipping later)
    // Subclasses are responsible of firing the 'update' event.
    const p = this.options.padding;
    const size = this._map.getSize();
    const min = this._map.containerPointToLayerPoint(size.multiplyBy(-p));

    this._padding = size.multiplyBy(-p);

    // this._bounds = new L.Bounds(
    //   min.round(),
    //   min.add(size.multiplyBy(1 + p * 2)).round()
    // );
    this._bounds = new L.Bounds(min, min.add(size.multiplyBy(1 + p * 2)));

    this._center = this._map.getCenter();
    this._zoom = this._map.getZoom();
  },

  _reset() {
    this._update();
    this._updateTransform(this._center, this._zoom);
  },

  /**
   * API
   */

  /* Methods */

  getContainer() {
    return this._container;
  },

  setContainer(newContainer) {
    const old = this.getContainer();
    const parent = old.parentNode;

    delete this._container;
    this.options.container = newContainer;

    if (!this._container) {
      this._initContainer();
    }

    this.setOpacity(this.options.opacity);

    if (window.isNaN(this.options.zIndex)) {
      switch (this._container.tagName) {
        case "CANVAS": {
          this.setZIndex(100);
          break;
        }
        case "SVG": {
          this.setZIndex(200);
          break;
        }
        default: {
          this.setZIndex(100);
        }
      }
    } else {
      this.setZIndex(this.options.zIndex);
    }

    if (parent) {
      parent.replaceChild(newContainer, old);
    } else {
      this.getPane().appendChild(newContainer);
    }

    this._update();

    return this;
  },

  getOpacity() {
    return this.options.opacity;
  },

  setOpacity(opacity) {
    this.getContainer().style.opacity = this.options.opacity = opacity * 1;
    return this;
  },

  getZIndex() {
    return this.options.zIndex;
  },

  setZIndex(zIndex) {
    this.getContainer().style.zIndex = this.options.zIndex = zIndex * 1;
    return this;
  },

  show() {
    if (this.options.visible) return;
    this.options.visible = true;

    if (!this._isZoomVisible()) {
      this._zoomHide();
      return;
    }

    this._map.on(this.getEvents(), this);
    this.getContainer().style.display = "";
    this._update();

    return this;
  },

  hide() {
    if (!this.options.visible) return;
    this.options.visible = false;

    this._zoomHide();

    this._map.off(this.getEvents(), this);
    this.getContainer().style.display = "none";

    return this;
  }

  /* Events */
  // on("layer-beforemount", fn);
  // on("layer-mounted", fn);
  // on("layer-render", fn);
  // on("layer-beforedestroy", fn);
  // on("layer-destroyed", fn);
});

// @factory L.customLayer(options?: Renderer options)
// Creates a CustomLayer renderer with the given options.
function customLayer(options) {
  return L.customLayer ? new CustomLayer(options) : null;
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
