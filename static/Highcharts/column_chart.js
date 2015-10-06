var attributes =[]
for (EEMSModel in EEMSParams["models"]){
    attributes.push("<span class='highChartsXaxisText' title='Click to view information about this model'><span onclick='swapImageOverlay(&quot;"+EEMSModel+"&quot;);swapLegend(&quot;"+EEMSModel+"&quot;,&quot;"+EEMSModel+"&quot;,&quot;EEMSmodel&quot;)'>"+EEMSParams['models'][EEMSModel][1]+"</span> <div class='info_icon' onClick=showInfoPopup('"+EEMSModel+"')> </div></span>")
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
        valuesToPlot = [.2, .4, .8, -.3, .4,.1]
    }

    var minVal = -1;
    var maxVal = 1;

    columnChartColors=columnChartColorsCSV.split(',')

    $(function () {
        $('#column_chart').highcharts({
              chart: {
                    type: 'column',
                    width:477,
                    height:360,
                    marginTop:50,
                },
                credits: {
                    enabled: false
                },

                exporting: {
                    enabled: false
                },
                title: {

                    text: ' ',
                    x: 30,
                    margin: 15,

                    style: {
                        fontSize: '14px'
                    }
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
                       style: { fontSize: '11px', fontWeight: 'normal', textAlign: 'right', cursor: 'pointer'},
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
                   padding: 0,
                  // pointFormat: '<span style="font-size:14px"><b>{point.y}</b> </span>' + valueSuffix + '<br><i>(Click to Map)</i>',

                   formatter: function() {
                        return this.key.replace(/\s*\<.*?\>\s*/g, '') +
                        '<br><span style="font-size:14px"><b>'+ this.point.y + '</b> </span><br><i>(Click to Map)</i>'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding:.1,
                        borderWidth: 1,
                        //colors: ['#364D22', '#4D79B3', '#734D21', '#FF5C0F', '#B11B1B']
                        colors: columnChartColors
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

                                    if (layerToAdd){
                                         swapImageOverlay(layerToAdd,'EEMSmodel')
                                         swapLegend(layerToAdd, layerToAdd, 'EEMSmodel')
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