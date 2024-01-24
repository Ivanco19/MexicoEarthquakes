// Global variable to store all original data
let datos = []

// Global variable to store filtered data
let datosFiltrados = []

// Read CSV file
var rawDataURL = '../Sismos_mexico_2023.csv'

// This function filters data according to user selection
function dinamicFilter(datos, cuarto) {
    switch (cuarto) {
        case 'Q1':
            return datos.filter((d) => d.Fecha.getMonth() >= 0 && d.Fecha.getMonth() <= 2)
        case 'Q2':
            return datos.filter((d) => d.Fecha.getMonth() >= 3 && d.Fecha.getMonth() <= 5)
        case 'Q3':
            return datos.filter((d) => d.Fecha.getMonth() >= 6 && d.Fecha.getMonth() <= 8)
        case 'Q4':
            return datos.filter((d) => d.Fecha.getMonth() >= 9 && d.Fecha.getMonth() <= 11)
        default:
            return datos
    }
}

// This function plots a time series chart with earthquake historical data
function timeSeriesChart(fechas, magnitudes){
    // Chart set up
    var trace1 = {
        type: "scatter",
        mode: "lines",
        x: fechas,
        y: magnitudes,
        line: { color: '#fd7e14' }
    }

    var data1 = [trace1]

    var layout1 = {
        xaxis: {
            autorange: true,
            // Transforms date format to MM/DD/AAAA
            range: [fechas[0].toISOString(), fechas[fechas.length - 1].toISOString()],
            rangeselector: {
                buttons: [
                    {
                        count: 1,
                        label: '1m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {
                        count: 2,
                        label: '2m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    { step: 'all' }
                ]
            },
            rangeslider: {
                range: [fechas[0].toISOString(), fechas[fechas.length - 1].toISOString()]
            },
            type: 'date'
        },
        yaxis: {
            autorange: true,
            range: [0, d3.max(magnitudes)],
            type: 'linear'
        },
        height: 500,
        plot_bgcolor: '#e9ecef',
        paper_bgcolor: '#e9ecef',
        margin: {"t": 0, "b": 50, "l": 60, "r": 60}
    }
    
    // Creates the new plot using data1 and layout1 settings
    Plotly.newPlot('graph', data1, layout1)
}

// This function creates a bar chart earthquakes by state
function barChart(quake_quantity, state){
    // Chart set up
    var trace2 = {
        type: "bar",
        x: quake_quantity,
        y: state,
        marker: { color: '#0d6efd' },
        orientation: 'h'
    }

    var data2 = [trace2];

    var layout2 = { 
        yaxis: {
            title: 'States'
        },
        plot_bgcolor: '#e9ecef',
        paper_bgcolor: '#e9ecef',
        height: 400,
        width: 420,
        margin: {"t": 10, "b": 30, "l": 80, "r": 0}
    }

    // Creates the new plot using data2 and layout2 settings
    Plotly.newPlot('barChart', data2, layout2)
}

// This function creates a pie chart earthquakes by month
function pieChart(months, quakes){
    // Chart set up
    var data3 = [{
        type: "pie",
        values: quakes,
        labels: months,
        textinfo: "label+percent",
        textposition: "outside"
      }]
      
      var layout3 = {
        paper_bgcolor: '#e9ecef',
        height: 400,
        width: 430,
        margin: {"t": 20, "b": 30, "l": 60, "r": 50},
        showlegend: false
        }
      
    // Creates the new plot using data3 and layout3 settings
    Plotly.newPlot('pieChart', data3, layout3)
}

// This function updates summary table with relevant information
function updateTable(magnitudes, state, quake_quantity){
    // Calculate number of earthquakes and shows in html table
    let numberQuakes = datosFiltrados.length
    d3.select('#totalSismos').text(numberQuakes)

    // Calculate the most seismic state and shows in html table
    let lastIndex = state.length - 1;
    let seismicState = state[lastIndex]
    d3.select('#estado').text(`${seismicState} - ${quake_quantity[lastIndex]}`) 

    // Calculate max earthquake magnitude and shows in html table
    let maxEarthquakeMagnitude = magnitudes.sort((a, b) => b - a)[0]
    d3.select('#maxEarthquake').text(maxEarthquakeMagnitude)

    // Find the max earthquake magnitude and get its info (location, date, time)
    var maxEarthquake = datosFiltrados.filter(function(objeto) {
        return objeto.Magnitud === maxEarthquakeMagnitude;
    });
        // Date
    let date = d3.timeFormat('%b %d')(maxEarthquake[0].Fecha)
    d3.select('#date').text(date)
        // Location
    let location = maxEarthquake[0].estado
    d3.select('#location').text(location)
        // Time
    let time = maxEarthquake[0].Hora
    d3.select('#time').text(time)
}

// This function prepares data for visualization
function cargarDatos(){

    // 1. DATA PREPARATION FOR TIME SERIES VISUALIZATION
    // Groups earthquake magnitudes by day and gets maximum event
    const eventosMaximosDiarios = d3.rollups(
        datosFiltrados,
        (v) => d3.max(v, (d) => d.Magnitud),
        (d) => d3.timeDay(d.Fecha)
    )

    // Transform results to an array of objects
    const resultados = eventosMaximosDiarios.map(([fecha, magnitud]) => ({ fecha, magnitud }))
    const fechas = resultados.map(d => d.fecha)
    const magnitudes = resultados.map(d => d.magnitud)

    // Plot a time series chart using magnitudes and dates
    timeSeriesChart(fechas, magnitudes)
    
    // 2. DATA PREPARATION FOR BAR CHART VISUALIZATION
    // Create an object to count quakes by city/state
    const conteoPorCiudad = {}

    // Iterate through all data and counts quakes by state
    datosFiltrados.forEach((d) => {
        const estado = d.estado
        conteoPorCiudad[estado] = (conteoPorCiudad[estado] || 0) + 1
    })

    // Transform results to an array of objects
    const datosGraficoCiudades = Object.entries(conteoPorCiudad).map(([estado, cantidad]) => ({ estado, cantidad }))
    
    // Sort the results and just get the top 10
    const datosParaGrafico = datosGraficoCiudades.slice(0,10).sort((a, b) => a.cantidad - b.cantidad)
    const quake_quantity = datosParaGrafico.map(d => d.cantidad)
    const state = datosParaGrafico.map(d => d.estado)

    // Plot a bar chart using quantity of quakes per city
    barChart(quake_quantity, state) 

    // 3. DATA PREPARATION FOR PIE CHART VISUALIZATION
    // Groups number of earthquakes by month
    const totalEventosPorMes = d3.rollups(
        datosFiltrados,
        (v) => v.length,
        (d) => d3.timeMonth(d.Fecha)
    )

    // Transform results to an array of objects
    const quakes_month = Array.from(totalEventosPorMes, ([meses, sismos]) => ({
        meses: d3.timeFormat('%b')(meses), 
        sismos 
    }))
    const months = quakes_month.map(d => d.meses)
    const quakes = quakes_month.map(d => d.sismos)
    
    // Plot a pie chart using earthquakes per month
    pieChart(months, quakes)

    // Update html summary table according to user filter
    updateTable(magnitudes, state, quake_quantity)
}

// This function filters data according to user selection
function actualizarDatos(){
    
    const cuartoSeleccionado = document.getElementById('userSelection').value
    datosFiltrados = dinamicFilter(datos, cuartoSeleccionado)
    
    // Because its a dinamic visualization we need to build new plots
    cargarDatos()
}

// Read csv file using D3
d3.csv(rawDataURL).then((data) => {
    
    // assign data from csv file to a variable so we can make it global
    datos = data
    
    // Transform date column to a new date object. Parse magnitude info to float type
    datos.forEach((d) => {
        const [dia, mes, año] = d.Fecha.split('/')
        const fechaFormatoCorrecto = `${mes}/${dia}/${año}`
        d.Fecha = new Date(fechaFormatoCorrecto)
        d.Magnitud = parseFloat(d.Magnitud)
        
        // Extract state from 'Referencia de localizacion' column
        const [, ciudad] = d['Referencia de localizacion'].split(', ')
        const estado = ciudad.trim()
        d.estado = estado
    })

    //Initialize plots visualizations
    actualizarDatos()
});