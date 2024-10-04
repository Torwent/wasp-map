import "../leaflet.js"
import "./leaflet.displays.js"

export default void (function (factory) {
	var L
	if (typeof define === "function" && define.amd) {
		define(["leaflet"], factory)
	} else if (typeof module !== "undefined") {
		L = require("leaflet")
		module.exports = factory(L)
	} else {
		if (typeof window.L === "undefined") {
			throw new Error("Leaflet must be loaded first")
		}
		factory(window.L)
	}
})(function (L) {
	let VertexIcon = L.DivIcon.extend({
		options: {
			iconSize: new L.Point(8, 8)
		}
	})

	let Vertex = L.Marker.extend({
		initialize: function (latlng, owner) {
			L.Util.setOptions(this, {
				draggable: true,
				icon: new VertexIcon(),
				owner: owner
			})
			this._latlng = L.latLng(latlng)
			this.trunc()
		},

		onAdd: function (map) {
			this.on("drag", this.onDragEnd.bind(this))
			return L.Marker.prototype.onAdd.call(this, map)
		},

		onDragEnd: function () {
			this.trunc()
			this.options.owner.update(this)
		},

		trunc: function () {
			let latlng = this.getLatLng()
			let newLat = Math.trunc(latlng.lat)
			let newLng = Math.trunc(latlng.lng)
			let newLatLng = L.latLng(newLat, newLng)
			this.setLatLng(newLatLng)
			return this
		}
	})

	L.DraggableSquare = L.Rectangle.extend({
		initialize: function (latLngBounds, options) {
			let bounds = L.latLngBounds(latLngBounds)
			// do not change order, important
			this.vertices = [
				bounds.getSouthWest(),
				bounds.getNorthWest(),
				bounds.getNorthEast(),
				bounds.getSouthEast()
			].map(this.createVertex.bind(this))
			return L.Rectangle.prototype.initialize.call(this, bounds, options)
		},

		onAdd: function (map) {
			this.vertices.forEach((v) => v.trunc().addTo(map))

			L.Rectangle.prototype.onAdd.call(this, map)
			this.options.owner.update(this.getBounds())
		},

		createVertex: function (latlng) {
			return new Vertex(latlng, this)
		},

		update: function (changedVertex) {
			let i = (this.vertices.indexOf(changedVertex) + 2) & 0x3
			let oppositeVertex = this.vertices[i]
			let otherVertices = this.vertices.filter(
				(vertex) => vertex !== oppositeVertex && vertex !== changedVertex
			)

			let corner1 = oppositeVertex.getLatLng()
			let corner2 = changedVertex.getLatLng()
			let newBounds = L.latLngBounds([corner1, corner2])
			this.setRectBounds(newBounds)

			let newLatLng1 = L.latLng(corner1.lat, corner2.lng)
			otherVertices[0].setLatLng(newLatLng1)

			let newLatLng2 = L.latLng(corner2.lat, corner1.lng)
			otherVertices[1].setLatLng(newLatLng2)

			this.options.owner.update(newBounds)
		},

		setRectBounds: function (bounds) {
			return L.Rectangle.prototype.setBounds.call(this, bounds)
		},

		setBounds: function (bounds) {
			let positions = [
				bounds.getSouthWest(),
				bounds.getNorthWest(),
				bounds.getNorthEast(),
				bounds.getSouthEast()
			]
			this.vertices.forEach((v, i) => v.setLatLng(positions[i]).trunc())
			bounds = L.latLngBounds(this.vertices.map((v) => v.getLatLng()))
			this.setRectBounds(bounds)
		},

		remove: function () {
			this.vertices.forEach((v) => v.remove())
			return L.Rectangle.prototype.remove.call(this)
		}
	})

	L.draggableSquare = function (bounds, options) {
		return new L.DraggableSquare(bounds, options)
	}

	L.Control.Display.Rect = L.Control.Display.extend({
		onAdd: function (map) {
			this.rect = L.draggableSquare(
				[
					[3232, 3200],
					[3200, 3232]
				],
				{
					owner: this
				}
			)

			return L.Control.Display.prototype.onAdd.call(this, map)
		},

		options: {
			position: "bottomleft",
			title: "Dimensions:",
			icon: "images/Blue_square_(Prisoner_of_Glouphrie).png"
		},

		createInterface: function () {
			let container = L.DomUtil.create("div", "leaflet-control-display-expanded")
			let rectForm = L.DomUtil.create("form", "leaflet-control-display-form", container)

			let widthLabel = L.DomUtil.create("label", "leaflet-control-display-label", rectForm)
			widthLabel.innerHTML = "Width"
			this.width = L.DomUtil.create("input", "leaflet-control-display-input-number", rectForm)
			this.width.setAttribute("type", "number")
			this.width.setAttribute("name", "width")

			let heightLabel = L.DomUtil.create("label", "leaflet-control-display-label", rectForm)
			heightLabel.innerHTML = "Height"
			this.height = L.DomUtil.create("input", "leaflet-control-display-input-number", rectForm)
			this.height.setAttribute("type", "number")
			this.height.setAttribute("name", "height")

			let areaLabel = L.DomUtil.create("label", "leaflet-control-display-label", rectForm)
			areaLabel.innerHTML = "Area"
			this.area = L.DomUtil.create("input", "leaflet-control-display-input-number", rectForm)
			this.area.setAttribute("type", "number")
			this.area.setAttribute("name", "area")
			this.area.setAttribute("readonly", true)

			let x1Label = L.DomUtil.create("label", "leaflet-control-display-label", rectForm)
			x1Label.innerHTML = "X1"
			this.x1 = L.DomUtil.create("input", "leaflet-control-display-input-number", rectForm)
			this.x1.setAttribute("type", "number")
			this.x1.setAttribute("name", "x1")

			let x2Label = L.DomUtil.create("label", "leaflet-control-display-label", rectForm)
			x2Label.innerHTML = "X2"
			this.x2 = L.DomUtil.create("input", "leaflet-control-display-input-number", rectForm)
			this.x2.setAttribute("type", "number")
			this.x2.setAttribute("name", "x2")

			let y1Label = L.DomUtil.create("label", "leaflet-control-display-label", rectForm)
			y1Label.innerHTML = "Y1"
			this.y1 = L.DomUtil.create("input", "leaflet-control-display-input-number", rectForm)
			this.y1.setAttribute("type", "number")
			this.y1.setAttribute("name", "y1")

			let y2Label = L.DomUtil.create("label", "leaflet-control-display-label", rectForm)
			y2Label.innerHTML = "Y2"
			this.y2 = L.DomUtil.create("input", "leaflet-control-display-input-number", rectForm)
			this.y2.setAttribute("type", "number")
			this.y2.setAttribute("name", "y2")

			let centerLabel = L.DomUtil.create("label", "leaflet-control-display-label", rectForm)
			centerLabel.innerHTML = "Center"
			this.center = L.DomUtil.create("input", "leaflet-control-display-input-number", rectForm)
			this.center.setAttribute("type", "text")
			this.center.setAttribute("name", "center")
			this.center.setAttribute("readOnly", true)

			let mapSetup = L.DomUtil.create("label", "leaflet-control-display-label", rectForm)
			mapSetup.innerHTML = "MapSetup"
			this.botmap = L.DomUtil.create("input", "leaflet-control-map-input", rectForm)
			this.botmap.setAttribute("type", "text")
			this.botmap.setAttribute("name", "botmap")
			this.botmap.setAttribute("readOnly", true)
			this.botmap.addEventListener("click", () => {
				navigator.clipboard.writeText(this.botmap.value).then(
					() => console.log("Copied to the clipboard: this.botmap.value"),
					() => console.error("Cannot copy text to clipboard")
				)
			})

			rectForm.addEventListener("change", this.changeRect.bind(this))

			return container
		},

		changeRect: function (e) {
			let [width, height, _, x1, x2, y1, y2] = Array.from(e.srcElement.parentElement.children)
				.filter((elem) => elem.nodeName == "INPUT")
				.map((elem) => elem.value)
			if (["width", "height"].includes(e.srcElement.name)) {
				x2 = Number(x1) + Number(width)
				y1 = Number(y2) + Number(height)
			}
			let bounds = L.latLngBounds([
				[y2, x1],
				[y1, x2]
			])
			this.rect.setBounds(bounds)
			this.update(bounds)
		},

		update: function (bounds) {
			// update control content
			let chunk = {
				x1: bounds.getWest() >> 6,
				y1: bounds.getNorth() >> 6,
				x2: bounds.getEast() >> 6,
				y2: bounds.getSouth() >> 6
			}

			let global = {
				x1: bounds.getWest() * 4 - 4096,
				y1: 60 - (bounds.getNorth() * 4 - 50370),
				x2: bounds.getEast() * 4 - 4096,
				y2: 60 - (bounds.getSouth() * 4 - 50370)
			}

			let width = global.x2 - global.x1
			let height = global.y1 - global.y2
			let center_width = (global.x1 + global.x2) / 2
			let center_height = (global.y1 + global.y2) / 2

			this.width.value = width
			this.height.value = height
			this.area.value = height * width
			this.x1.value = global.x1
			this.x2.value = global.x2
			this.y1.value = global.y1
			this.y2.value = global.y2
			this.center.value = `${center_width}, ${center_height}`
			this.botmap.value = `Map.SetupChunk(Chunk(${chunk.x1}, ${chunk.y1}, ${chunk.x2}, ${chunk.y2}), 0);`
		},

		expand: function () {
			let bounds = this._map.getBounds().pad(-0.3)
			this.rect.setBounds(bounds)
			this.rect.addTo(this._map)
			return L.Control.Display.prototype.expand.call(this)
		},

		collapse: function () {
			this.rect.remove()
			return L.Control.Display.prototype.collapse.call(this)
		}
	})

	L.control.display.rect = function (options) {
		return new L.Control.Display.Rect(options)
	}

	L.Map.addInitHook(function () {
		if (this.options.rect) {
			this.rect = L.control.display.rect()
			this.addControl(this.rect)
		}
	})
})
