// URL del archivo CSV
const csvUrl = './Sismos_mexico_2023.csv';

// Initialize Leaflet map
let map = L.map("map", {
    center: [23.6345, -102.5528], //Mexico view
    zoom: 5
  })

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)


let markers = L.markerClusterGroup()
// Create markers with popups and add them to the map
d3.csv(csvUrl).then((quakes) => {
    quakes.forEach((quake) => {
        
        // We get latitud and longitud and transform to a coordenate
        const coordenates = L.latLng(quake.Latitud, quake.Longitud)

        // With regular expressions we extract the state after the comma and white space
        const state = quake['Referencia de localizacion'].match(/,\s(.+)/)[1]

        // Store in one variable all the info to display
        const info = `
            <strong>Fecha:</strong> ${quake.Fecha}<br>
            <strong>Hora:</strong> ${quake.Hora}<br>
            <strong>Magnitud:</strong> ${quake.Magnitud}<br>
            <strong>Estado:</strong> ${state}<br>
        `;

        // Add a new marker to the cluster group, and bind a popup.
        const marker = L.marker(coordenates).bindPopup(info)
        markers.addLayer(marker)
    })

    // Add our markers cluster layer to the map.
    map.addLayer(markers)
})