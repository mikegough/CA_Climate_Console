var attributes =[]
for (EEMSModel in EEMSParams["models"]){
    attributes.push(EEMSParams['models'][EEMSModel][1])
}


function createColumnChart(){

    valuesToPlot=[]
    layersToAddNames=[]

    var cellCount=0

    for (EEMSModel in EEMSParams["models"]){
        if (typeof resultsJSON[EEMSModel+"_avg"] != 'undefined') {
            cellCount=cellCount+resultsJSON[EEMSModel+"_avg"]
        }
    }

    for (EEMSModel in EEMSParams["models"]){
        if (typeof resultsJSON[EEMSModel+"_avg"] != 'undefined') {
            //%
            valuesToPlot.push(Math.round(resultsJSON[EEMSModel + "_avg"]/cellCount * 100))
            //Acres
            //valuesToPlot.push(Math.round(resultsJSON[EEMSModel + "_avg"]* 247.1044))
        }
        layersToAddNames.push(EEMSModel)
    }

    /*
    valuesToPlot=[43,23,21,34,54,33]
    if (valuesToPlot.length == 0) {
        valuesToPlot = [0, 0, 0, 0, 0,0]
    }
    */

    //var minVal = -1;
    //var maxVal = 1;

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
                            //text: "<br>"+activeReportingUnitsName + ": " + response['categoricalValues'],
                            text: "<br>Protected Area: " + response['categoricalValues'],
                        },
                        subtitle: {
                            text: "<br>Soil Sensitivity<br>",
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
                       rotation:0,
                       style: { fontSize: '11px', fontWeight: 'normal', textAlign: 'left', cursor: 'pointer', textOverflow:'none'},
                       staggerLines:1,
                       //fix for overlapping labels
                       //useHTML:false
                       useHTML:false
                    }
                },

                yAxis: {
                    tickInterval:1,
                    //min: minVal,
                    //max: maxVal,
                    title: {
                        text: 'Percent Area (%)'
                    },
                    labels: {
                       formatter: function () {
                           //Hack to get the "Very Low" label to display
                           //if (this.value < -.9) { return yBottomLabel }
                           //else { return yLabels[this.value]}
                           return this.value
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
                   padding: 0,
                   hideDelay:0,
                  // pointFormat: '<span style="font-size:14px"><b>{point.y}</b> </span>' + valueSuffix + '<br><i>(Click to Map)</i>',

                   formatter: function() {
                        //return this.key.replace(/\s*\<.*?\>\s*/g, '') +
                        //return this.key +
                         return '<span style="font-size:14px"><b>'+ this.point.y + ' %</b> </span>'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding:.1,
                        borderWidth: 1,
                        colors: ["#3462CF", "#8B97CC", "#DADBC5", "#F7D59E", "#E08865", "#C44539"]
                        //colors: columnChartColors
                    },
                    series: {
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
                                    $('#infovis').html('')
                                    $('#MEEMSE_node_count_legend').css("visibility","visible")
                                    modelForTree=layerToAdd
                                    eems_file_name=EEMSParams['models'][modelForTree][6]
                                    top_node=EEMSParams['models'][modelForTree][7]
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
                                            //json=$.parseJSON(json);
                                            //defineJSONtree()
                                            //alert(json)
                                            //$("#"+st.root).click()
                                        }

                                    });


                                    //Change column properties on click (problem is that when selecting a new feature, these properties no longer apply to the selected column)
                                    /*
                                     for (var i = 0; i < this.series.data.length; i++) {
                                         this.series.data[i].update({ borderColor: '#444444'}, true, false);
                                         this.series.data[i].graphic.attr({'stroke-width': 1}, true, false);
                                     }
                                        this.update({ borderColor: '#00FFFF'}, true, false)
                                        this.graphic.attr({'stroke-width': 2 })
                                     */

                                     //Define the json variable based on the layerToAdd  Name
                                     //defineJSONtree()
                                     //Create the tree.

                                    // Workaround to getting the last bar clicked to show up on top
                                    // Simply remove the other ones if they're in the map.

                                    var i = 0;
                                    while (i <= 5){
                                        layerToRemove = this.series.userOptions.layersToAdd[i]
                                        if (i != this.x){
                                                if (map.hasLayer(layerToRemove)){
                                                    map.removeLayer(layerToRemove)
                                                }
                                            }
                                        i+=1
                                    }
                                    // End Workaround

                                    if (typeof layerToAdd != 'undefined'){
                                         //swapImageOverlay(layerToAdd,'EEMSmodel')
                                         //swapLegend(layerToAdd, layerToAdd, 'EEMSmodel')
                                         eems_node_image_name=eems_file_name.replace(".eem","")+"_" + top_node
                                         eems_node_legend_name=eems_file_name.replace(".eem","")+"_" + "Legend"
                                         swapImageOverlay(eems_node_image_name,'EEMSmodel')
                                         swapLegend(layerToAdd, eems_node_image_name, 'EEMSmodel')
                                         //window.open(layerToAdd);
                                         // toggleLayer(layerToAdd)
                                    }

                                    //function for deselecting points when a column is selected.
                                    //Another issue: selecting a new polygon recreates the chart and deselects the selected column
                                    /*
                                    var other_chart = $('#point_chart').highcharts()
                                    other_chart.series[0].data[0].select();
                                    other_chart.series[1].data[0].select();
                                    other_chart.series[2].data[0].select();
                                    other_chart.series[3].data[0].select();
                                    */

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