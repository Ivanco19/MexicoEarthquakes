var rawDataURL = '../Sismos_mexico_2023.csv';

d3.csv(rawDataURL).then((datos) => {
    // Convertir la columna de fecha a objetos de fecha
    datos.forEach((d) => {
        const [dia, mes, año] = d.Fecha.split('/');
        const fechaFormatoCorrecto = `${año}/${mes}/${dia}`;
        d.Fecha = new Date(fechaFormatoCorrecto);
        d.Magnitud = parseFloat(d.Magnitud);
    });

    // Agrupar los datos por mes y obtener la magnitud máxima para cada mes
    const eventosMaximosDiarios = d3.rollups(
        datos,
        (v) => d3.max(v, (d) => d.Magnitud),
        (d) => d3.timeDay(d.Fecha)
    );

    // Convertir los resultados a un array de objetos
    const fechas = eventosMaximosDiarios.map(d => d[0]);
    const magnitudes = eventosMaximosDiarios.map(d => d[1]);

    const resultados = Array.from(eventosMaximosDiarios, ([fechas, magnitudes]) => ({ fechas, magnitudes }));

    console.log(resultados)
    
    // Configuración del gráfico
    var trace1 = {
        type: "scatter",
        mode: "lines",
        name: 'Magnitud Máxima',
        x: fechas,
        y: magnitudes,
        line: { color: '#17BECF' }
    };

    var data = [trace1];

    var layout = {
        title: 'MAX MAGNITUDE BY DAY',
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
                        count: 3,
                        label: '3m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {
                        count: 6,
                        label: '6m',
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
        }
    };
    

    Plotly.newPlot('graph', data, layout);

});


// //________________________

// //separar estados de la columna referencia de localizacion

// d3.csv(rawDataURL).then((datos) => {
//     datos.forEach((d) => {
//         const [comp, estado] = d['Referencia de localizacion'].split(', ');
//         const estados = estado;

//         console.log(estados)}


//         )});

// //hacer count por estado

// //barplot
