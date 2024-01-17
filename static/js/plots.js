var rawDataURL = '../Sismos_mexico_.csv';
var xField = 'Fecha';
var yField = 'Magnitud';

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