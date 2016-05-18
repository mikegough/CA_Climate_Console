function createSplineChart(model) {

    modified_model_name=model.replace("_vtype_","_").replace("hadgem2es","hadgem2_es").replace("cnrmcm5","cnrm_cm5")
    years = _.range(2011, 2101, 10)

    ecosystem_services_data=JSON.parse(response.ecosystem_services_data)

    c_ecosys_data_string = ecosystem_services_data["continuous7"][modified_model_name]["c_ecosys"]
    nbp_data_string = ecosystem_services_data["continuous7"][modified_model_name]["nbp"]

    c_ecosys_data = $.map(c_ecosys_data_string.split(','), function(value){
        return parseInt(value, 10);
            // or return +value; which handles float values as well
    });

    nbp_data = $.map(nbp_data_string.split(','), function(value){
        return parseInt(value, 10);
        // or return +value; which handles float values as well
    });

    $(function () {
        $('#spline_chart').highcharts({
            chart: {
                zoomType: 'xy',
                width: 440,
                height:320,
                marginTop:40,
            },
            title: {
                text: ''
            },
            credits: {
                enabled:false
            },
            exporting: {
            buttons: {
                exportButton: {
                    align: 'right',
                    x: 40
                }
                }
            },
            subtitle: {
                text: ''
            },
            xAxis: [{
                categories:years,
                tickmarkPlacement: 'on',
                title: {
                    enabled: false
                },
                crosshair: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value} gC/m<sup>2</sup>',
                    style: {
                        //Green
                        color:'#1A5336',
                    }
                },
                title: {
                    text: '',
                },

            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: '',
                },
                labels: {
                    format: '{value} gC/m<sup>2</sup>',
                    style: {
                        color:'#6A4F33',
                    }
                },
                opposite: true

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
                color:'#206844',
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
                tooltip: {
                    valueSuffix: ' gC/m2'
                }

            }]
        });
    });
}
