/*
 * @class Renderer
 * @inherits Layer
 * @aka L.Renderer
 *
 * Base class for vector renderer implementations (`SVG`, `Canvas`). Handles the
 * DOM container of the renderer, its bounds, and its zoom animation.
 *
 * A `Renderer` works as an implicit layer group for all `Path`s - the renderer
 * itself can be added or removed to the map. All paths use a renderer, which can
 * be implicit (the map will decide the type of renderer and use it automatically)
 * or explicit (using the [`renderer`](#path-renderer) option of the path).
 *
 * Do not use this class directly, use `SVG` and `Canvas` instead.
 *
 * @event update: Event
 * Fired when the renderer updates its bounds, center and zoom, for example when
 * its map has moved
 */

var Renderer = Layer.extend({
  // @section
  // @aka Renderer options
  options: {
    // @option padding: Number = 0.1
    // How much to extend the clip area around the map view (relative to its size)
    // e.g. 0.1 would be 10% of map view in each direction
    padding: 0.1,

    // @option tolerance: Number = 0
    // How much to extend click tolerance round a path/object on the map
    tolerance: 0
  },

  initialize: function(options) {
    setOptions(this, options);
    stamp(this);
    this._layers = this._layers || {};
  },

  onAdd: function() {
    if (!this._container) {
      this._initContainer(); // defined by renderer implementations

      if (this._zoomAnimated) {
        addClass(this._container, "leaflet-zoom-animated");
      }
    }

    this.getPane().appendChild(this._container);
    this._update();
    this.on("update", this._updatePaths, this);
  },

  onRemove: function() {
    this.off("update", this._updatePaths, this);
    this._destroyContainer();
  },

  getEvents: function() {
    var events = {
      viewreset: this._reset,
      zoom: this._onZoom,
      moveend: this._update,
      zoomend: this._onZoomEnd
    };
    if (this._zoomAnimated) {
      events.zoomanim = this._onAnimZoom;
    }
    return events;
  },

  _onAnimZoom: function(ev) {
    this._updateTransform(ev.center, ev.zoom);
  },

  _onZoom: function() {
    this._updateTransform(this._map.getCenter(), this._map.getZoom());
  },

  _updateTransform: function(center, zoom) {
    var scale = this._map.getZoomScale(zoom, this._zoom),
      position = getPosition(this._container),
      viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
      currentCenterPoint = this._map.project(this._center, zoom),
      destCenterPoint = this._map.project(center, zoom),
      centerOffset = destCenterPoint.subtract(currentCenterPoint),
      topLeftOffset = viewHalf
        .multiplyBy(-scale)
        .add(position)
        .add(viewHalf)
        .subtract(centerOffset);

    if (any3d) {
      setTransform(this._container, topLeftOffset, scale);
    } else {
      setPosition(this._container, topLeftOffset);
    }
  },

  _reset: function() {
    this._update();
    this._updateTransform(this._center, this._zoom);

    for (var id in this._layers) {
      this._layers[id]._reset();
    }
  },

  _onZoomEnd: function() {
    for (var id in this._layers) {
      this._layers[id]._project();
    }
  },

  _updatePaths: function() {
    for (var id in this._layers) {
      this._layers[id]._update();
    }
  },

  _update: function() {
    // Update pixel bounds of renderer container (for positioning/sizing/clipping later)
    // Subclasses are responsible of firing the 'update' event.
    var p = this.options.padding,
      size = this._map.getSize(),
      min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();

    this._bounds = new Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());

    this._center = this._map.getCenter();
    this._zoom = this._map.getZoom();
  }
});

/*
 * @class Canvas
 * @inherits Renderer
 * @aka L.Canvas
 *
 * Allows vector layers to be displayed with [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
 * Inherits `Renderer`.
 *
 * Due to [technical limitations](http://caniuse.com/#search=canvas), Canvas is not
 * available in all web browsers, notably IE8, and overlapping geometries might
 * not display properly in some edge cases.
 *
 * @example
 *
 * Use Canvas by default for all paths in the map:
 *
 * ```js
 * var map = L.map('map', {
 * 	renderer: L.canvas()
 * });
 * ```
 *
 * Use a Canvas renderer with extra padding for specific vector geometries:
 *
 * ```js
 * var map = L.map('map');
 * var myRenderer = L.canvas({ padding: 0.5 });
 * var line = L.polyline( coordinates, { renderer: myRenderer } );
 * var circle = L.circle( center, { renderer: myRenderer } );
 * ```
 */

var Canvas = Renderer.extend({
  getEvents: function() {
    var events = Renderer.prototype.getEvents.call(this);
    events.viewprereset = this._onViewPreReset;
    return events;
  },

  _onViewPreReset: function() {
    // Set a flag so that a viewprereset+moveend+viewreset only updates&redraws once
    this._postponeUpdatePaths = true;
  },

  onAdd: function() {
    Renderer.prototype.onAdd.call(this);

    // Redraw vectors since canvas is cleared upon removal,
    // in case of removing the renderer itself from the map.
    this._draw();
  },

  _initContainer: function() {
    var container = (this._container = document.createElement("canvas"));

    on(container, "mousemove", throttle(this._onMouseMove, 32, this), this);
    on(
      container,
      "click dblclick mousedown mouseup contextmenu",
      this._onClick,
      this
    );
    on(container, "mouseout", this._handleMouseOut, this);

    this._ctx = container.getContext("2d");
  },

  _destroyContainer: function() {
    cancelAnimFrame(this._redrawRequest);
    delete this._ctx;
    remove(this._container);
    off(this._container);
    delete this._container;
  },

  _updatePaths: function() {
    if (this._postponeUpdatePaths) {
      return;
    }

    var layer;
    this._redrawBounds = null;
    for (var id in this._layers) {
      layer = this._layers[id];
      layer._update();
    }
    this._redraw();
  },

  _update: function() {
    if (this._map._animatingZoom && this._bounds) {
      return;
    }

    Renderer.prototype._update.call(this);

    var b = this._bounds,
      container = this._container,
      size = b.getSize(),
      m = retina ? 2 : 1;

    setPosition(container, b.min);

    // set canvas size (also clearing it); use double size on retina
    container.width = m * size.x;
    container.height = m * size.y;
    container.style.width = size.x + "px";
    container.style.height = size.y + "px";

    if (retina) {
      this._ctx.scale(2, 2);
    }

    // translate so we use the same path coordinates after canvas element moves
    this._ctx.translate(-b.min.x, -b.min.y);

    // Tell paths to redraw themselves
    this.fire("update");
  },

  _reset: function() {
    Renderer.prototype._reset.call(this);

    if (this._postponeUpdatePaths) {
      this._postponeUpdatePaths = false;
      this._updatePaths();
    }
  },

  _initPath: function(layer) {
    this._updateDashArray(layer);
    this._layers[stamp(layer)] = layer;

    var order = (layer._order = {
      layer: layer,
      prev: this._drawLast,
      next: null
    });
    if (this._drawLast) {
      this._drawLast.next = order;
    }
    this._drawLast = order;
    this._drawFirst = this._drawFirst || this._drawLast;
  },

  _addPath: function(layer) {
    this._requestRedraw(layer);
  },

  _removePath: function(layer) {
    var order = layer._order;
    var next = order.next;
    var prev = order.prev;

    if (next) {
      next.prev = prev;
    } else {
      this._drawLast = prev;
    }
    if (prev) {
      prev.next = next;
    } else {
      this._drawFirst = next;
    }

    delete layer._order;

    delete this._layers[stamp(layer)];

    this._requestRedraw(layer);
  },

  _updatePath: function(layer) {
    // Redraw the union of the layer's old pixel
    // bounds and the new pixel bounds.
    this._extendRedrawBounds(layer);
    layer._project();
    layer._update();
    // The redraw will extend the redraw bounds
    // with the new pixel bounds.
    this._requestRedraw(layer);
  },

  _updateStyle: function(layer) {
    this._updateDashArray(layer);
    this._requestRedraw(layer);
  },

  _updateDashArray: function(layer) {
    if (typeof layer.options.dashArray === "string") {
      var parts = layer.options.dashArray.split(/[, ]+/),
        dashArray = [],
        dashValue,
        i;
      for (i = 0; i < parts.length; i++) {
        dashValue = Number(parts[i]);
        // Ignore dash array containing invalid lengths
        if (isNaN(dashValue)) {
          return;
        }
        dashArray.push(dashValue);
      }
      layer.options._dashArray = dashArray;
    } else {
      layer.options._dashArray = layer.options.dashArray;
    }
  },

  _requestRedraw: function(layer) {
    if (!this._map) {
      return;
    }

    this._extendRedrawBounds(layer);
    this._redrawRequest =
      this._redrawRequest || requestAnimFrame(this._redraw, this);
  },

  _extendRedrawBounds: function(layer) {
    if (layer._pxBounds) {
      var padding = (layer.options.weight || 0) + 1;
      this._redrawBounds = this._redrawBounds || new Bounds();
      this._redrawBounds.extend(
        layer._pxBounds.min.subtract([padding, padding])
      );
      this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
    }
  },

  _redraw: function() {
    this._redrawRequest = null;

    if (this._redrawBounds) {
      this._redrawBounds.min._floor();
      this._redrawBounds.max._ceil();
    }

    this._clear(); // clear layers in redraw bounds
    this._draw(); // draw layers

    this._redrawBounds = null;
  },

  _clear: function() {
    var bounds = this._redrawBounds;
    if (bounds) {
      var size = bounds.getSize();
      this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y);
    } else {
      this._ctx.clearRect(0, 0, this._container.width, this._container.height);
    }
  },

  _draw: function() {
    var layer,
      bounds = this._redrawBounds;
    this._ctx.save();
    if (bounds) {
      var size = bounds.getSize();
      this._ctx.beginPath();
      this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
      this._ctx.clip();
    }

    this._drawing = true;

    for (var order = this._drawFirst; order; order = order.next) {
      layer = order.layer;
      if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
        layer._updatePath();
      }
    }

    this._drawing = false;

    this._ctx.restore(); // Restore state before clipping.
  },

  _updatePoly: function(layer, closed) {
    if (!this._drawing) {
      return;
    }

    var i,
      j,
      len2,
      p,
      parts = layer._parts,
      len = parts.length,
      ctx = this._ctx;

    if (!len) {
      return;
    }

    ctx.beginPath();

    for (i = 0; i < len; i++) {
      for (j = 0, len2 = parts[i].length; j < len2; j++) {
        p = parts[i][j];
        ctx[j ? "lineTo" : "moveTo"](p.x, p.y);
      }
      if (closed) {
        ctx.closePath();
      }
    }

    this._fillStroke(ctx, layer);

    // TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
  },

  _updateCircle: function(layer) {
    if (!this._drawing || layer._empty()) {
      return;
    }

    var p = layer._point,
      ctx = this._ctx,
      r = Math.max(Math.round(layer._radius), 1),
      s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

    if (s !== 1) {
      ctx.save();
      ctx.scale(1, s);
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

    if (s !== 1) {
      ctx.restore();
    }

    this._fillStroke(ctx, layer);
  },

  _fillStroke: function(ctx, layer) {
    var options = layer.options;

    if (options.fill) {
      ctx.globalAlpha = options.fillOpacity;
      ctx.fillStyle = options.fillColor || options.color;
      ctx.fill(options.fillRule || "evenodd");
    }

    if (options.stroke && options.weight !== 0) {
      if (ctx.setLineDash) {
        ctx.setLineDash((layer.options && layer.options._dashArray) || []);
      }
      ctx.globalAlpha = options.opacity;
      ctx.lineWidth = options.weight;
      ctx.strokeStyle = options.color;
      ctx.lineCap = options.lineCap;
      ctx.lineJoin = options.lineJoin;
      ctx.stroke();
    }
  },

  // Canvas obviously doesn't have mouse events for individual drawn objects,
  // so we emulate that by calculating what's under the mouse on mousemove/click manually

  _onClick: function(e) {
    var point = this._map.mouseEventToLayerPoint(e),
      layer,
      clickedLayer;

    for (var order = this._drawFirst; order; order = order.next) {
      layer = order.layer;
      if (
        layer.options.interactive &&
        layer._containsPoint(point) &&
        !this._map._draggableMoved(layer)
      ) {
        clickedLayer = layer;
      }
    }
    if (clickedLayer) {
      fakeStop(e);
      this._fireEvent([clickedLayer], e);
    }
  },

  _onMouseMove: function(e) {
    if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) {
      return;
    }

    var point = this._map.mouseEventToLayerPoint(e);
    this._handleMouseHover(e, point);
  },

  _handleMouseOut: function(e) {
    var layer = this._hoveredLayer;
    if (layer) {
      // if we're leaving the layer, fire mouseout
      removeClass(this._container, "leaflet-interactive");
      this._fireEvent([layer], e, "mouseout");
      this._hoveredLayer = null;
    }
  },

  _handleMouseHover: function(e, point) {
    var layer, candidateHoveredLayer;

    for (var order = this._drawFirst; order; order = order.next) {
      layer = order.layer;
      if (layer.options.interactive && layer._containsPoint(point)) {
        candidateHoveredLayer = layer;
      }
    }

    if (candidateHoveredLayer !== this._hoveredLayer) {
      this._handleMouseOut(e);

      if (candidateHoveredLayer) {
        addClass(this._container, "leaflet-interactive"); // change cursor
        this._fireEvent([candidateHoveredLayer], e, "mouseover");
        this._hoveredLayer = candidateHoveredLayer;
      }
    }

    if (this._hoveredLayer) {
      this._fireEvent([this._hoveredLayer], e);
    }
  },

  _fireEvent: function(layers, e, type) {
    this._map._fireDOMEvent(e, type || e.type, layers);
  },

  _bringToFront: function(layer) {
    var order = layer._order;

    if (!order) {
      return;
    }

    var next = order.next;
    var prev = order.prev;

    if (next) {
      next.prev = prev;
    } else {
      // Already last
      return;
    }
    if (prev) {
      prev.next = next;
    } else if (next) {
      // Update first entry unless this is the
      // single entry
      this._drawFirst = next;
    }

    order.prev = this._drawLast;
    this._drawLast.next = order;

    order.next = null;
    this._drawLast = order;

    this._requestRedraw(layer);
  },

  _bringToBack: function(layer) {
    var order = layer._order;

    if (!order) {
      return;
    }

    var next = order.next;
    var prev = order.prev;

    if (prev) {
      prev.next = next;
    } else {
      // Already first
      return;
    }
    if (next) {
      next.prev = prev;
    } else if (prev) {
      // Update last entry unless this is the
      // single entry
      this._drawLast = prev;
    }

    order.prev = null;

    order.next = this._drawFirst;
    this._drawFirst.prev = order;
    this._drawFirst = order;

    this._requestRedraw(layer);
  }
});

// @factory L.canvas(options?: Renderer options)
// Creates a Canvas renderer with the given options.
function canvas$1(options) {
  return canvas ? new Canvas(options) : null;
}
