// Variable global para almacenar los datos originales
let datos = [];

// Variable global para almacenar los datos filtrados
let datosFiltrados = [];

var rawDataURL = '../Sismos_mexico_2023.csv';

function filtrarPorCuarto(datos, cuarto) {
    switch (cuarto) {
        case 'Q1':
            return datos.filter((d) => d.Fecha.getMonth() >= 0 && d.Fecha.getMonth() <= 2);
        case 'Q2':
            return datos.filter((d) => d.Fecha.getMonth() >= 3 && d.Fecha.getMonth() <= 5);
        case 'Q3':
            return datos.filter((d) => d.Fecha.getMonth() >= 6 && d.Fecha.getMonth() <= 8);
        case 'Q4':
            return datos.filter((d) => d.Fecha.getMonth() >= 9 && d.Fecha.getMonth() <= 11);
        case '2023':
            return datos.filter((d) => d.Fecha.getMonth() >= 0 && d.Fecha.getMonth() <= 11);
        default:
            return datos;
    }
}

function timeSeriesChart(fechas, magnitudes){
    // Configuración del gráfico
    var trace1 = {
        type: "scatter",
        mode: "lines",
        name: 'Magnitud Máxima',
        x: fechas,
        y: magnitudes,
        line: { color: '#fd7e14' }
    };

    var data1 = [trace1];

    var layout1 = {
        xaxis: {
            autorange: true,
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
        margin: {"t": 0, "b": 50, "l": 60, "r": 60}
    };
    
    Plotly.newPlot('graph', data1, layout1);
}

function barChart(datosParaGrafico){
    var trace2 = {
        type: "bar",
        x: datosParaGrafico.map(d => d.cantidad),
        y: datosParaGrafico.map(d => d.estado),
        marker: { color: '#0d6efd' },
        orientation: 'h'
    };

    var data2 = [trace2];

    var layout2 = { 
        yaxis: {
            title: 'States'
        },
        height: 400,
        width: 400,
        margin: {"t": 10, "b": 50, "l": 80, "r": 0}
    };

    Plotly.newPlot('barChart', data2, layout2);
}

function pieChart(months, quakes){
    var data3 = [{
        type: "pie",
        values: quakes,
        labels: months,
        textinfo: "label+percent",
        textposition: "outside"
      }]
      
      var layout3 = {
        height: 400,
        width: 400,
        margin: {"t": 10, "b": 50, "l": 50, "r": 80},
        showlegend: false
        }
      
      Plotly.newPlot('pieChart', data3, layout3)
}

function updateTable(magnitudes, datosParaGrafico){
    let minEarthquake = magnitudes.sort((a, b) => a - b)[0]
    d3.select('#minEarthquake').text(minEarthquake)
    let maxEarthquake = magnitudes.sort((a, b) => b - a)[0]
    d3.select('#maxEarthquake').text(maxEarthquake)
    let numeroFilas = datosFiltrados.length
    d3.select('#totalSismos').text(numeroFilas)
    let estado = datosParaGrafico[9].estado
    d3.select('#estado').text(estado) 
}

function cargarDatos(){

    // Agrupar los datos por mes y obtener la magnitud máxima para cada mes
    const eventosMaximosDiarios = d3.rollups(
        datosFiltrados,
        (v) => d3.max(v, (d) => d.Magnitud),
        (d) => d3.timeDay(d.Fecha)
    );

    // Convertir los resultados a un array de objetos
    const resultados = eventosMaximosDiarios.map(([fecha, magnitud]) => ({ fecha, magnitud }));
    const fechas = resultados.map(d => d.fecha);
    const magnitudes = resultados.map(d => d.magnitud);

    timeSeriesChart(fechas, magnitudes)
    
    // Crear un objeto para contar la cantidad de sismos por ciudad
    const conteoPorCiudad = {};

    // Iterar sobre los datos y contar la cantidad de sismos por ciudad
    datosFiltrados.forEach((d) => {
        const estado = d.estado;
        conteoPorCiudad[estado] = (conteoPorCiudad[estado] || 0) + 1;
    });

    // Convertir el objeto de conteo a un array de objetos
    const datosGraficoCiudades = Object.entries(conteoPorCiudad).map(([estado, cantidad]) => ({ estado, cantidad }));

    // Ordenar los datos por cantidad descendente
    const datosParaGrafico = datosGraficoCiudades.slice(0,10).sort((a, b) => a.cantidad - b.cantidad);

    barChart(datosParaGrafico) 

    // Obtener el total de eventos por mes
    const totalEventosPorMes = d3.rollups(
        datosFiltrados,
        (v) => v.length,
        (d) => d3.timeMonth(d.Fecha)
    );

    // Convertir los resultados a un array de objetos
    const quakes_month = Array.from(totalEventosPorMes, ([meses, sismos]) => ({
        meses: d3.timeFormat('%b')(meses), sismos }));
    const months = quakes_month.map(d => d.meses)
    const quakes = quakes_month.map(d => d.sismos)
    
    pieChart(months, quakes)

    updateTable(magnitudes, datosParaGrafico)
}

function actualizarDatos(){
    // Filtrar los datos según el cuarto de año seleccionado
    const cuartoSeleccionado = document.getElementById('quarterDropdown').value;
    datosFiltrados = filtrarPorCuarto(datos, cuartoSeleccionado);
    cargarDatos()
}

d3.csv(rawDataURL).then((data) => {
    datos = data;
    // Convertir la columna de fecha a objetos de fecha
    datos.forEach((d) => {
        const [dia, mes, año] = d.Fecha.split('/');
        const fechaFormatoCorrecto = `${mes}/${dia}/${año}`;
        d.Fecha = new Date(fechaFormatoCorrecto);
        d.Magnitud = parseFloat(d.Magnitud);
        
        // Extraer la ciudad de la columna de ubicación
        const [, ciudad] = d['Referencia de localizacion'].split(', ');
        const estado = ciudad.trim();
        d.estado = estado
    });
    actualizarDatos();
});