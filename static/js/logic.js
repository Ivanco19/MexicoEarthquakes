// URL del archivo CSV
const csvUrl = '../Sismos_mexico_2023.csv';

// Inicializar el mapa Leaflet
let map = L.map("map", {
  center: [23.6345, -102.5528], // Vista de México
  zoom: 5
});

// Agregando la capa de teselas (tile layer)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Crear un grupo de capas para los marcadores
let markers = L.markerClusterGroup();

// Crear capas para diferentes rangos de magnitud
const magnitudeLayers = {
  "4 - 4.3": L.layerGroup(),
  "4.4 - 5": L.layerGroup(),
  "5 - 6": L.layerGroup(),
  "Mayor a 6": L.layerGroup()
};

// Función para crear marcadores y agregarlos a la capa correspondiente
function createMarkers(quake, layer) {
  const coordenates = L.latLng(quake.Latitud, quake.Longitud);
  const state = quake['Referencia de localizacion'].match(/,\s(.+)/)[1];
  const info = `
    <strong>Fecha:</strong> ${quake.Fecha}<br>
    <strong>Hora:</strong> ${quake.Hora}<br>
    <strong>Magnitud:</strong> ${quake.Magnitud}<br>
    <strong>Estado:</strong> ${state}<br>
  `;
  const marker = L.marker(coordenates).bindPopup(info);
  layer.addLayer(marker);
}

// Cargar datos desde el archivo CSV
d3.csv(csvUrl).then((quakes) => {
  quakes.forEach((quake) => {
    const mag = parseFloat(quake.Magnitud);

    if (mag >= 4 && mag < 4.4) {
      createMarkers(quake, magnitudeLayers["4 - 4.3"]);
    } else if (mag >= 4.4 && mag < 5) {
      createMarkers(quake, magnitudeLayers["4.4 - 5"]);
    } else if (mag >= 5 && mag < 6) {
      createMarkers(quake, magnitudeLayers["5 - 6"]);
    } else {
      createMarkers(quake, magnitudeLayers["Mayor a 6"]);
    }
  });

  // Agregar las capas al grupo de marcadores y al mapa
  Object.keys(magnitudeLayers).forEach((key) => {
    markers.addLayer(magnitudeLayers[key]);
  });

  // Agrega la capa de clusters al mapa
  markers.addTo(map);

  // Agregar el control de capas al mapa
  const layerControl = L.control.layers(null, magnitudeLayers, { position: 'topright' }).addTo(map);

  // Escuchar eventos de cambio de capa y mostrar/ocultar el grupo de clusters según sea necesario
  map.on('layeradd layerremove', function (event) {
    const activeLayers = Object.keys(magnitudeLayers).filter(key => map.hasLayer(magnitudeLayers[key]));
    if (activeLayers.length === 0) {
      markers.addTo(map);
    } else {
      markers.removeFrom(map);
    }
  });
});

