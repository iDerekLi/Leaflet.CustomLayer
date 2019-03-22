/*!
 * Leaflet.CustomLayer.js v1.0.0
 * 
 * Copyright (c) 2019-present Derek Li
 * Released under the MIT License - https://choosealicense.com/licenses/mit/
 * 
 * https://github.com/iDerekLi/Leaflet.CustomLayer
 */
!function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ? t(exports, require("leaflet")) : "function" == typeof define && define.amd ? define([ "exports", "leaflet" ], t) : t(((e = e || self).Leaflet = e.Leaflet || {}, 
    e.Leaflet.CustomLayer = {}), e.L);
}(this, function(e, t) {
    "use strict";
    function _classCallCheck(e, t) {
        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }
    function _defineProperties(e, t) {
        for (var o = 0; o < t.length; o++) {
            var i = t[o];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), 
            Object.defineProperty(e, i.key, i);
        }
    }
    function _createClass(e, t, o) {
        return t && _defineProperties(e.prototype, t), o && _defineProperties(e, o), e;
    }
    function _defineProperty(e, t, o) {
        return t in e ? Object.defineProperty(e, t, {
            value: o,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = o, e;
    }
    function _objectSpread(e) {
        for (var t = 1; t < arguments.length; t++) {
            var o = null != arguments[t] ? arguments[t] : {}, i = Object.keys(o);
            "function" == typeof Object.getOwnPropertySymbols && (i = i.concat(Object.getOwnPropertySymbols(o).filter(function(e) {
                return Object.getOwnPropertyDescriptor(o, e).enumerable;
            }))), i.forEach(function(t) {
                _defineProperty(e, t, o[t]);
            });
        }
        return e;
    }
    function _inherits(e, t) {
        if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
        e.prototype = Object.create(t && t.prototype, {
            constructor: {
                value: e,
                writable: !0,
                configurable: !0
            }
        }), t && _setPrototypeOf(e, t);
    }
    function _getPrototypeOf(e) {
        return (_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(e) {
            return e.__proto__ || Object.getPrototypeOf(e);
        })(e);
    }
    function _setPrototypeOf(e, t) {
        return (_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(e, t) {
            return e.__proto__ = t, e;
        })(e, t);
    }
    function _assertThisInitialized(e) {
        if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return e;
    }
    function _possibleConstructorReturn(e, t) {
        return !t || "object" != typeof t && "function" != typeof t ? _assertThisInitialized(e) : t;
    }
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
  */    t = t && t.hasOwnProperty("default") ? t["default"] : t;
    var o = 
    /* */
    function(e) {
        function CustomLayer(e) {
            var o;
            _classCallCheck(this, CustomLayer), o = _possibleConstructorReturn(this, _getPrototypeOf(CustomLayer).call(this, e));
            var i = _objectSpread({
                el: null,
                // The DomElement object to display
                zooms: [ 0, 18 ],
                // Set the visibility level, [min, max]
                opacity: 1,
                // The opacity of the layer, [0,1]
                visible: !0,
                // Is the layer visible
                zIndex: 120,
                // The zIndex of the layer
                alwaysRender: !0,
                // Whether to redraw during zoom panning, complex drawing suggestions are set to false
                layerWillMount: null,
                // Lifecycle - before adding a layer
                layerDidMount: null,
                // Lifecycle - after the layer is added
                layerRender: null,
                // Lifecycle - render
                layerWillUnmount: null,
                // Lifecycle - before layer removal
                layerDidUnmount: null
            }, e), n = {
                el: i.el,
                opacity: i.opacity,
                visible: i.visible,
                zIndex: i.zIndex,
                zooms: i.zooms,
                alwaysRender: i.alwaysRender
            };
            return t.setOptions(_assertThisInitialized(o), n), "function" == typeof i.layerWillMount && (o.layerWillMount = i.layerWillMount), 
            "function" == typeof i.layerDidMount && (o.layerDidMount = i.layerDidMount), "function" == typeof i.layerRender && (o.layerRender = i.layerRender), 
            "function" == typeof i.layerWillUnmount && (o.layerWillUnmount = i.layerWillUnmount), 
            "function" == typeof i.layerDidUnmount && (o.layerDidUnmount = i.layerDidUnmount), 
            o;
        }
 // Built-in life cycle
                return _inherits(CustomLayer, t.Layer ? t.Layer : t.Class), _createClass(CustomLayer, [ {
            key: "beforeAdd",
            value: function beforeAdd(e) {
                this._map = e, // register Events
                this._registerEvents = !1, this._eventType = "", this._zoomVisible = !0, // --If the Element instance already exists, simulate a position offset event。
                // (the map position changes when the layer is removed from the map, and if the layer is added to the map at a time, it will deviate)
                this.getElement() && this._animateZoom({
                    center: this._map.getCenter(),
                    zoom: this._map.getZoom(),
                    noUpdate: undefined,
                    type: "zoomanim",
                    target: this._map,
                    sourceTarget: this._map
                }), this.layerWillMount && this.layerWillMount.bind(this)();
            }
        }, {
            key: "getEvents",
            value: function getEvents() {
                this._registerEvents = !0;
                // Layer trigger priority
                // move: movestart -> move -> moveend
                // zoom: zoomstart -> movestart -> zoomanim -> zoom -> move -> zoomend -> moveend
                // resize: move -> resize -> moveend
                var e = {
                    resize: this._onLayerResize,
                    movestart: this._onLayerMovestart,
                    move: this._onLayerMove,
                    moveend: this._onLayerMoveend,
                    zoomstart: this._onLayerZoomstart,
                    zoom: this._onLayerZoom,
                    zoomend: this._onLayerZoomend
                };
                return this._map.options.zoomAnimation && t.Browser.any3d && (e.zoomanim = this._onLayerZoomanim), 
                e;
            }
        }, {
            key: "onAdd",
            value: function onAdd(e) {
                this._map = e;
                var t = this.getElement();
                this._addElement(t), this.layerDidMount && this.layerDidMount.bind(this)(), this.options.visible || this.hide(), 
                this._needRedraw();
            }
        }, {
            key: "onRemove",
            value: function onRemove(e) {
                this.layerWillUnmount && this.layerWillUnmount.bind(this)(), this._removeElement(this.getElement()), 
                this._registerEvents && (this._registerEvents = !1, this._map.off(this.getEvents(), this)), 
                this._map.off({
                    zoom: this._onZoomVisible
                }, this), this.layerDidUnmount && this.layerDidUnmount.bind(this)();
            }
        }, {
            key: "_render",
            value: function _render() {
                this.layerRender && this.layerRender.bind(this)(), this._frame = null;
            }
 // Built-in Event
                }, {
            key: "_onLayerResize",
            value: function _onLayerResize(e) {
                "" === this._eventType && (this._eventType = "resize", "resize" === this._eventType && (// resize
                this._setElementSize(e.newSize), this._setElementPosition(), this._render(), this._eventType = ""));
            }
        }, {
            key: "_onLayerMovestart",
            value: function _onLayerMovestart(e) {
                "" === this._eventType && (this._eventType = "move", this._eventType);
            }
        }, {
            key: "_onLayerMove",
            value: function _onLayerMove(e) {
                "move" === this._eventType && this.options.alwaysRender && (// move
                this._setElementPosition(), this._render());
            }
        }, {
            key: "_onLayerMoveend",
            value: function _onLayerMoveend(e) {
                "move" === this._eventType && (// moveend
                this._setElementPosition(), this._render(), this._eventType = "");
            }
        }, {
            key: "_onLayerZoomstart",
            value: function _onLayerZoomstart(e) {
                "" === this._eventType && (this._eventType = "zoom", this._eventType);
            }
        }, {
            key: "_onLayerZoomanim",
            value: function _onLayerZoomanim(e) {
                "zoom" === this._eventType && // zoomanim
                this._animateZoom(e);
            }
        }, {
            key: "_onLayerZoom",
            value: function _onLayerZoom(e) {
                if ("zoom" === this._eventType && this.options.alwaysRender) {
                    // zoom
                    if (!this._isZoomVisible()) return this._zoomHide(), void (this._eventType = "");
                    this._setElementPosition(), this._render();
                }
            }
        }, {
            key: "_onLayerZoomend",
            value: function _onLayerZoomend(e) {
                if ("zoom" === this._eventType) {
                    // zoomend
                    if (!this._isZoomVisible()) return this._zoomHide(), void (this._eventType = "");
                    this._setElementPosition(), this._render(), this._eventType = "";
                }
            }
        }, {
            key: "_onZoomVisible",
            value: function _onZoomVisible() {
                this._isZoomVisible() ? this._zoomShow() : this._zoomHide();
            }
 // Built-in Methods
                }, {
            key: "_needRedraw",
            value: function _needRedraw() {
                return this._frame || (this._frame = t.Util.requestAnimFrame(this._render, this)), 
                this;
            }
        }, {
            key: "_addElement",
            value: function _addElement(e) {
                console.log(e);
                var o = this._map.getSize();
                this._setElementSize(o), this.setOpacity(this.options.opacity), this.setZIndex(this.options.zIndex);
                var i = this._map.options.zoomAnimation && t.Browser.any3d;
                t.DomUtil.addClass(e, "leaflet-layer"), t.DomUtil.addClass(e, "leaflet-zoom-".concat(i ? "animated" : "hide")), 
                this._registerEvents || this._map.on(this.getEvents(), this), this.options.visible ? this._map.getPanes().overlayPane.appendChild(e) : this._map.off(this.getEvents(), this);
            }
        }, {
            key: "_removeElement",
            value: function _removeElement(e) {
                this._frame && (t.Util.cancelAnimFrame(this._frame), this._frame = null);
                try {
                    this._map.getPanes().overlayPane.removeChild(e);
                } catch (o) {}
            }
        }, {
            key: "_setElementSize",
            value: function _setElementSize(e) {
                var t = this.getElement();
                t.setAttribute("width", e.x), t.setAttribute("height", e.y), t.style.width = e.x + "px", 
                t.style.height = e.y + "px";
            }
        }, {
            key: "_setElementPosition",
            value: function _setElementPosition() {
                var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [ 0, 0 ], o = this._map.containerPointToLayerPoint(e);
                t.DomUtil.setPosition(this.getElement(), o);
            }
 // L.DomUtil.setTransform stand-in
                }, {
            key: "_setTransform",
            value: function _setTransform(e, o, i) {
                var n = o || new t.Point(0, 0);
                e.style[t.DomUtil.TRANSFORM] = (t.Browser.ie3d ? "translate(".concat(n.x, "px, ").concat(n.y, "px)") : "translate3d(".concat(n.x, "px, ").concat(n.y, "px, 0)")) + (i ? " scale(".concat(i, ")") : "");
            }
        }, {
            key: "_animateZoom",
            value: function _animateZoom(e) {
                var o = this._map.getZoomScale(e.zoom), i = t.Layer ? this._map._latLngBoundsToNewLayerBounds(this._map.getBounds(), e.zoom, e.center).min : this._map._getCenterOffset(e.center)._multiplyBy(-o).subtract(this._map._getMapPanePos());
 // -- different calc of animation zoom  in leaflet 1.0.3 thanks @peterkarabinovic, @jduggan1
                                (t.DomUtil.setTransform || this._setTransform)(this.getElement(), i, o);
            }
        }, {
            key: "_isZoomVisible",
            value: function _isZoomVisible() {
                var e = this.options.zooms[0], t = this.options.zooms[1], o = this._map.getZoom();
                return o >= e && o <= t;
            }
        }, {
            key: "_zoomShow",
            value: function _zoomShow() {
                this._zoomVisible || (this._zoomVisible = !0, this._map.off({
                    zoom: this._onZoomVisible
                }, this), this.options.visible && (this._map.on(this.getEvents(), this), this._map.getPanes().overlayPane.appendChild(this.getElement()), 
                this._setElementPosition(), this._render()));
            }
        }, {
            key: "_zoomHide",
            value: function _zoomHide() {
                if (this._zoomVisible) {
                    this._zoomVisible = !1, this._map.off(this.getEvents(), this), this._map.on({
                        zoom: this._onZoomVisible
                    }, this);
                    try {
                        this._map.getPanes().overlayPane.removeChild(this.getElement());
                    } catch (e) {}
                }
            }
 // API
                }, {
            key: "addTo",
            value: function addTo(e) {
                return e.addLayer(this), this;
            }
        }, {
            key: "getElement",
            value: function getElement() {
                return this.options.el;
            }
        }, {
            key: "setElement",
            value: function setElement(e) {
                var t = this.getElement();
                return this.options.el = e, this._removeElement(t), this._addElement(e), this._setElementPosition(), 
                this._render(), e;
            }
        }, {
            key: "getOpacity",
            value: function getOpacity() {
                return this.options.opacity;
            }
        }, {
            key: "setOpacity",
            value: function setOpacity(e) {
                return this.getElement().style.opacity = this.options.opacity = e, e;
            }
        }, {
            key: "getZIndex",
            value: function getZIndex() {
                return this.options.zIndex;
            }
        }, {
            key: "setZIndex",
            value: function setZIndex(e) {
                return this.getElement().style.zIndex = this.options.zIndex = e, e;
            }
        }, {
            key: "show",
            value: function show() {
                this.options.visible || (this.options.visible = !0, this._map.on({
                    zoom: this._onZoomVisible
                }, this), this._onZoomVisible());
            }
        }, {
            key: "hide",
            value: function hide() {
                if (this.options.visible) {
                    this.options.visible = !1, this._map.off(this.getEvents(), this), this._map.off({
                        zoom: this._onZoomVisible
                    }, this);
                    try {
                        this._map.getPanes().overlayPane.removeChild(this.getElement());
                    } catch (e) {}
                }
            }
        } ]), CustomLayer;
    }();
    function customLayer(e) {
        return new o(e);
    }
    /**
   * Plugin Props
   */    t.CustomLayer = o, t.customLayer = customLayer, e.CustomLayer = o, e.customLayer = customLayer, 
    e["default"] = customLayer, Object.defineProperty(e, "__esModule", {
        value: !0
    });
});
//# sourceMappingURL=Leaflet.CustomLayer.js.map
