"use strict"

import "../leaflet.js"
import "../layers.js"
import "../plugins/leaflet.fullscreen.js"
import "../plugins/leaflet.mapSelector.js"
import "../plugins/leaflet.zoom.js"
import "../plugins/leaflet.plane.js"
import "../plugins/leaflet.position.js"
import "../plugins/leaflet.displays.js"
import "../plugins/leaflet.urllayers.js"
import "../plugins/leaflet.rect.js"
import "../plugins/leaflet.clickcopy.js"
import "../plugins/leaflet.maplabels.js"

void (function (global) {
	let runescape_map = (global.runescape_map = L.gameMap("map", {
		maxBounds: [
			[-1000, -1000],
			[12800 + 1000, 12800 + 1000]
		],
		maxBoundsViscosity: 0.5,
		customZoomControl: true,
		fullscreenControl: true,
		planeControl: true,
		positionControl: true,
		messageBox: true,
		rect: true,
		initialMapId: -1,
		plane: 0,
		x: 3200,
		y: 3200,
		minPlane: 0,
		maxPlane: 3,
		minZoom: -4,
		maxZoom: 8,
		doubleClickZoom: false,
		showMapBorder: true,
		enableUrlLocation: true
	}))

	L.control.display
		.objects({
			folder: "data_osrs",
			show3d: true,
			displayLayer: L.objects.osrs
		})
		.addTo(runescape_map)

	L.control.display
		.npcs({
			folder: "data_osrs",
			show3d: true
		})
		.addTo(runescape_map)

	L.tileLayer
		.main("layers-osrs/map/{zoom}/{plane}/{x}-{y}.png", {
			minZoom: -4,
			maxNativeZoom: 4,
			maxZoom: 8
		})
		.addTo(runescape_map)
		.bringToBack()

	let objects = L.tileLayer.main("layers-osrs/locations/{zoom}/{plane}_{x}_{y}.png", {
		minZoom: -4,
		maxNativeZoom: 2,
		maxZoom: 8
	})

	let grid = L.grid({
		bounds: [
			[0, 0],
			[12800, 6400]
		]
	})

	let npcs = L.dynamicIcons({
		dataPath: "data_osrs/NPCList_OSRS.json",
		minZoom: -3
	})

	grid.addTo(runescape_map)

	L.control.layers
		.urlParam(
			{},
			{
				objects: objects,
				npcs: npcs,
				grid: grid
			},
			{
				collapsed: true,
				position: "bottomright"
			}
		)
		.addTo(runescape_map)
})(this || window)
