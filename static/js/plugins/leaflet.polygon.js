import "../leaflet.js";
import "./leaflet.displays.js";

export default (function (factory) {
    var L;
    if (typeof define === "function" && define.amd) {
        define(["leaflet"], factory);
    } else if (typeof module !== "undefined") {
        L = require("leaflet");
        module.exports = factory(L);
    } else {
        if (typeof window.L === "undefined") {
            throw new Error("Leaflet must be loaded first");
        }
        factory(window.L);
    }
})(function (L) {
    let VertexIcon = L.DivIcon.extend({
        options: {
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-vertex-icon',
        },
    });

    let Vertex = L.Marker.extend({
        initialize: function (latlng, options) {
            L.Util.setOptions(this, options);
            this._latlng = L.latLng(latlng);
            this.options.draggable = true;
            this.on('drag', this._onDrag, this);
            this.on('dragend', this._onDragEnd, this);
        },

        _onDrag: function (e) {
            this.fire('vertex:drag', { latlng: this.getLatLng() });
        },

        _onDragEnd: function (e) {
            const latlng = this.getLatLng();
            const snappedLatLng = L.latLng(
                Math.round(latlng.lat),
                Math.round(latlng.lng)
            );
            this.setLatLng(snappedLatLng);

            this.fire('vertex:dragend', { latlng: snappedLatLng });
        },
    });

    L.DraggablePolygon = L.Polygon.extend({
        initialize: function (latlngs, options) {
            L.Util.setOptions(this, options);
            L.Polygon.prototype.initialize.call(this, latlngs, options);

            this._initVertices();
        },

        _initVertices: function () {
            this._markers = [];

            const latlngs = this.getLatLngs()[0];
            latlngs.forEach((latlng, index) => {
                const marker = this._createVertex(latlng, index);
                this._markers.push(marker);
            });
        },

        _createVertex: function (latlng, index) {
            const marker = new Vertex(latlng, {
                icon: new VertexIcon(),
                owner: this,
                index: index,
            });

            marker.on('vertex:drag', this._onVertexDrag, this);
            marker.on('vertex:dragend', this._onVertexDragEnd, this);
            marker.on('click', this._onVertexClick, this);

            return marker;
        },

        onAdd: function (map) {
            this._map = map;
            L.Polygon.prototype.onAdd.call(this, map);

            this._markers.forEach((marker) => {
                marker.addTo(map);
            });

            this.on('click', this._onPolygonClick, this);
        },

        onRemove: function (map) {
            this._markers.forEach((marker) => {
                marker.removeFrom(map);
            });
            L.Polygon.prototype.onRemove.call(this, map);
        },

        _onVertexDrag: function (e) {
            const marker = e.target;
            const index = marker.options.index;
            const latlng = e.latlng;

            const latlngs = this.getLatLngs()[0];
            latlngs[index] = latlng;
            this.setLatLngs([latlngs]);

            this._updateMarkerIndexes();

            if (this.options.owner && this.options.owner.update) {
                this.options.owner.update();
            }
        },

        _onVertexDragEnd: function (e) {
            const marker = e.target;
            const latlng = marker.getLatLng();

            const snappedLatLng = L.latLng(
                Math.round(latlng.lat),
                Math.round(latlng.lng)
            );
            marker.setLatLng(snappedLatLng);

            const index = marker.options.index;
            const latlngs = this.getLatLngs()[0];
            latlngs[index] = snappedLatLng;
            this.setLatLngs([latlngs]);

            if (this.options.owner && this.options.owner.update) {
                this.options.owner.update();
            }
        },

        _onVertexClick: function (e) {
            if (this._markers.length > 3) {
                const marker = e.target;
                const index = marker.options.index;

                this._map.removeLayer(marker);
                this._markers.splice(index, 1);

                const latlngs = this.getLatLngs()[0];
                latlngs.splice(index, 1);
                this.setLatLngs([latlngs]);

                this._updateMarkerIndexes();

                if (this.options.owner && this.options.owner.update) {
                    this.options.owner.update();
                }
            } else {
                alert('A polygon must have at least 3 vertices.');
            }
        },

        _onPolygonClick: function (e) {
            const latlng = e.latlng;

            const snappedLatLng = L.latLng(
                Math.round(latlng.lat),
                Math.round(latlng.lng)
            );

            const latlngs = this.getLatLngs()[0];
            let minDistance = Infinity;
            let indexToInsert = 0;

            for (let i = 0; i < latlngs.length; i++) {
                const p1 = this._map.latLngToLayerPoint(latlngs[i]);
                const p2 = this._map.latLngToLayerPoint(latlngs[(i + 1) % latlngs.length]);
                const distance = L.LineUtil.pointToSegmentDistance(
                    this._map.latLngToLayerPoint(snappedLatLng),
                    p1,
                    p2
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    indexToInsert = i + 1;
                }
            }

            latlngs.splice(indexToInsert, 0, snappedLatLng);
            this.setLatLngs([latlngs]);

            const marker = this._createVertex(snappedLatLng, indexToInsert);
            marker.addTo(this._map);
            this._markers.splice(indexToInsert, 0, marker);

            this._updateMarkerIndexes();

            if (this.options.owner && this.options.owner.update) {
                this.options.owner.update();
            }
        },

        _updateMarkerIndexes: function () {
            this._markers.forEach((marker, index) => {
                marker.options.index = index;
            });
        },
    });

    L.draggablePolygon = function (latlngs, options) {
        return new L.DraggablePolygon(latlngs, options);
    };

    L.Control.Display.Polygon = L.Control.Display.extend({
        onAdd: function (map) {
            this._map = map; 
    
            return L.Control.Display.prototype.onAdd.call(this, map);
        },
    
        options: {
            position: 'bottomleft',
            title: 'Polygon',
            icon: 'images/pentagon.png', 
        },
    
        createInterface: function () {
            const container = L.DomUtil.create('div', 'leaflet-control-display-expanded');
            const polygonForm = L.DomUtil.create('form', 'leaflet-control-display-form', container);
    
            const verticesLabel = L.DomUtil.create('label', 'leaflet-control-display-label', polygonForm);
            verticesLabel.innerHTML = 'Vertices';
            this.verticesList = L.DomUtil.create("input", "leaflet-control-map-input", polygonForm)
    
            return container;
        },

        update: function () {
            const planeXOffSet = this._map.getPlane() * 13056;
            const latlngs = this.polygon.getLatLngs()[0];
            const vertices = latlngs.map(latlng => [
                (Math.floor(latlng.lng) * 4 - 4096 + (13056 * this._map.getPlane())),
                60 - (Math.floor(latlng.lat) * 4 - 50370)
            ]);
            const verticesString = JSON.stringify(vertices);
            this.verticesList.value = verticesString;
        },
    
        expand: function () {
            const mapSize = this._map.getSize();
            const centerPoint = mapSize.divideBy(2);
            const center = this._map.containerPointToLatLng(centerPoint);
    
            const offset = 32;
            const latlngs = [
                [center.lat - offset, center.lng - offset],
                [center.lat - offset, center.lng + offset],
                [center.lat + offset, center.lng],
            ];
    
            if (this.polygon) {
                this.polygon.remove();
            }
    
            this.polygon = L.draggablePolygon(latlngs, {
                owner: this,
            });
    
            this.polygon.addTo(this._map);
            this.polygon.on('edit', this.update, this);
            this.polygon.on('click', this.update, this);
    
            this.update();
    
            return L.Control.Display.prototype.expand.call(this);
        },
    
        collapse: function () {
            if (this.polygon) {
                this.polygon.remove();
                this.polygon.off('edit', this.update, this);
                this.polygon.off('click', this.update, this);
            }
            return L.Control.Display.prototype.collapse.call(this);
        },
    });
    
    L.control.display.polygon = function (options) {
        return new L.Control.Display.Polygon(options);
    };

    L.Map.addInitHook(function () {
        if (this.options.polygon) {
            this.polygonControl = L.control.display.polygon();
            this.addControl(this.polygonControl);

            this.polygonControl.verticesList.addEventListener("click", () => {
				this.polygonControl.verticesList.select()
				navigator.clipboard.writeText(this.polygonControl.verticesList.value).then(
					() => this.addMessage(`Copied to clipboard: ${this.polygonControl.verticesList.value}`),
					() => console.error("Cannot copy text to clipboard")
				)
			})
        }
    });
    
});
