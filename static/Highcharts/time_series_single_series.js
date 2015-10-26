function createTimeSeries(dates,data){

	$(function () {
    $('#time_series').highcharts({
        chart: {
            height:'300',
            width:'430',
            marginTop:'20',
        } ,
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        title: {
            text: '' ,
            x: -20 //center
        },
        subtitle: {
            //text: 'Source: University of Idaho',
            text: '',
            x: -20
        },
        xAxis: {
            categories: dates
        },
        yAxis: [{
            title: {
                text: 'Maximum Temperature (F)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                //color: '#808080'
            }]
        }],
        tooltip: {
            valueSuffix: 'F'
        },
        legend: {
            enabled: false,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Max Temp',
            data: data,
            color: '#C60000'
        },
            /*

            {
            name: 'Precip',
            data: precip,
            color: '#0000FF'
        },
        */

        ]
    });
});
}
