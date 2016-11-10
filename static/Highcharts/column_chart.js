var attributes =[]
for (EEMSModel in EEMSParams["models"]){
    var imageToOverlay=EEMSParams['models'][EEMSModel][6].replace(".eem","") + "_" + EEMSParams['models'][EEMSModel][7];
    attributes.push("<span class='highChartsXaxisText'><span title='Click to toggle this layer on/off in the map' onclick='initialize_tree(&quot;" + EEMSModel +"&quot;)'>"+EEMSParams['models'][EEMSModel][1]+"</span> <div title='Click to view information about this model' class='info_icon' onClick=showInfoPopup('"+EEMSModel+"')> </div></span>");
}

function createColumnChart(){

    valuesToPlot=[]
    layersToAddNames=[]

    for (EEMSModel in EEMSParams["models"]){
        if (typeof resultsJSON[EEMSModel+"_avg"] != 'undefined') {
            valuesToPlot.push(resultsJSON[EEMSModel + "_avg"])
        }
        layersToAddNames.push(EEMSModel)
    }
    if (valuesToPlot.length == 0) {
        valuesToPlot = [0, 0, 0, 0, 0]
    }

    var minVal = -1;
    var maxVal = 1;

    columnChartColors=columnChartColorsCSV.split(',')

    $(function () {
        $('#column_chart').highcharts({
              chart: {
                    type: 'column',
                    /*
                    width:477,
                    */
                    width:445,
                    height:400,
                    marginRight:35,
                    marginBottom:200

                },
                credits: {
                    enabled: false
                },

                exporting: {
                    enabled:true,
                    allowHTML:true,
                    filename:activeReportingUnitsName+ "_" + response['categoricalValues'] + "_" + "EEMS_Model_Results",
                    chartOptions: {
                        chart:{
                            height:500,
                            width:600,
                            margin:100,
                            marginBottom:180,
                            marginLeft:140,
                        },
                        legend: {
                            y:-10
                        },
                        title: {
                            margin:20,
                            text: "<br>"+activeReportingUnitsName + ": " + response['categoricalValues'],
                        },
                        subtitle: {
                            text: "<br>EEMS Model Results<br>",
                            margin:20,
                            marginBottom:100,
                        },
                        credits: {
                            enabled:true,
                            allowHTML:true,
                            marginBottom:100,
                            margin:10,
                            style: {
                                padding: '20px',
                            },
                            position: {
                                align: 'center',
                                y:-10,
                            },
                            text: "Source: " + title + " Climate Console, " +  currentYear + " Conservation Biology Institute",
                        },
                    }
                },
                title: {

                    text: ' ',
                    margin: 15,

                },
                subtitle: {
                    //text: '511574.7544' + 'N , ' + 'E3849223.0376' + 'E, UTM 11N, NAD83'
                },

                xAxis: {
                    maxPadding:0,
                    endOnTick: true,
                    x:0,
                    y:0,
                    margin:0,
                    //Set attribute values above.
                    categories: attributes,
                    labels: {
                       rotation: -45,
                       style: { fontSize: '11px', fontWeight: 'normal', textAlign: 'left', cursor: 'pointer', textOverflow:'none'},
                       staggerLines:1,
                       //fix for overlapping labels
                       //useHTML:false
                       useHTML:true
                    }
                },

                yAxis: {
                    tickInterval:.25,
                    min: minVal,
                    max: maxVal,
                    title: {
                        text: ''
                    },
                    labels: {
                       formatter: function () {
                            //Hack to get the "Very Low" label to display
                            //if (this.value < -.9) { return yBottomLabel }
                            //else { return yLabels[this.value]}

                           if (this.value > .75) {return "Highest (+1)"}
                           if (this.value > .5) {return "Very High"}
                           if (this.value > .25) {return "High"}
                           if (this.value > 0) {return ""}
                           if (this.value == 0) { return "Moderate (0)"}
                           if (this.value > -.499999) {return ""}
                           if (this.value > -.749999) {return "Low"}
                           if (this.value > -1.000) {return "Very Low"}
                           else { return "Lowest (-1)"}
                        },
                        style: {
                            fontSize:"11px",
                        }
                    }
                },
               tooltip: {
                   useHTML:true,
                   backgroundColor: '#E9E6E0',
                   borderWidth: 1,
                   shadow: true,
                   margin:0,
                   //fix for x-axis label on top:
                   style: {
                    padding: 1,
                    },
                   hideDelay:0,
                  // pointFormat: '<span style="font-size:14px"><b>{point.y}</b> </span>' + valueSuffix + '<br><i>(Click to Map)</i>',

                   formatter: function() {
                        return "<div class='columnChartTooltip'>" +
                        this.key.replace(/\s*\<.*?\>\s*/g, '') +
                        '<br><span style="font-size:14px"><b>'+ this.point.y + '</b> </span><br><i>(Click to Map)</i></div>'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding:.1,
                        borderWidth: 1,
                        colors: columnChartColors
                    },
                    series: {
                        pointWidth: 31,
                        colorByPoint:true,
                        shadow:false,
                        borderColor: '#444444'
                    },
                    dataLabels: {
                        useHTML:true,
                    }
                },

                legend: {
                    enabled: false
                },

                series: [{
                    name: ' ',
                    layersToAdd:layersToAddNames,
                    data: valuesToPlot,
                    cursor: 'pointer',
                    point: {
                            events: {
                                click: function() {
                                    var layerToAdd = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL

                                    //Update MEEMSE2.0 values
                                    //Clear out the div containing the model diagram
                                    initialize_tree(layerToAdd)

                                    // Workaround to getting the last bar clicked to show up on top
                                    // Simply remove the other ones if they're in the map.

                                    var i = 0;
                                    while (i <= 4){
                                        layerToRemove = this.series.userOptions.layersToAdd[i]
                                        if (i != this.x){
                                                if (map.hasLayer(layerToRemove)){
                                                    map.removeLayer(layerToRemove)
                                                }
                                            }
                                        i+=1
                                    }
                                    // End Workaround

                                }
                            }
                    },
                    allowPointSelect: false,
                        states: {
                            select: {
                                color:'#444444',
                                borderWidth: 4,
                                borderColor:'#00FFFF',
                            }
                        }
                }]
            });
    });

}

function initialize_tree(layerToAdd){

    modelForTree=layerToAdd

    eems_file_name=EEMSParams['models'][modelForTree][6]
    top_node=EEMSParams['models'][modelForTree][7]

    $('#infovis').html('')
    $('#MEEMSE_node_count_legend').css("visibility","visible")

    $.ajax({
        url: "generate_eems_tree", // the endpoint (for a specific view configured in urls.conf /view_name/)
        //Webfactional
        //url : "/enerate_eems_tree", // the endpoint
        async: false,
        type: "POST", // http method
        data: {eems_file_name: eems_file_name, top_node: top_node},

        success: function (results) {
            response=JSON.parse(results)
            json=response['eems_tree_dict']
            top_node=response['top_node']
            init()
            if (typeof modelForTree != 'undefined'){
                 //swapImageOverlay(layerToAdd,'EEMSmodel')
                 //swapLegend(layerToAdd, layerToAdd, 'EEMSmodel')
                 eems_node_image_name=eems_file_name.replace(".eem","")+"_" + top_node
                 eems_node_legend_name=eems_file_name.replace(".eem","")+"_" + "Legend"
                 swapImageOverlay(eems_node_image_name,'EEMSmodel')
                 swapLegend(layerToAdd, eems_node_image_name, 'EEMSmodel')
            }
        }
    });
}
