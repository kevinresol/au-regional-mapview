const REGIONAL_POSTCODES = {
	ACT: { category2: [(c) => true], category3: [] },
	NSW: {
		category2: [
			2259,
			(c) => c >= 2264 && c <= 2308,
			(c) => c >= 2500 && c <= 2526,
			(c) => c >= 2528 && c <= 2535,
			2574,
		],
		category3: [
			(c) => c >= 2250 && c <= 2258,
			(c) => c >= 2260 && c <= 2263,
			(c) => c >= 2311 && c <= 2490,
			2527,
			(c) => c >= 2536 && c <= 2551,
			(c) => c >= 2575 && c <= 2739,
			(c) => c >= 2753 && c <= 2754,
			(c) => c >= 2756 && c <= 2758,
			(c) => c >= 2773 && c <= 2898,
		],
	},
	NT: { category2: [], category3: [(c) => true] },
	QLD: {
		category2: [
			(c) => c >= 4019 && c <= 4022,
			4025,
			4037,
			4074,
			(c) => c >= 4076 && c <= 4078,
			(c) => c >= 4207 && c <= 4275,
			(c) => c >= 4300 && c <= 4301,
			(c) => c >= 4303 && c <= 4305,
			(c) => c >= 4500 && c <= 4506,
			(c) => c >= 4508 && c <= 4512,
			(c) => c >= 4514 && c <= 4516,
			(c) => c >= 4517 && c <= 4519,
			4521,
			(c) => c >= 4550 && c <= 4551,
			(c) => c >= 4553 && c <= 4562,
			(c) => c >= 4564 && c <= 4569,
			(c) => c >= 4571 && c <= 4575,
		],
		category3: [
			4124,
			4125,
			4133,
			(c) => c >= 4183 && c <= 4184,
			(c) => c >= 4280 && c <= 4287,
			(c) => c >= 4306 && c <= 4498,
			4507,
			4552,
			4563,
			4570,
			(c) => c >= 4580 && c <= 4895,
		],
	},
	SA: {
		category2: [
			(c) => c >= 5000 && c <= 5171,
			(c) => c >= 5173 && c <= 5174,
			(c) => c >= 5231 && c <= 5235,
			(c) => c >= 5240 && c <= 5252,
			5351,
			(c) => c >= 5950 && c <= 5960,
		],
		category3: [(c) => true],
	},
	TAS: {
		category2: [
			7000,
			(c) => c >= 7004 && c <= 7026,
			(c) => c >= 7030 && c <= 7109,
			(c) => c >= 7140 && c <= 7151,
			(c) => c >= 7170 && c <= 7177,
		],
		category3: [(c) => true],
	},
	VIC: {
		category2: [
			(c) => c >= 3211 && c <= 3232,
			3235,
			3240,
			3328,
			(c) => c >= 3330 && c <= 3333,
			3340,
			3342,
		],
		category3: [
			(c) => c >= 3097 && c <= 3099,
			3139,
			(c) => c >= 3233 && c <= 3234,
			(c) => c >= 3236 && c <= 3239,
			(c) => c >= 3241 && c <= 3325,
			3329,
			3334,
			3341,
			(c) => c >= 3345 && c <= 3424,
			(c) => c >= 3430 && c <= 3799,
			(c) => c >= 3809 && c <= 3909,
			(c) => c >= 3912 && c <= 3971,
			(c) => c >= 3978 && c <= 3996,
		],
	},
	WA: {
		category2: [
			(c) => c >= 6000 && c <= 6038,
			(c) => c >= 6050 && c <= 6083,
			(c) => c >= 6090 && c <= 6182,
			(c) => c >= 6208 && c <= 6211,
			6214,
			(c) => c >= 6556 && c <= 6558,
		],
		category3: [(c) => true],
	},
};

window.initGoogleMap = async function () {
	console.log("initGoogleMap");

	const container = document.createElement("div");
	container.style.height = "100vh";
	document.body.appendChild(container);

	const map = new google.maps.Map(container, {
		zoom: 8,
		center: { lat: -33.62, lng: 150.71 },
	});
	
	const legend = document.createElement('div');
	legend.style.border = 'solid 1px grey';
	legend.style.backgroundColor = 'white';
	legend.style.padding = '12px';
	legend.style.margin = '12px';
	legend.innerHTML = `
		<h3>Legend</h3>
		<div><div style="padding: 8px; color: white; border:solid 1px red;background-color:red">Category 2</div></div>
		<div><div style="padding: 8px; color: white; border:solid 1px blue;background-color:blue">Category 3</div></div>
		<div><div style="padding: 8px; color: black; border:solid 1px yellow;background-color:yellow">N/A</div></div>
	`;
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);

	const postcodes = (
		await (await fetch("postcodes/australian_postcodes.json")).json()
	).reduce((obj, val) => {
		if (!obj[val.state]) obj[val.state] = {};
		const state = obj[val.state];
		const name = val.locality.toUpperCase();

		if (!state[name]) state[name] = [];

		state[name].push({
			postcode: parseInt(val.postcode),
			latlng: new google.maps.LatLng(val.Lat_precise || val.lat, val.Long_precise || val.long),
		});

		return obj;
	}, {});

	for (state in REGIONAL_POSTCODES) {
		addState({
			map,
			postcodes,
			geojson: `geojson/suburb-10-${state.toLowerCase()}.geojson`,
			state,
		});
	}
};

function addState(config) {
	const { map, geojson, state, postcodes } = config;
	const data = new google.maps.Data({ map });
	data.loadGeoJson(geojson);

	var first = true;
	data.setStyle(function (feature) {
		try {
			const { postcode } = featureToSuburb(postcodes, state, feature);

			if (isRegional(REGIONAL_POSTCODES[state].category2, postcode)) {
				return {
					fillColor: "blue",
					strokeColor: "blue",
					strokeWeight: 1,
				};
			}

			if (isRegional(REGIONAL_POSTCODES[state].category3, postcode)) {
				return {
					fillColor: "red",
					strokeColor: "red",
					strokeWeight: 1,
				};
			}
		} catch (ex) {
			if (first) {
				console.error(ex);
				first = false;
			}

			return {
				fillColor: "yellow",
				strokeColor: "yellow",
				strokeWeight: 1,
			};
		}

		return {
			fillColor: "gray",
			strokeColor: "gray",
			strokeWeight: 1,
		};
	});

	const markers = [];

	data.addListener("mouseover", function (event) {
		const name = featureToSuburbName(state, event.feature).toUpperCase();
		const suburbs = postcodes[state][name];

		const closest = featureToSuburb(postcodes, state, event.feature);
		if (closest) {
			markers.push(
				new google.maps.Marker({
					position: closest.latlng,
					map,
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						fillColor: "orange",
						fillOpacity: 1,
						strokeColor: "orange",
						strokeWeight: 1,
						scale: 10,
						zIndex: 10,
					},
				})
			);
		}

		if (suburbs) {
			for (suburb of suburbs) {
				markers.push(
					new google.maps.Marker({
						position: suburb.latlng,
						map,
						label: { text: `${name} (${suburb.postcode})`, color: "white" },
						icon: {
							path: google.maps.SymbolPath.CIRCLE,
							fillColor: "green",
							fillOpacity: 1,
							strokeColor: "yellow",
							strokeWeight: 1,
							scale: 8,
							zIndex: 5,
							labelOrigin: new google.maps.Point(0, 3),
						},
					})
				);
			}
		}

		data.revertStyle();
		data.overrideStyle(event.feature, { strokeWeight: 3 });
	});

	data.addListener("mouseout", function (event) {
		for (marker of markers) marker.setMap(null);
		markers.length = 0;
		data.revertStyle();
	});
}

function featureToSuburbName(state, feature) {
	var key = `${state.toLowerCase()}_local_2`;
	if (state.length == 3) key = `${state.toLowerCase()}_loca_2`;

	return feature.getProperty(key);
}
function featureToSuburb(postcodes, state, feature) {
	try {
		const name = featureToSuburbName(state, feature).toUpperCase();
		const suburbs = postcodes[state][name];
		
		if(suburbs.length == 1) return suburbs[0];

		// find feature center
		const latlngs = feature.getGeometry().getArray()[0].getArray();
		const center = new google.maps.LatLng(
			latlngs.reduce((sum, v) => sum + v.lat(), 0) / latlngs.length,
			latlngs.reduce((sum, v) => sum + v.lng(), 0) / latlngs.length
		);

		var closestSuburb = null;
		var closestDist = Number.POSITIVE_INFINITY;

		for (suburb of suburbs) {
			const dist = google.maps.geometry.spherical.computeDistanceBetween(
				center,
				suburb.latlng
			);
			if (dist < closestDist) {
				closestDist = dist;
				closestSuburb = suburb;
			}
		}
		return closestSuburb;
	} catch (ex) {
		return null;
	}
}

function isRegional(predicates, code) {
	for (p of predicates) {
		if (typeof p === "function") {
			if (p(code)) return true;
		} else {
			if (p === code) return true;
		}
	}
	return false;
}
