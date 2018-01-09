function createSplineChart(model,y1_variable,y2_variable) {

    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var startDate = new Date(1850,01,1);

    if (typeof pngCloverYearContinuous == "undefined"){
        pngCloverYearContinuous = 58804;
    }

    //Initilization year for slider
    if (typeof continuousSliderStartYear == 'undefined'){
        continuousSliderStartYear = 2001;
    }

    if (typeof continuousVariableForSlider == 'undefined'){
        continuousVariableForSlider = "c_ecosys";
    }

    var carbonColor="#5F8251";

    chartSettings = {
        variables: {
            // "MODEL Name": ["chart color", "units"]
            "c_ecosys": [carbonColor, "gC/m2"],
            "c_forest": [carbonColor, "gC/m2"],
            "nbp": [carbonColor,"gC/m2"],
            "c_dead_abo": [carbonColor,"gC/m2"],
            "consumed": ["#EA5800","gC/m2"],
            "h2o_stream": ["#146DD0","mm/year"],
            "cwd": ["#FC4E2A", "mm"],
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

    //console.log(modified_model_name)
    var continuous_db_table=ecosystemServicesParams[activeReportingUnitsName]["continuousTables"][model]

    var ecosystem_services_data=JSON.parse(response.ecosystem_services_data)

    var y1_data_string = ecosystem_services_data["continuous7"][continuous_db_table][y1_variable]
    var y2_data_string = ecosystem_services_data["continuous7"][continuous_db_table][y2_variable]

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
                width: 530,
                height: 500,
                marginTop:45,
                marginLeft:65,
                marginBottom:100,
            },
            title: {
                text: 'Click a point to map the data',
                text: '',
                style: { "color": "#666666", "fontSize": "11px" }
            },
            credits: {
                enabled:false
            },
            legend: {
                align:'center',
                margin:30,
                opacity:.85,
                y:13,
            },
            exporting: {
            buttons: {
                contextButton: {
                    align: 'right',
                    x:0,
                    y:-12,
                    x:-30,
                    }
                }
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: years,
                tickmarkPlacement: 'on',
                title: {
                    text:'<div id="continuousMapSlider"></div>',
                    useHTML:true
                },
                categories:years,
                tickmarkPlacement: 'on',
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
            ],
            tooltip: {
                shared: true
            },
            series: [
            {
                name: y1_label,
                type: 'spline',
                cursor: 'pointer',
                color: chartSettings["variables"][y1_variable][0],
                data: y1_data,
                tooltip: {
                    valueSuffix: " " + chartSettings["variables"][y1_variable][1]
                },
                point: {
                    events: {
                        click: function() {
                              var endDate = new Date(this.category, 01, 1);
                              var pngCloverYear = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / (oneDay)));
                              lastThingViewed = "continuous"
                              pngName = y1_variable + "_"  + actualModelName +"__"+ pngCloverYear
                              swapImageOverlay(pngName, "EcosystemServices")

                              var legendName  = y1_variable + "_"  + actualModelName
                              var legendTitle = y1_variable + " " + chartSettings["variables"][y1_variable][1]
                              swapLegend(legendName, null, "EcosystemServices", legendTitle)

                              continuousVariableForSlider=y1_variable
                            }
                        }
                }

            }, {
                name: y2_label,
                type: 'spline',
                cursor: 'pointer',
                yAxis: 1,
                color: chartSettings["variables"][y2_variable][0],
                data: y2_data,
                marker: {
                    enabled: true,
                },
                dashStyle: 'shortdot',
                lineWidth:3,
                tooltip: {
                    valueSuffix: " " + chartSettings["variables"][y2_variable][1]
                },
                point: {
                    events: {
                        click: function() {
                            var endDate = new Date(this.category, 01, 1);
                            var pngCloverYear = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / (oneDay)));
                            lastThingViewed = "continuous"
                            pngName = y2_variable + "_"  + actualModelName +"__"+ pngCloverYear
                            swapImageOverlay(pngName, "EcosystemServices")

                            var legendName  = y2_variable + "_"  + actualModelName
                            var legendTitle = y2_variable + " " + chartSettings["variables"][y2_variable][1]
                            swapLegend(legendName, null, "EcosystemServices", legendTitle)

                            continuousVariableForSlider=y2_variable
                        }
                    }
                }

            }]
        });
    });

    $(function() {
        $("#continuousMapSlider").slider({
            value: continuousSliderStartYear,
            min: 2011,
            max: 2091,
            step: 10,
            slide: function (event, ui) {
                continuousSliderStartYear = ui.value
                $("#amount").val("$" + ui.value);
                //Or whatever is decided for off
                if (ui.value == 2001) {
                    swapImageOverlay("single_transparent_pixel")
                }
                else {
                    //Date in png Name is days since 1850
                    var endDate = new Date(ui.value, 01, 1);
                    pngCloverYearContinuous = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / (oneDay)));
                    swapImageOverlay(continuousVariableForSlider + "_" + actualModelName + "__" + pngCloverYearContinuous, "EcosystemServices")
                    var legendName  = continuousVariableForSlider + "_"  + actualModelName
                    var legendTitle = continuousVariableForSlider + " " + chartSettings["variables"][continuousVariableForSlider][1]
                    swapLegend(legendName, null, "EcosystemServices", legendTitle)

                }
            }
        });
    });
}

//array to store the setTimeout functions for each year. Needed since JS is single threaded. Need to destroy the [] on stop button push.
var timeouts = [];
var datePause = 2011;
var delayTime = 1000;
function animateMapContinuous(){
    var dateRange=_.range(datePause,2101,10);
    var startDate = new Date(1850,01,1);
    $.each(dateRange, function(index, currentYear){
        timeouts.push(setTimeout(function () {
            datePause = currentYear
            endDate = new Date(currentYear, 01, 1);
            pngCloverYear = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / (86400000)));
            swapImageOverlay(continuousVariableForSlider + "_" + actualModelName + "__" + pngCloverYear, "EcosystemServices");

            var legendName = continuousVariableForSlider  + "_" + actualModelName;
            var legendTitle = continuousVariableForSlider + " " + chartSettings["variables"][continuousVariableForSlider][1];
            swapLegend(legendName, null, "EcosystemServices", legendTitle);

            $("#continuousMapSlider").slider('value', currentYear);
            //Last year. Restart
            if (index == dateRange.length - 1) {
                datePause = 2011;
                animateMapContinuous()
            }
        }, (index + 1) * delayTime));
    })
}

$(function() {
     //Mouse over and click functions on the start/stop buttons.

     $('#startDiv3').on({
         mouseover: function(){
             $(this).css('background-image', 'url(' + static_url + 'img/start_hover.png');
         },
         mouseleave: function(){
             $(this).css('background-image', 'url(' + static_url + 'img/start.png');
         },
         click: function(){
             $(this).off('mouseleave');
             $(this).css('background-image', 'url(' + static_url + 'img/start_hover.png');
             $('#stopDiv3').css('background-image', 'url(' + static_url + 'img/stop.png');
         }
     });

     $('#stopDiv3').on({
         mouseover: function(){
             $(this).css('background-image', 'url(' + static_url + 'img/stop_hover.png');
         },
         mouseleave: function(){
             $(this).css('background-image', 'url(' + static_url + 'img/stop.png');
         },
         click: function(){
             //Uncomment line below to make the stop button stay on after a click
             //$(this).off('mouseleave');
             $(this).css('background-image', 'url(' + static_url + 'img/stop_hover.png');
             $('#startDiv3').css('background-image', 'url(' + static_url + 'img/start.png');
             //Need this in order to make the mouseout work on the start button again for some reason.
             $('#startDiv3').on({
                 mouseleave: function(){
                     $(this).css('background-image', 'url(' + static_url + 'img/start.png');
                 }
             });
         }
     });
 });
