function createAreaChart(model,updateSource) {

    if (typeof pngCloverYear == "undefined"){
        pngCloverYear = 58804
    }

    //Initilization year for slider
    if (typeof vegCompositionSliderStartYear == 'undefined'){
        vegCompositionSliderStartYear=2001
    }

    splitTableName=model.split("_")
    actualModelName=splitTableName[splitTableName.length-1]


    years=_.range(2011,2101,10)

    $(function () {
        $('#area_chart').highcharts({
            chart: {
                type: 'areaspline',
                width: 440,
                height:360,
                marginLeft: 40,
                marginRight: 30,
                marginTop:10,
                backgroundColor:'rgba(255, 255, 255, 0.1)'
                /*screws up placement of legend in chrome. */
                /*marginBottom:150*/
            },
            title: {
                text: ''
            },
            credits: {
                enabled:false
            },
            legend: {
                width: 460,
                itemWidth: 230,
                x:57,
                margin:25,
                /*
                align:'right',
                verticalAlign:'top',
                layout: 'vertical',
                */
                opacity:.85,
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: years,
                tickmarkPlacement: 'on',
                title: {
                    text:'<div id="vegMapSlider"></div>',
                    useHTML:true
                }
            },
            yAxis: {
                title: {
                    text: 'Percent'
                },
                labels: {
                    formatter: function () {
                        return this.value + '%';
                    }
                }
            },
            tooltip: {
                zIndex:9999999,
                //pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f} km<sup>2</sup>)<br/>',
                backgroundColor: "rgba(255,255,255,1)",
                borderWidth:0,
                shadow:false,
                shared: true,
                useHTML:true,
                style: {
                    padding: 0,
                    border:0
                },
                formatter: function () {
                    var points = this.points;
                    var pointsLength = points.length;
                    var tooltipMarkup = '<div id="areaChartTooltipContainer">';
                    tooltipMarkup += pointsLength ? '<span style="font-size: 10px">' + points[0].key + '</span><br/>' : '';
                    var index;
                    var y_value;

                    for(index = 0; index < pointsLength; index += 1) {
                        //For actual value: y_value = (points[index].y)
                        y_value = (points[index].percentage).toFixed(0);

                        if (y_value > 0) {
                            tooltipMarkup += '<span style="color:' + points[index].series.color + '">\u25CF</span> ' + points[index].series.name + ': <b>' + y_value + '%</b><br/>';
                        }
                    }
                   tooltipMarkup += '</div>';

                   return tooltipMarkup;
                }
            },
            plotOptions: {
                areaspline: {
                    stacking: 'percent',
                    lineColor: '#ffffff',
                    lineWidth: 0,
                    fillOpacity:1,
                    marker: {
                        lineWidth: 0,
                        lineColor: '#ffffff'
                    },
                },
                 series: {
                    cursor: 'pointer',
                    marker: {
                        enabled: false
                    },
                     /*
                      events: {
                        mouseOver: function() {
                          var layerToAddName = this.x;
                          console.log(layerToAddName)
                          swapImageOverlay("a0pets0t2");
                        }
                      }
                      */
                }
            },
        });
    });

    areaChart=$('#area_chart').highcharts();

    //veg_classes=['a','b','c','d','e']
    //years=['1750', '1800', '1850', '1900', '1950', '1999', '2050'],
    //years=Array.apply(null, {length: 30}).map(Number.call, Number)

    ecosystem_services_data = null

    var vtype_db_table=ecosystemServicesParams[activeReportingUnitsName]["vtypeTables"][model];

    if (typeof response.ecosystem_service_data != "undefined") {
        ecosystem_services_data = JSON.parse(response.ecosystem_services_data);
        var data_for_chart = ecosystem_services_data["vegetation_composition"][vtype_db_table];
    }

    function lookup(key) {
        switch (key) {
            case 'value_0':
                var veg_type = 'undefined';
                color='gray';
                break;
            case 'value_1':
                var veg_type = 'Taiga/Tundra'
                color='#CCCCFF';
                break;
            case 'value_2':
                var veg_type = 'Conifer Forest'
                color='#006633';
                break;
            case 'value_3':
                var veg_type = 'Mixed Forest'
                color='#7FBF7B';
                break;
            case 'value_4':
                var veg_type = 'Broadleaf Forest'
                color='#48F748';
                break;
            case 'value_5':
                var veg_type = 'Shrubland/Woodland/Savanna'
                color='#996633';
                break;
            case 'value_6':
                var veg_type = 'Grassland'
                color='#FFFF00';
                break;
            case 'value_7':
                var veg_type = 'Arid Land'
                color='#FF0000';
                break;
            case 'value_8':
                var veg_type = 'Annual Agriculture'
                color='#FFBF71';
                break;
            case 'value_9':
                var veg_type = 'Perennial Agriculture'
                color='#FF8C00';
                break;
            case 'value_10':
                var veg_type = 'Developed/Mined'
                color='#2D2D2D';
                break;
            default :
                var veg_type = 'other'
        }
        return [veg_type,color]
    }

    for (var key in data_for_chart) {
        var veg_name=lookup(key)[0]
        var veg_color=lookup(key)[1]
        var ArrayData = $.map(data_for_chart[key].split(','), function(value){
        return parseInt(value, 10);
            // or return +value; which handles float values as well
        });
        areaChart.addSeries({
            name: veg_name,
            color: veg_color,
            data: ArrayData,
            lineWidth:0,
            stacking: 'percent',
            point: {
                events: {
                    mouseOver: function() {
                        layerToAddName = "VTYPE_" + actualModelName + "_" + years[this.x]; // onclick get the x index and use it to find the URL
                        vegClassName = this.series.userOptions.name; // onclick get the modelName (used in leaflet_map.js to get the Data Basin layer index)
                        //console.log(layerToAddName)
                        //swapImageOverlay(layerToAddName)
                        //swapLegend(layerToAddName, null, "Veg","Veg")
                    },
                }
            }
        })
    }


    if (updateSource != "mapClick") {
            swapImageOverlay("vtype_agg_" + actualModelName + "__" + pngCloverYear, "EcosystemServices")
    }

    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var startDate = new Date(1850,01,1);

    $(function() {
        $( "#vegMapSlider" ).slider({
          value:vegCompositionSliderStartYear,
          min: 2011,
          max: 2091,
          step: 10,
          slide: function( event, ui ) {
            vegCompositionSliderStartYear=ui.value
            $( "#amount" ).val( "$" + ui.value );
            document.getElementsByClassName('info legend leaflet-control')[0].innerHTML=''
            //Or whatever is decided for off
            if (ui.value==2001){
                swapImageOverlay("single_transparent_pixel")
            }
            else {
                //Date in png Name is days since 1850
                var endDate = new Date(ui.value, 01, 1);
                pngCloverYear = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / (oneDay)));
                swapImageOverlay("vtype_agg_" + actualModelName +"__"+ pngCloverYear, "EcosystemServices")
            }
          }
        });
        //$( "#amount" ).val( "$" + $( "#slider" ).slider( "value" ) );
  });


}

//array to store the setTimeout functions for each year. Needed since JS is single threaded. Need to destroy the [] on stop button push.
var timeouts = [];
var datePause = 2011
var delayTime = 1000
function animateMap(){
    var dateRange=_.range(datePause,2101,10)
    var startDate = new Date(1850,01,1);
    $.each(dateRange, function(index, currentYear){
        timeouts.push(setTimeout(function () {
            datePause = currentYear
            endDate = new Date(currentYear, 01, 1);
            pngCloverYear = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / (86400000)));
            swapImageOverlay("vtype_agg_" + actualModelName + "__" + pngCloverYear, "EcosystemServices")
            $("#vegMapSlider").slider('value', currentYear);
            //Last year. Restart
            if (index == dateRange.length - 1) {
                datePause = 2011
                animateMap()
            }
        }, (index + 1) * delayTime));
    })
}

$(function() {
     //Mouse over and click functions on the start/stop buttons.

     $('#startDiv2').on({
         mouseover: function(){
             $(this).css('background-image', 'url(' + static_url + 'img/start_hover.png');
         },
         mouseleave: function(){
             $(this).css('background-image', 'url(' + static_url + 'img/start.png');
         },
         click: function(){
             $(this).off('mouseleave');
             $(this).css('background-image', 'url(' + static_url + 'img/start_hover.png');
             $('#stopDiv2').css('background-image', 'url(' + static_url + 'img/stop.png');
         }
     });

     $('#stopDiv2').on({
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
             $('#startDiv2').css('background-image', 'url(' + static_url + 'img/start.png');
             //Need this in order to make the mouseout work on the start button again for some reason.
             $('#startDiv2').on({
                 mouseleave: function(){
                     $(this).css('background-image', 'url(' + static_url + 'img/start.png');
                 }
             });
         }
     });
 });

