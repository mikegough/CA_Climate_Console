function createNoaa3Month(temp_array_selected_division, precip_array_selected_division) {

    /*
     Syncronized charts linked through DOM and Highcharts events and API methods. It takes a standard Highcharts config with a
     small variation for each data set, and a mouse/touch event handler to bind the charts together.
    */

    // Need to destroy earlier charts to prevent a memory leak?
    // Charts on the first tab are 2 & 3
    //chart_keys = Object.keys(Highcharts.charts)

    chart_count=Highcharts.charts.length
    Highcharts.charts.splice([chart_count-2],2)

    //dates=dates.slice(0,90)

    $('#noaa_3_month').empty()

    $('<div class="nearTermHeader">Temperature Forecast <i class="wi wi-thermometer" style="color:#DB3F02;font-size:1.3em;"></i></div>').appendTo('#noaa_3_month')

    $(function () {

        var confidence_interval = []
        var change_from_historical = []
        var array_of_Historical_Means = []
        var forecast_means = []
        var historical_means = []
        var j = 0
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

        var precip_confidence_interval = []
        var precip_change_from_historical = []
        var precip_array_of_Historical_Means = []
        var precip_forecast_means = []
        var precip_historical_means = []
        var j = 0

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


        $('#noaa_3_month').bind('mousemove touchmove', function (e) {
            var point,
                i;

            //Starting at 0 caused needless loops, since those aren't being displayed
            //for (i = 0; i < Highcharts.charts.length; i = i + 1) {

            for (i = Highcharts.charts.length - 2; i < Highcharts.charts.length; i = i + 1) {
                sync_chart = Highcharts.charts[i];
                e = sync_chart.pointer.normalize(e); // Find coordinates within the chart
                point = sync_chart.series[0].searchPoint(e, true); // Get the hovered point

                if (point) {
                    point.onMouseOver(); // Show the hover marker
                    sync_chart.tooltip.refresh(point); // Show the tooltip
                    sync_chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
                }
            }
        });

        /**
         * In order to synchronize tooltips and crosshairs, override the
         * built-in events with handlers defined on the parent element.
         */
         //Override the reset function, we don't need to hide the tooltips and crosshairs.
        /*
         Highcharts.Pointer.prototype.reset = function () {

                    return undefined;
       };
        */
        /*
         * Synchronize zooming through the setExtremes event handler.
        */
        function syncExtremes(e) {
            var thisChart = this.sync_chart;

            Highcharts.each(Highcharts.charts, function (sync_chart) {
                if (sync_chart !== thisChart) {
                    if (sync_chart.xAxis[0].setExtremes) { // It is null while updating
                        sync_chart.xAxis[0].setExtremes(e.min, e.max);
                    }
                }
            });
        }

        $('<div class="sync_chart">')
            .appendTo('#noaa_3_month')

            .highcharts({
                chart: {
                    width: '430',
                    //height:'350',
                    marginTop: '20',
                    alignTicks: false,
                    marginLeft: 60, // Keep all charts left aligned
                    spacingTop: 20,
                    spacingBottom: 20,
                    // zoomType: 'x',
                    // pinchType: null // Disable zoom on touch devices
                },
                exporting: {
                    enabled: false
                },
                title: {
                    text: '',
                    align: 'left',
                    margin: 0,
                    x: 30
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: true
                },
                xAxis: {
                    crosshair: true,
                    useHTML: true,
                    crosshair: {
                        color: "#F4F4F4"
                    },
                    categories: //['Nov-Dec-Jan 15-16', 'Dec-Jan-Feb 15-16', 'Jan-Feb-Mar 2016', 'Feb-Mar-Apr 2016', 'Mar-Apr-May 2016', 'Apr-May-Jun 2016', 'May-Jun-Jul 2016', 'Jun-Jul-Aug 2016', 'Jul-Aug-Sep 2016', 'Aug-Sep-Oct 2016', 'Sep-Oct-Nov 2016', 'Oct-Nov-Dec 2016', 'Nov-Dec-Jan 16-17'],
                    //['Nov<br>Dec<br>Jan', 'Dec<br>Jan<br>Feb', 'Jan<br>Feb<br>Mar', 'Feb<br>Mar<br>Apr', 'Mar<br>Apr<br>May', 'Apr<br>May<br>Jun', 'May<br>Jun<br>Jul', 'Jun<br>Jul<br>Aug ', 'Jul<br>Aug<br>Sep ', 'Aug<br>Sep<br>Oct ', 'Sep<br>Oct<br>Nov ', 'Oct<br>Nov<br>Dec ', 'Nov<br>Dec<br>Jan <br>'],
                    //['Nov-Dec-Jan', 'Dec-Jan-Feb', 'Jan-Feb-Mar', 'Feb-Mar-Apr', 'Mar-Apr-May', 'Apr-May-Jun', 'May-Jun-Jul', 'Jun-Jul-Aug', 'Jul-Aug-Sep', 'Aug-Sep-Oct', 'Sep-Oct-Nov', 'Oct-Nov-Dec', 'Nov-Dec-Jan'],
                        ['Nov-Dec-Jan (15-16)', 'Dec-Jan-Feb (15-16)', 'Jan-Feb-Mar (2016)', 'Feb-Mar-Apr (2016)', 'Mar-Apr-May (2016)', 'Apr-May-Jun (2016)', 'May-Jun-Jul (2016)', 'Jun-Jul-Aug (2016)', 'Jul-Aug-Sep (2016)', 'Aug-Sep-Oct (2016)', 'Sep-Oct-Nov (2016)', 'Oct-Nov-Dec (2016)', 'Nov-Dec-Jan (16-17)'],
                    events: {
                        setExtremes: syncExtremes
                    },
                    labels: {
                        enabled: true,
                        rotation: -60,
                        format: '{value}'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Degrees (F)'
                    },
                    showEmpty: false,
                },
                tooltip: {
                     positioner: function () {
                         return {
                             x: this.chart.chartWidth - this.label.width, // right aligned
                             y: 0 // align to title
                         };
                     },
                    useHTML: true,
                    formatter: function(){
                        function format_arrow(value) {

                            var direction,color

                            if (value > 0) {
                                direction = "0"
                                color="#DB3F02"
                            }

                            else if (value == 0) {
                                direction = "0"
                                color="#EDEDED"
                            }

                            else if (value < 0) {
                                direction = "180"
                                color="#DB3F02"
                            }
                            var style=[direction,color]
                            return style
                        }

                        var style=format_arrow(this.y)

                        to_show="<span style='font-family:Lucida Grande,sans-serif; font-size:.7em'>" + this.x +"</span><br><i style='color:" + style[1] + ";position:relative; top: 3px; font-size:1.5em;' class='wi wi-rotate-" + style[0] + " wi-direction-up'></i> "+ (this.y).toFixed(2) + " &deg;F"

                        return to_show
                    },
                    style: {
                        fontSize: '16px'
                    },
                    valueDecimals: 2,
                    hideDelay: 0,
                    borderWidth: 0,
                    backgroundColor: 'none',
                    shadow: false,
                    /*
                     //headerFormat: '',
                    */
                },
                series: [

                    {
                        //name: 'Avg Max Temp',
                        name: 'Change from the Historical Mean',
                        type: 'spline',
                        marker: {
                            symbol: 'triangle'
                        },
                        zIndex: 1,
                        data: change_from_historical,
                        color: '#DB3F02'
                    },

                    {
                        name: '90% Confidence Interval',
                        type: 'areasplinerange',
                        //linkedTo: ':previous',
                        lineWidth: 0,
                        fillOpacity: 0.3,
                        //type: 'spline',
                        color: '#FEBAA0',
                        zIndex: 0,
                        data: confidence_interval
                        //[[53, 63], [44, 54], [49, 59], [50, 59], [53,64], [60, 69], [66, 78]]
                    },

                ]

            });

        $('<div class="nearTermHeader">Precipitation Forecast <i class="wi wi-rain-mix" style="color: #4575B5;font-size:1.3em;"></i></div>').appendTo('#noaa_3_month')

        $('<div class="sync_chart">')
            .appendTo('#noaa_3_month')

            .highcharts({
                chart: {
                    width: '430',
                    //height:'350',
                    marginTop: '20',
                    marginLeft: 60, // Keep all charts left aligned
                    alignTicks: false,
                    //marginLeft: 40, // Keep all charts left aligned
                    spacingTop: 20,
                    spacingBottom: 60
                    // zoomType: 'x',
                    // pinchType: null // Disable zoom on touch devices
                },
                exporting: {
                    enabled: false
                },
                title: {
                    text: '',
                    align: 'left',
                    margin: 0,
                    x: 30
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: true
                },
                xAxis: {
                    crosshair: true,
                    crosshair: {
                        color: "#F4F4F4"
                    },
                    categories: ['Nov-Dec-Jan (15-16)', 'Dec-Jan-Feb (15-16)', 'Jan-Feb-Mar (2016)', 'Feb-Mar-Apr (2016)', 'Mar-Apr-May (2016)', 'Apr-May-Jun (2016)', 'May-Jun-Jul (2016)', 'Jun-Jul-Aug (2016)', 'Jul-Aug-Sep (2016)', 'Aug-Sep-Oct (2016)', 'Sep-Oct-Nov (2016)', 'Oct-Nov-Dec (2016)', 'Nov-Dec-Jan (16-17)'],
                    //['', '', '', '', '', '', '', '', '', '', '', '', ''],
                    events: {
                        setExtremes: syncExtremes
                    },
                    labels: {
                        enabled: true,
                        rotation: -60,
                        //format: '{value}'
                        //format: ['NDJ', 'DJF', 'JFM', 'FMA', 'MAM', 'AMJ', 'MJJ', 'JJA', 'JAS', 'ASO', 'SON', 'OND', 'NDJ']
                        //format: '{value}'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Precipitation (in)'
                    }
                },
                tooltip: {
                     positioner: function () {
                         return {
                             x: this.chart.chartWidth - this.label.width, // right aligned
                             y: 0 // align to title
                         };
                     },
                    useHTML: true,
                    formatter: function(){
                        function format_arrow(value) {

                            var direction,color

                            if (value > 0) {

                                direction = "0"
                                color="#4575B5"
                            }

                            else if (value == 0) {
                                direction = "0"
                                color="#EDEDED"
                            }

                            else if (value < 0) {
                                direction = "180"
                                color="#4575B5"
                            }
                            var style=[direction,color]
                            return style
                        }

                        var style=format_arrow(this.y)

                        to_show="<span style='font-family:Lucida Grande,sans-serif; font-size:.7em'>" + this.x +"</span><br><i style='color:" + style[1] + ";position:relative; top: 3px; font-size:1.5em;' class='wi wi-rotate-" + style[0] + " wi-direction-up'></i> "+ (this.y).toFixed(2) + " in"

                        return to_show
                    },
                    //pointFormat: '{point.y} in',
                    style: {
                        fontSize: '16px'
                    },
                    valueDecimals: 2,
                    hideDelay: 0,
                    borderWidth: 0,
                    backgroundColor: 'none',
                    shadow: false,
                },
                series: [

                    {
                        //name: 'Avg Max Temp',
                        name: 'Change from the Historical Mean',
                        type: 'spline',
                        marker: {
                            symbol: 'triangle'
                        },
                        zIndex: 1,
                        data: precip_change_from_historical,
                        color: '#4575B5'
                    },
                    {
                        name: '90% Confidence Interval',
                        type: 'areasplinerange',
                        //linkedTo: ':previous',
                        lineWidth: 0,
                        fillOpacity: 0.3,
                        //type: 'spline',
                        color: '#B3C7E1',
                        zIndex: 0,
                        data: precip_confidence_interval

                        //[[53, 63], [44, 54], [49, 59], [50, 59], [53,64], [60, 69], [66, 78]]
                    },

                ]

            });


            //Hack to get the tooltips to disappear on mouseout. Definitely need to do for "chart" which is the point chart.
            numCharts = (Highcharts.charts.length) - 1

                Highcharts.Pointer.prototype.reset = function () {
                    Highcharts.charts[numCharts].tooltip.hide()
                    Highcharts.charts[numCharts - 1].tooltip.hide()
                    //point chart. Enable hide on mouseout.
                    chart.tooltip.hide()

                }
                /*
                Highcharts.charts[numCharts].pointer.__proto__.reset = function () {
                    Highcharts.charts[numCharts].tooltip.hide()
                    Highcharts.charts[numCharts - 1].tooltip.hide()
                }
                Highcharts.charts[numCharts - 1].pointer.__proto__.reset = function () {
                    Highcharts.charts[numCharts].tooltip.hide()
                    Highcharts.charts[numCharts - 1].tooltip.hide()
                }
                */
    });


}

