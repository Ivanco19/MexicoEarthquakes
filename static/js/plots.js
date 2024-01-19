var rawDataURL = '../Sismos_mexico_2023.csv';



d3.csv(rawDataURL).then((datos) => {
    // Convertir la columna de fecha a objetos de fecha
    datos.forEach((d) => {
        const [dia, mes, año] = d.Fecha.split('/');
        const fechaFormatoCorrecto = `${año}/${mes}/${dia}`;
    d.Fecha = new Date(fechaFormatoCorrecto);
    d.Magnitud = parseFloat(d.Magnitud)
       // d.Fecha=fechaFormatoCorrecto
    });
  
    // Agrupar los datos por día y obtener la magnitud máxima para cada día
    const eventosMaximosDiarios = d3.rollups(
      datos,
      (v) => d3.max(v, (d) => d.Magnitud),
      (d) => d3.timeDay(d.Fecha)
    );
  
    // Convertir los resultados a un array de objetos
    //const resultados = Array.from(eventosMaximosDiarios, ([Fecha, Magnitud]) => ({ Fecha, Magnitud }));
        
    const fechas = eventosMaximosDiarios.map(d=>d[0].toISOString().split('T')[0])
    const magnitudes = eventosMaximosDiarios.map(d=>d[1])

    // Mostrar los resultados
    console.log(magnitudes);
  });



var xField = 'fechas';
var yField = 'magnitudes';

var selectorOptions = {
    buttons: [{
        step: 'month',
        stepmode: 'backward',
        count: 1,
        label: '1m'
    }, {
        step: 'month',
        stepmode: 'backward',
        count: 6,
        label: '6m'
    }, {
        step: 'year',
        stepmode: 'todate',
        count: 1,
        label: 'YTD'
    }, {
        step: 'year',
        stepmode: 'backward',
        count: 1,
        label: '1y'
    }, {
        step: 'all',
    }],
};

Plotly.d3.csv(rawDataURL, function(err, rawData) {
    if(err) throw err;

    var data = prepData(rawData);
    var layout = {
        title: 'Sismos en México en 2023',
        xaxis: {
            rangeselector: selectorOptions,
            rangeslider: {}
        },
        yaxis: {
            fixedrange: true
        }
    };

    Plotly.plot('graph', data, layout, {showSendToCloud: true});
});

function prepData(rawData) {
    var x = [];
    var y = [];

    console.log(rawData.length)
    console.log(rawData)

    rawData.forEach(function(datum, i) {
        x.push(new Date(datum[xField]));
        y.push((datum[yField]));
    });

    return [{
        mode: 'lines',
        x: x,
        y: y
    }];
}


//________________________







//separar estados de la columna referencia de loc

d3.csv(rawDataURL).then((datos) => {
    datos.forEach((d) => {
        const [comp, estado] = d['Referencia de localizacion'].split(', ');
        const estados = estado;

        console.log(estados)}


        )});

//hacer count por estado

//barplot
