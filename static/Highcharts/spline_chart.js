function createSplineChart(model,y1_variable,y2_variable) {

    var carbonColor="#5A6956"
    var carbonColor="#646061"
    var carbonColor="#649B51"
    var carbonColor="#5F8251"
    chartSettings = {
        variables: {
            // "MODEL Name": ["chart color", "units"]
            "c_ecosys": [carbonColor, "gC/m2"],
            "c_forest": [carbonColor, "gC/m2"],
            "nbp": [carbonColor,"gC/m2"],
            "c_dead_abo": [carbonColor,"gC/m2"],
            "consumed": ["#EA5800","gC/m2"],
            "h2o_stream": ["#146DD0","mm"],
            "cwd": ["#146DD0", "mm"],
        }
    }

    //variable name (e.g., c_ecosys)
    y1_element = document.getElementById("y1_axis_choices")
    y2_element = document.getElementById("y2_axis_choices")

    y1_variable = y1_element.value
    y2_variable = y2_element.value

    //variable label (e.g., Total Ecosystem Carbon)
    y1_label = y1_element.options[y1_element.selectedIndex].innerHTML;
    y2_label = y2_element.options[y2_element.selectedIndex].innerHTML;

    if (typeof y1_variable == 'undefined'){
        y1_variable = "c_ecosys"
    }

    if (typeof y2_variable == 'undefined') {
        y2_variable = "consumed"
    }

    if (y2_variable == "consumed") {
        y2_color = "red"
    }
    else {
        y2_color = "#146DD0"
    }

    var modified_model_name=model.replace("_vtype_","_")
    var years = _.range(2011, 2101, 10)

    console.log(modified_model_name)

    var ecosystem_services_data=JSON.parse(response.ecosystem_services_data)

    var y1_data_string = ecosystem_services_data["continuous7"][modified_model_name][y1_variable]
    var y2_data_string = ecosystem_services_data["continuous7"][modified_model_name][y2_variable]

    var y1_data = $.map(y1_data_string.split(','), function(value){
        return parseInt(value, 10);
            // or return +value; which handles float values as well
    });

    var y2_data = $.map(y2_data_string.split(','), function(value){
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
                marginLeft:65,
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
                    x:3,
                    style: {
                        color: chartSettings["variables"][y1_variable][0],
                    },
                },
                title: {
                    text: chartSettings["variables"][y1_variable][1],
                    x:0,
                    style: {
                        // Brown
                        color: chartSettings["variables"][y1_variable][0],
                    },
                },

            }, { // Secondary yAxis, right hand side (opposite = true)
                opposite: true,
                gridLineWidth: 0,
                labels: {
                    x:0,
                    format: '{value}',
                    style: {
                        color: chartSettings["variables"][y2_variable][0],
                    }
                },
                title: {
                    text: chartSettings["variables"][y2_variable][1],
                    style: {
                        // Brown
                        color: chartSettings["variables"][y2_variable][0],
                    },
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
                name: y1_label,
                type: 'spline',
                color: chartSettings["variables"][y1_variable][0],
                data: y1_data,
                tooltip: {
                    valueSuffix: ' gC/m2'
                }
            }, {
                name: y2_label,
                type: 'spline',
                yAxis: 1,
                color: chartSettings["variables"][y2_variable][0],
                data: y2_data,
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
