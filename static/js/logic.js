// Read CSV file
var csvUrl = '../Sismos_mexico_2023.csv';

// Creating the map object
let map = L.map("map", {
  center: [22.2071553,-100.3379744], // Mexico map
  zoom: 5
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a new marker cluster group.
let markers = L.markerClusterGroup();

// Create different group layers (according to earthquake magnitude).
const magnitudeLayers = {
  "Magnitude 4 - 4.3": L.layerGroup(),
  "Magnitude 4.4 - 5": L.layerGroup(),
  "Magnitude 5 - 6": L.layerGroup(),
  "Greater than 6": L.layerGroup()
};

// This function create all the markers and popups relevant information.
function createMarkers(quake, layer) {
  const coordenates = L.latLng(quake.Latitud, quake.Longitud);
  const state = quake['Referencia de localizacion'].match(/,\s(.+)/)[1];
  const info = `
    <strong>Date:</strong> ${quake.Fecha}<br>
    <strong>Time:</strong> ${quake.Hora}<br>
    <strong>Magnitude:</strong> ${quake.Magnitud}<br>
    <strong>State:</strong> ${state}<br>
  `;
  const marker = L.marker(coordenates).bindPopup(info);
  layer.addLayer(marker);
}

// Get the data with d3.
d3.csv(csvUrl).then((quakes) => {
  quakes.forEach((quake) => {
    const magnitude = parseFloat(quake.Magnitud);

    // Evaluate magnitude and categorize each earthquake.
    if (magnitude >= 4 && magnitude < 4.4) {
      createMarkers(quake, magnitudeLayers["Magnitude 4 - 4.3"]);
    } else if (magnitude >= 4.4 && magnitude < 5) {
      createMarkers(quake, magnitudeLayers["Magnitude 4.4 - 5"]);
    } else if (magnitude >= 5 && magnitude < 6) {
      createMarkers(quake, magnitudeLayers["Magnitude 5 - 6"]);
    } else {
      createMarkers(quake, magnitudeLayers["Greater than 6"]);
    }
  });

  // Add a new marker to the cluster group.
  Object.keys(magnitudeLayers).forEach((key) => {
    markers.addLayer(magnitudeLayers[key]);
  });

  // Add our marker cluster layer to the map.
  markers.addTo(map);

  // Add layer control to the map.
  layerControl = L.control.layers(null, magnitudeLayers, { position: 'topright' }).addTo(map);

  // Listen layer changes events and show/hide cluster group when necessary.
  map.on('layeradd layerremove', function (event) {
    const activeLayers = Object.keys(magnitudeLayers).filter(key => map.hasLayer(magnitudeLayers[key]));
    if (activeLayers.length === 0) {
      markers.addTo(map);
    } else {
      markers.removeFrom(map);
    }
  });
});
