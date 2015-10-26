function createNoaa3Month(temp_array_selected_division, precip_array_selected_dvision) {
    //dates=dates.slice(0,90)
    /*
    if (typeof Highcharts.charts.length > 4) {
        for (i=2; i < Highcharts.charts.length; i++) {
            Highcharts.charts[i].destroy()

        }
    }
    */
    $('#noaa_3_month').empty()

    $('<div class="nearTermHeader">Temperature Forecast <i class="wi wi-thermometer" style="color:#DB3F02;font-size:1.3em;"></i></div>').appendTo('#noaa_3_month')

    confidence_interval = []
    change_from_historical = []
    array_of_Historical_Means = []
    forecast_means = []
    historical_means = []
    j = 0
    for (var i = 0; i < temp_array_selected_division.length; i++) {

        array_of_nums = temp_array_selected_division[i].map(Number)
        historical_mean = array_of_nums[19]
        confidence_interval.push([array_of_nums[6] - historical_mean, array_of_nums[16] - historical_mean])
        change_from_historical.push(array_of_nums[18] - historical_mean)
        forecast_means.push(array_of_nums[18])
        historical_means.push(historical_mean)
        //array_of_Historical_Means.push(array_of_nums[19])
        j += 1
    }

    precip_confidence_interval = []
    precip_change_from_historical = []
    precip_array_of_Historical_Means = []
    precip_forecast_means = []
    precip_historical_means = []
    j = 0

    for (var i = 0; i < precip_array_selected_division.length; i++) {

        precip_array_of_nums = precip_array_selected_division[i].map(Number)
        precip_historical_mean = precip_array_of_nums[19]
        precip_confidence_interval.push([precip_array_of_nums[6] - precip_historical_mean, precip_array_of_nums[16] - precip_historical_mean])
        precip_change_from_historical.push(precip_array_of_nums[18] - precip_historical_mean)
        precip_forecast_means.push(precip_array_of_nums[18])
        precip_historical_means.push(precip_historical_mean)
        //array_of_Historical_Means.push(array_of_nums[19])
        j += 1
    }

	$(function () {
    $('#noaa_3_month').highcharts({
        chart: {
            type:'spline',
            height:'500',
            width:'430',
            marginTop:'20',
            alignTicks: false,
            marginLeft:80,
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
            categories:
                ['Nov-Dec-Jan 15-16', 'Dec-Jan-Feb 15-16', 'Jan-Feb-Mar 2016', 'Feb-Mar-Apr 2016', 'Mar-Apr-May 2016', 'Apr-May-Jun 2016', 'May-Jun-Jul 2016', 'Jun-Jul-Aug 2016', 'Jul-Aug-Sep 2016', 'Aug-Sep-Oct 2016', 'Sep-Oct-Nov 2016', 'Oct-Nov-Dec 2016', 'Nov-Dec-Jan 16-17']
        },
        yAxis: [{
            gridLineWidth: 0,
            endontick:false,
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
                text: 'Degrees (F)'
            },
            endontick:false,
            showEmpty: false,
            plotLines: [{
                value: 0,
                width: 1,
                //color: '#808080'
            }],
            opposite:true
        },
        {
            title: {
                text: 'Precipitation (in)'
            },
            endontick:false,
            showEmpty: false,
            plotLines: [{
                value: 0,
                width: 1,
                //color: '#808080'
            }],
            opposite:true
        },
        ],
        tooltip: {
            valueDecimals: 2,
            valueSuffix: 'F',
            crosshairs: true,
            shared: true,
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
                //name: 'Avg Max Temp',
                name: 'Historical Mean',
                type:'spline',
                data: array_of_Historical_Means,
                color: '#D8D8D8'
            },
            */
            {
                //name: 'Avg Max Temp',
                name: 'Change from the Historical Mean',
                type:'spline',
                  marker: {
                      symbol:'triangle'
                  },
                zIndex:1,
                data: change_from_historical,
                color: '#DB3F02'
            },
            {
                name: '90% Confidence Interval',
                type: 'areasplinerange',
                //linkedTo: ':previous',
                visible:false,
                lineWidth: 0,
                fillOpacity: 0.3,
                //type: 'spline',
                color: '#FEBAA0',
                zIndex: 0,
                data: confidence_interval

                //[[53, 63], [44, 54], [49, 59], [50, 59], [53,64], [60, 69], [66, 78]]
            },
            /*

            {
                //name: 'Avg Max Temp',
                name: 'Forecast Mean',
                type:'spline',
                zIndex:3,
                visible:false,
                yAxis:1,
                data: forecast_means,
                color: '#F8981D'
            },
            {
                //name: 'Avg Max Temp',
                name: 'Historical Mean',
                type:'spline',
                zIndex:2,
                visible:false,
                yAxis:1,
                data: historical_means,
                color: '#9E9E9E'
            },
            */
               {
                            //name: 'Avg Max Temp',
                            name: 'Change from the Historical Mean',
                            type:'spline',
                              marker: {
                                  symbol:'triangle'
                              },
                            zIndex:1,
                            data: precip_change_from_historical,
                            yAxis:2,
                            color: '#4575B5'
                            },
                            {
                            name: '90% Confidence Interval',
                            type: 'areasplinerange',
                            visible:false,
                            //linkedTo: ':previous',
                            lineWidth: 0,
                            fillOpacity: 0.3,
                            //type: 'spline',
                            color: '#B3C7E1',
                            zIndex: 0,
                            data: precip_confidence_interval

                            //[[53, 63], [44, 54], [49, 59], [50, 59], [53,64], [60, 69], [66, 78]]
                            },

            /*
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
