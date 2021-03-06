function createTimeSeries(dates,tmax,precip){
    //dates=dates.slice(0,90)

	$(function () {
    $('#time_series').highcharts({
        chart: {
            type:'spline',
            height:'340',
            width:'430',
            marginTop:'20',
            alignTicks: false
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
                //['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: [{
            title: {
               //text: 'Average Maximum Temperature (F)'
               text: 'Degrees (F)'
            },
            showEmpty: false,
            plotLines: [{
                value: 0,
                width: 1,
                //color: '#808080'
            }]
        },{
            title: {
                text: 'Precipitation (in)'
            },
            showEmpty: false,
            plotLines: [{
                value: 0,
                width: 1,
                //color: '#808080'
            }],
            opposite:false
        },

        ],
        tooltip: {
            valueSuffix: 'F'
        },
        legend: {
            enabled: true,
            /*
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            */
            borderWidth: 0
        },
        series: [
            /*
            {
                name: 'Historical Range',
                type: 'areasplinerange',
                color: '#FEBAA0',
                data: [[53, 63], [44, 54], [49, 59], [50, 59], [53,64], [60, 69], [66, 78]]
            },
            */

            {
            //name: 'Avg Max Temp',
            name: 'Temperature Change from the Historical Mean',
            type:'spline',
            data: tmax,
            color: '#DB3F02'
        },
        {

            name: 'Precipitation Change from the Historical Mean',
            data: precip,
            visible:false,
            color: '#0000FF',
            yAxis:1,
            tooltip: {
                valueSuffix: ' inches'
            }
        },
            /*
            {
            name: 'Temperature error',
            type: 'errorbar',
            data: [[54, 57], [47, 51], [51, 56], [51, 54], [53,62], [60, 64],[68, 73]]
            },
             */



        /*{
            name: 'Berlin',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        }, {
            name: 'London',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }
        */

        ]
    });
});
}
