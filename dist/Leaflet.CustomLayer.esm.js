/*!
 * Leaflet.CustomLayer.js v1.0.0
 * 
 * Copyright (c) 2019-present Derek Li
 * Released under the MIT License - https://choosealicense.com/licenses/mit/
 * 
 * https://github.com/iDerekLi/Leaflet.CustomLayer
 */
import e from "leaflet";

function _classCallCheck(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}

function _defineProperties(e, t) {
    for (var i = 0; i < t.length; i++) {
        var o = t[i];
        o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), 
        Object.defineProperty(e, o.key, o);
    }
}

function _createClass(e, t, i) {
    return t && _defineProperties(e.prototype, t), i && _defineProperties(e, i), e;
}

function _defineProperty(e, t, i) {
    return t in e ? Object.defineProperty(e, t, {
        value: i,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = i, e;
}

function _objectSpread(e) {
    for (var t = 1; t < arguments.length; t++) {
        var i = null != arguments[t] ? arguments[t] : {}, o = Object.keys(i);
        "function" == typeof Object.getOwnPropertySymbols && (o = o.concat(Object.getOwnPropertySymbols(i).filter(function(e) {
            return Object.getOwnPropertyDescriptor(i, e).enumerable;
        }))), o.forEach(function(t) {
            _defineProperty(e, t, i[t]);
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
*/ var t = 
/* */
function(t) {
    function CustomLayer(t) {
        var i;
        _classCallCheck(this, CustomLayer), i = _possibleConstructorReturn(this, _getPrototypeOf(CustomLayer).call(this, t));
        var o = _objectSpread({
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
        }, t), n = {
            el: o.el,
            opacity: o.opacity,
            visible: o.visible,
            zIndex: o.zIndex,
            zooms: o.zooms,
            alwaysRender: o.alwaysRender
        };
        return e.setOptions(_assertThisInitialized(i), n), "function" == typeof o.layerWillMount && (i.layerWillMount = o.layerWillMount), 
        "function" == typeof o.layerDidMount && (i.layerDidMount = o.layerDidMount), "function" == typeof o.layerRender && (i.layerRender = o.layerRender), 
        "function" == typeof o.layerWillUnmount && (i.layerWillUnmount = o.layerWillUnmount), 
        "function" == typeof o.layerDidUnmount && (i.layerDidUnmount = o.layerDidUnmount), 
        i;
    }
 // Built-in life cycle
        return _inherits(CustomLayer, e.Layer ? e.Layer : e.Class), _createClass(CustomLayer, [ {
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
            var t = {
                resize: this._onLayerResize,
                movestart: this._onLayerMovestart,
                move: this._onLayerMove,
                moveend: this._onLayerMoveend,
                zoomstart: this._onLayerZoomstart,
                zoom: this._onLayerZoom,
                zoomend: this._onLayerZoomend
            };
            return this._map.options.zoomAnimation && e.Browser.any3d && (t.zoomanim = this._onLayerZoomanim), 
            t;
        }
    }, {
        key: "onAdd",
        value: function onAdd(t) {
            this._map = t;
            var i = this.getElement(), o = this._map.getSize();
            this._setElementSize(o), this.setOpacity(this.options.opacity), this.setZIndex(this.options.zIndex);
            var n = this._map.options.zoomAnimation && e.Browser.any3d;
            if (e.DomUtil.addClass(i, "leaflet-layer"), e.DomUtil.addClass(i, "leaflet-zoom-".concat(n ? "animated" : "hide")), 
            this._registerEvents || this._map.on(this.getEvents(), this), !this.options.visible) return console.log(this.options.visible), 
            void this._map.off(this.getEvents(), this);
            this._map.getPanes().overlayPane.appendChild(i), this.layerDidMount && this.layerDidMount.bind(this)(), 
            this.options.visible || this.hide(), this._needRedraw();
        }
    }, {
        key: "onRemove",
        value: function onRemove(t) {
            this.layerWillUnmount && this.layerWillUnmount.bind(this)(), this._frame && (e.Util.cancelAnimFrame(this._frame), 
            this._frame = null);
            try {
                this._map.getPanes().overlayPane.removeChild(this.getElement());
            } catch (i) {}
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
            return this._frame || (this._frame = e.Util.requestAnimFrame(this._render, this)), 
            this;
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
            var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [ 0, 0 ], i = this._map.containerPointToLayerPoint(t);
            e.DomUtil.setPosition(this.getElement(), i);
        }
 // L.DomUtil.setTransform stand-in
        }, {
        key: "_setTransform",
        value: function _setTransform(t, i, o) {
            var n = i || new e.Point(0, 0);
            t.style[e.DomUtil.TRANSFORM] = (e.Browser.ie3d ? "translate(".concat(n.x, "px, ").concat(n.y, "px)") : "translate3d(".concat(n.x, "px, ").concat(n.y, "px, 0)")) + (o ? " scale(".concat(o, ")") : "");
        }
    }, {
        key: "_animateZoom",
        value: function _animateZoom(t) {
            var i = this._map.getZoomScale(t.zoom), o = e.Layer ? this._map._latLngBoundsToNewLayerBounds(this._map.getBounds(), t.zoom, t.center).min : this._map._getCenterOffset(t.center)._multiplyBy(-i).subtract(this._map._getMapPanePos());
 // -- different calc of animation zoom  in leaflet 1.0.3 thanks @peterkarabinovic, @jduggan1
                        (e.DomUtil.setTransform || this._setTransform)(this.getElement(), o, i);
        }
    }, {
        key: "_isZoomVisible",
        value: function _isZoomVisible() {
            var e = this.options.zooms[0], t = this.options.zooms[1], i = this._map.getZoom();
            return i >= e && i <= t;
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
            this.options.el = e;
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
    return new t(e);
}

/**
 * Plugin Props
 */ e.CustomLayer = t, e.customLayer = customLayer;

export default customLayer;

export { t as CustomLayer, customLayer };
//# sourceMappingURL=Leaflet.CustomLayer.esm.js.map
