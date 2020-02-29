window.addEventListener('load', (function (e) {
        let map = runescape_map;

        var idMarkers = L.control.layers({}, {}, {
                "collapsed": false,
                "position": 'topleft'
            });

        function initObjects() {
            const is_number = new RegExp(/^\d+$/);
            let parsedUrl = new URL(window.location.href);

            if (parsedUrl.searchParams.get('object')) {
                const objects = parsedUrl.searchParams.getAll('object');
                const nameIdTable = "../mejrs.github.io/name_collection.json";
                const nameDataPromise = fetch(nameIdTable);
                nameDataPromise.then(response => response.json()).then(data => {
                    const idArray = objects.map(item => is_number.test(item) ? [item] : data[item] || []);
                    processIdArray(objects, idArray);
                });
                nameDataPromise.catch(() => console.log("Unable to fetch " + nameIdTable));
            }

            if (parsedUrl.searchParams.get('action')) {
                const action = parsedUrl.searchParams.getAll('action');
                const actionIdTable = "../mejrs.github.io/action_collection.json";
                const actionDataPromise = fetch(actionIdTable);
                actionDataPromise.then(response => response.json()).then(data => {
                    const idArray = action.map(item => data[item] || []);
                    processIdArray(action, idArray);
                });
                actionDataPromise.catch(() => console.log("Unable to fetch " + actionIdTable));
            }
        }

        //objects array of objects parsed from searchparams
        //isArray each element is a list of possible ids each object has
        function processIdArray(objects, idArray) {
            idArray.forEach((idList, index) => {
                let name = objects[index];
                idList.forEach((id) => plantIdMarker(id, name))

				
            });
			
        }

        function plantIdMarker(id, name) {
            const SEPARATOR = ", ";
            const CONFIRMQTY = 500;
            const isNumber = new RegExp(/^\d+$/);
			
            var markerPromise = fetch("../mejrs.github.io/ids/id=" + id + ".json");
            const currentPlane = map.getPlane();
            markerPromise.then(response => response.json()).then(data => {
                let properties = "";
                for (let[key, value]of Object.entries(data.properties)) {
                    if (!["name", "id"].includes(key)) {
                        properties += key + " = " + JSON.stringify(value) + "<br>";
                    }
                }

                const uniques = data.uniques;
                if (uniques.length > CONFIRMQTY) {
                    confirm_popup = window.confirm("Really load " + uniques.length + " markers?");
                    if (!confirm_popup) {
                        return
                    }
                }

                var markerCollection = L.layerGroup();
                uniques.forEach(element => {
                    let i = element.o.i << 6 | element.o.x;
                    let j = element.o.j << 6 | element.o.y;

                    let icon = L.icon({
                            iconUrl: '../mejrs.github.io/images/marker-icon.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            tooltipAnchor: [16, -28],
                            shadowSize: [41, 41]
                        });
                    let greyscaleIcon = L.icon({
                            iconUrl: '../mejrs.github.io/images/marker-icon-greyscale.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            tooltipAnchor: [16, -28],
                            shadowSize: [41, 41]
                        });

                    let popUpText = "";
                    popUpText += "name = " + data.properties.name + "<br>";
                    popUpText += "id = " + id + "<br>";
                    popUpText += "look = " + [element.o.p, element.o.i, element.o.j, element.o.x, element.o.y].join(SEPARATOR) + "<br>";
                    popUpText += "origin = " + [element.o.p, i, j].join(SEPARATOR) + "<br>";
                    popUpText += "type = " + element.t + "<br>";
                    popUpText += "rotation = " + element.r + "<br>";
                    popUpText += properties;

                    let marker = L.marker([(j + 0.5), (i + 0.5)], {
                            icon: element.o.p === currentPlane ? icon : greyscaleIcon,
                        });

                    marker.bindPopup(popUpText);
                    marker.on('click', function (e) {
                        this.openPopup();
                    });
                    map.on('planechange', function (e) {
                        marker.setIcon(element.o.p === e.newPlane ? icon : greyscaleIcon);
                    });
                    markerCollection.addLayer(marker);
                });
                console.log(isNumber.test(name) ? name : (name + " (" + id + ")"), "has " + uniques.length + " occurrences");
				
                markerCollection.addTo(map);

                idMarkers.addOverlay(markerCollection, isNumber.test(name) ? name : (name + " (" + id + ")")).addTo(map);
				return uniques.length;
            });

            markerPromise.catch(function (resolve, reject) {
                console.log(isNumber.test(name) ? name : (name + " (" + id + ")"), "has 0 occurrences");
				return 0;
            });
			
        }

        initObjects();
    }));
