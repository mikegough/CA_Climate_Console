function createNoaa3Month(temp_array_selected_division, precip_array_selected_division) {
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
        groupingUnits = [[
                'week',                         // unit name
                [1]                             // allowed multiples
            ], [
                'month',
                [1, 2, 3, 4, 6]
            ]],


	$(function () {
    $('#noaa_3_month').highcharts({
        chart: {
            type:'spline',
            height:'370',
            width:'430',
            marginTop:'20',
            alignTicks: false,
            marginLeft:60,
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
            labels: {
                enabled: false,
            },
            categories: ['Nov-Dec-Jan 15-16', 'Dec-Jan-Feb 15-16', 'Jan-Feb-Mar 2016', 'Feb-Mar-Apr 2016', 'Mar-Apr-May 2016', 'Apr-May-Jun 2016', 'May-Jun-Jul 2016', 'Jun-Jul-Aug 2016', 'Jul-Aug-Sep 2016', 'Aug-Sep-Oct 2016', 'Sep-Oct-Nov 2016', 'Oct-Nov-Dec 2016', 'Nov-Dec-Jan 16-17']
        },
        yAxis: [{
            title: {
                text: 'Forecasted Change (F)'
            },
            tickInterval:5,
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            endontick:false,
            showEmpty: false,
            plotLines: [{
                value: 0,
                width: 1,
                //color: '#808080'
            }],
            top: 20,
            height: 120,
            offset: 0,
            lineWidth: 2,
            opposite:false,
            plotLines: [{
                        color:'#D8D8D8',
                        width: 1,
                        value: 0
                    }]
        },
        {
            title: {
                text: 'Forecasted Change (in)'
            },
            tickInterval:5,
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            endontick:false,
            showEmpty: false,
            plotLines: [{
                value: 0,
                width: 1,
                //color: '#808080'
            }],
            opposite:false,
            top: 170,
            height: 120,
            offset: 0,
            lineWidth: 2,
            plotLines: [{
                    color:'#D8D8D8',
                    width: 1,
                    value: 0
                }]
        },
        ],
         tooltip: {
             shared:true,
             valueDecimals: 2,
             crosshairs:true,
             style : { opacity: 0.8 },
             /*
             positioner: function () {
                 return {
                     //x: this.chart.chartWidth - this.label.width, // right aligned
                     x: 100,
                     y: 150 // align to title
                 };
             },
             */
             useHTML: true,
             formatter: function () {

                 //enableMouseTracking is disabled for the confidence intervals, so the lines are always point[0] and point[1]
                 var points = this.points;
                 var pointsLength = points.length;
                 var tooltipMarkup = pointsLength ? '<span style="font-size: 10px">' + points[0].key + '</span><br/>' : '';
                 var tooltipMarkup = points[0].key;

                 function format_arrow(value) {

                            var direction

                            if (value > 0) {
                                direction = "0"
                            }

                            else if (value == 0) {
                                direction = "0"
                            }

                            else if (value < 0) {
                                direction = "180"
                            }
                            var style=[direction]
                            return style
                        }


                     var tempStyle=format_arrow(points[0].y)
                     tooltipMarkup += "<br> &nbsp;<i class='wi wi-thermometer' style='color:#DB3F02;font-size:1.5em;'></i> &nbsp; <i style='color:" + "#DB3F02" + ";position:relative; top: 4px; font-size:2.5em;' class='wi wi-rotate-" + tempStyle[0] + " wi-direction-up'></i> "  + points[0].y.toFixed(2) + "&deg;F"

                     var precipStyle=format_arrow(points[1].y)
                     tooltipMarkup += "<br><i class='wi wi-rain-mix' style='color: #4575B5;font-size:1.5em;'></i> <i style='color:" + "#4575B5" + ";position:relative; top: 4px; font-size:2.5em;' class='wi wi-rotate-" + precipStyle[0] + " wi-direction-up'></i> "  + points[1].y.toFixed(2) + ".in"
                       // '<span style="color:' + points[index].series.color + '">\u25CF</span> ' + points[index].series.name + ': <b>' + y_value_kwh  + ' kWh</b><br/>';

                  return tooltipMarkup;

                  }
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
            {
                //name: 'Avg Max Temp',
                name: 'Forecast Mean',
                cursor:'pointer',
                type:'spline',
                  marker: {
                      symbol:'triangle'
                  },
                zIndex:1,
                data: change_from_historical,
                color: '#DB3F02',
                showInLegend:true,
                point: {
                            events: {
                                click: function() {
                                    thisPoint=this.index+1
                                    $("input:radio[name=period][value="+thisPoint+"]").trigger('click');
                                    $("input:radio[name=nearTermMapVariable][value='temp']").trigger('click');
                                }
                            }
                        },
                 events: {
                    legendItemClick: function () {
                    return false; // <== Disable otherwise points won't align properly
                    }
                },
            },
            {
                name: '90% Confidence Interval',
                type: 'areasplinerange',
                //linkedTo: ':previous',
                visible:true,
                lineWidth: 0,
                fillOpacity: 0.3,
                //type: 'spline',
                color: '#FEBAA0',
                showInLegend:true,
                zIndex: 0,
                data: confidence_interval,
                //prevent from being indexed in the tooltip
                enableMouseTracking: false

                //[[53, 63], [44, 54], [49, 59], [50, 59], [53,64], [60, 69], [66, 78]]
            },
           {

               name: 'Forecast Mean',
               cursor:'pointer',
               type:'spline',
                marker: {
                      symbol:'triangle'
                },
               zIndex:1,
               data: precip_change_from_historical,
               yAxis:1,
               color: '#4575B5',
               showInLegend:true,
               point: {
                            events: {
                                click: function() {
                                    thisPoint=this.index+1
                                    $("input:radio[name=period][value="+thisPoint+"]").trigger('click');
                                    $("input:radio[name=nearTermMapVariable][value='precip']").trigger('click');
                                }
                            }
                        },
                events: {
                    legendItemClick: function () {
                    return false; // <== Disable otherwise points won't align properly
                    }
                },
            },
            {
                name: '90% Confidence Interval',
                type: 'areasplinerange',
                visible:true,
                //linkedTo: ':previous',
                lineWidth: 0,
                fillOpacity: 0.3,
                //type: 'spline',
                color: '#B3C7E1',
                showInLegend:true,
                zIndex: 0,
                yAxis:1,
                data: precip_confidence_interval,
                //prevent from being indexed in the tooltip
                enableMouseTracking: false

                //[[53, 63], [44, 54], [49, 59], [50, 59], [53,64], [60, 69], [66, 78]]
            },

        ]
    });

    createVerticalMonthLine(selectedNearTermClimatePeriod-1)

});


}

function createVerticalMonthLine(lead) {

    noaa_3_month_chart = $('#noaa_3_month').highcharts();

    noaa_3_month_chart.xAxis[0].removePlotLine('plot-line-1');

        noaa_3_month_chart.xAxis[0].addPlotLine({
            value: lead,
            color: 'rgba(61,140,0,0.2)',
            width: 3,
            id: 'plot-line-1'
        });

}
