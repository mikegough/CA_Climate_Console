function createSplineChart(model) {

    var modified_model_name=model.replace("_vtype_","_")
    var years = _.range(2011, 2101, 10)

    var ecosystem_services_data=JSON.parse(response.ecosystem_services_data)

    var c_ecosys_data_string = ecosystem_services_data["continuous7"][modified_model_name]["c_ecosys"]
    var nbp_data_string = ecosystem_services_data["continuous7"][modified_model_name]["nbp"]

    var c_ecosys_data = $.map(c_ecosys_data_string.split(','), function(value){
        return parseInt(value, 10);
            // or return +value; which handles float values as well
    });

    var nbp_data = $.map(nbp_data_string.split(','), function(value){
        return parseInt(value, 10);
    });

    $(function () {

        //This formats numbers in the tooltip with a comma separator.
        Highcharts.setOptions({
		lang: {
			thousandsSep: ','
		}});

        $('#spline_chart').highcharts({
            chart: {
                zoomType: 'xy',
                width: 460,
                height:290,
                marginTop:30,
                marginLeft:70,
            },
            title: {
                text: ''
            },
            credits: {
                enabled:false
            },
            exporting: {
            buttons: {
                contextButton: {
                    align: 'right',
                    x:0,
                    y:-13,
                    }
                }
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories:years,
                tickmarkPlacement: 'on',
                title: {
                    enabled: false
                },
                //crosshair: true,
                options : {
                    minPadding: 0,
                    maxPadding: 0,
                    startOnTick: true,
                    endOnTick:true
                 },
                labels: {
                    reserveSpace:false,
                    enabled: true,
                    rotation: 0,
                }
            },
            yAxis: [{ // Primary yAxis left hand side
                labels: {
                    format: '{value}',
                    style: {
                        //Green
                        color:'#008040',
                    },
                },
                title: {
                    text: 'gC/m2',
                    x:10,
                    style: {
                        //Green
                        color:'#008040',
                    },
                },

            }, { // Secondary yAxis, right hand side (opposite = true)
                opposite: true,
                gridLineWidth: 0,
                labels: {
                    x:5,
                    format: '{value}',
                    style: {
                        color:'#6A4F33',
                    }
                },
                title: {
                    text: '',
                },

            },

              /*  { // Tertiary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Sea-Level Pressure',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                labels: {
                    format: '{value} mb',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                opposite: true
            }*/

            ],
            tooltip: {
                shared: true
            },
            legend: {
                /*
                layout: 'vertical',
                align: 'left',
                x: 80,
                verticalAlign: 'top',
                y: 55,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                */
            },
            series: [
            /*
            {
                name: 'Rainfall',
                type: 'column',
                yAxis: 1,
                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
                tooltip: {
                    valueSuffix: ' mm'
                }

            }*/
            {
                name: 'Net Biological Production',
                type: 'spline',
                color:'#008040',
                data: nbp_data,
                tooltip: {
                    valueSuffix: ' gC/m2'
                }
            }, {
                name: 'Total Ecosystem Carbon',
                type: 'spline',
                yAxis: 1,
                color:'#6A4F33',
                data: c_ecosys_data,
                marker: {
                    enabled: false,
                },
                dashStyle: 'shortdot',
                lineWidth:3,
                tooltip: {
                    valueSuffix: ' gC/m2'
                }

            }]
        });
    });
}
