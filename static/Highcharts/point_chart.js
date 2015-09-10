function createChart(climateVariable, statistic, season) {

    //Determine what variables are set in the drop down menu.
    climateVar = document.getElementById("variable_selection_form");
    selectedClimateVar= climateVar.options[climateVar.selectedIndex].text;
    climateStat = document.getElementById("statistic_selection_form");
    selectedClimateStat= climateStat.options[climateStat.selectedIndex].text;
    climateSeason = document.getElementById("season_selection_form");
    selectedClimateSeason = climateSeason.options[climateSeason.selectedIndex].text;

    //Allow for climate variable variations.
    if (statistic=="anom"){
        //remove the last character and add a "a" (e.g., tmin->tmia)
        climateVariable = (climateVariable.slice(0,-1) + 'a');
    }
    else if (statistic=="delta") {
        //remove the last character and add a "d" (e.g., tmin->tmid)
        climateVariable = (climateVariable.slice(0,-1) + 'd');
    }

    //Force statistic type for certain climate variables.
    if (climateVariable=='pet') {
        statistic='avg'
    }
    else if (climateVariable=='arid') {
        statistic='delta'
    }

    if (climateVariable=='tmax' || climateVariable=="tmin" || climateVariable=="tmid" || climateVariable=="tmad"){
        $('#units_selector').show()
        $('#MetricLabel').html('&deg;C');
        $('#EnglishLabel').html('&deg;F');
    }
    else if (climateVariable=='prec' || climateVariable=="pet") {
        $('#units_selector').show()
        $('#MetricLabel').html('mm');
        $('#EnglishLabel').html('inches');
    }
    else if (climateVariable=='arid' || climateVariable=='pred') {
        $('#units_selector').hide()
    }

    var db_statistic="avg"

    var seriesNumber=1;

    //Data to plot comes from the resultsJSON dictionary (example: resultsJSON['m5arids2t1_avg'], where m5arids2t1 is the field name in the postGIS database.)
    //m5=MIROC5,arid=aridity(delta),s2=Season2,t1=Season1,avg=database statistic

    var timePeriodCount=climateParams['timePeriods']

    for (model in climateParams['models']){

        modelAbbreviation=climateParams['models'][model][0]

        //Data To Plot (line1Values, line2Values, etc)
        //Historical (PRISM)
        if (modelAbbreviation == 'pm'){
            if (statistic=='anom' || statistic =='delta' ){
                eval("var " + "line"+seriesNumber+"Values=[0]")
                PRISM_LayersToAdd=['single_transparent_pixel']
            } else {
                eval("var " + "line"+seriesNumber+"Values=[resultsJSON['pm'+climateVariable+season+'t0'+'_'+statistic]]")
                PRISM_LayersToAdd=['pm'+climateVariable+season+'t0']
            }
        }

        else{

            eval("var " + "line"+seriesNumber+"Values=['']")
            eval("var " + model+"_LayersToAdd=['']")
            var j=1;
            //For Each Time Period
            while(j<=timePeriodCount) {
                var value=modelAbbreviation+climateVariable+season+'t'+j
                //Push data into series array
                eval("line"+seriesNumber+"Values").push(resultsJSON[value+'_'+db_statistic])
                //Layers to Addd
                eval(model+"_LayersToAdd").push(value)
                j++;
            }
        }

        seriesNumber++;
    }

    //Unit Conversion (metric to english)
    if (typeof unitsForChart == 'undefined') {
        unitsForChart='metric'
    }

    if (unitsForChart=='english'){

        var convertedValue

        if (climateVariable == 'tmin'|| climateVariable == 'tmax'){
            convertedValue=1.8*line1Values[0]+32;
            //rounded to 2 decimal places
            line1Values[0]=Number(convertedValue.toFixed(2));

            for (var i=2; i <= Object.keys(climateParams['models']).length; i++){

                    for (var j = 1; j < 3; j++) {
                        var convertedValue=1.8*eval("line"+i+"Values["+j+"]")+32
                        eval("line"+i+"Values["+j+"]=" + convertedValue.toFixed(2));
                    }
                }
        }

        else {
            if (climateVariable == 'tmid'|| climateVariable == 'tmad'){
                var factor=1.8
            }
            else if (climateVariable == 'tmid'|| climateVariable == 'tmad'){
                var factor=1.8
            }
            else if (climateVariable == 'prec'|| climateVariable == 'pet' || climateVariable == 'pred'|| climateVariable == 'ped'){
                var factor=0.0393701
            }
            else if (climateVariable == 'arid'){
                var factor=1
            }

            convertedValue=line1Values[0]* factor
            line1Values[0]=Number(convertedValue.toFixed(2))

            for (var i=2; i <= Object.keys(climateParams['models']).length; i++){

                for (var j = 1; j < 3; j++) {
                    convertedValue=eval("line"+i+"Values["+j+"]*factor")
                    eval("line"+i+"Values["+j+"] =" + convertedValue.toFixed(2))
                }
            }
        }
    }


    yAxisLabel=climateParams['labels'][climateVariable][0]
    valueSuffix=climateParams['labels'][climateVariable][1]

    if(unitsForChart=='english'){
        yAxisLabel=yAxisLabel.replace('mm','inches');
        valueSuffix=valueSuffix.replace('mm','inches');
        yAxisLabel=yAxisLabel.replace('°C','°F');
        valueSuffix=valueSuffix.replace('°C','°F');

    }

    /******************************************** Description *********************************************************/

    $('#point_chart_description').append(
        " Click on a point to display the dataset used to generate the plotted value. "
    )

    selectedClimateVar=selectedClimateVar.replace("PET", "potential evapotranspiration")

    if (selectedClimateSeason=="Annual"){
        seasonalMonthlyModifier=" "
        annualModifier=" annual "
        selectedClimateSeason=selectedClimateSeason.toLowerCase()
    }
    else
    {
        seasonalMonthlyModifier=" (for the months of " + selectedClimateSeason + ")"
        annualModifier=""
    }

    if((selectedClimateStat=="Average" && climateVariable != "arid") || climateVariable == "pet" ) {
            document.getElementById('point_chart_description').innerHTML="<b>Description:</b> " + "Within the area selected on the map, the average " + annualModifier + selectedClimateVar.toLowerCase() + seasonalMonthlyModifier + " during the historical period from 1971-2000 was " + line1Values  + valueSuffix + ". " + "The chart above shows the modeled projections for two future time periods within this same area. Click on any point to display the dataset used to generate the plotted value."
            $('#point_chart_description').append(" Explore " + selectedClimateVar + " <a onclick=\"changeSelectionForm('EnableForBoxPlot'); createBoxPlot(document.getElementById('variable_selection_form').value, document.getElementById('statistic_selection_form').value, document.getElementById('season_selection_form').value)\"><span title='Click to view box plots' style='cursor: help; font-weight:bold; color: #0054A8'>variability</span></a> within the DRECP study area.")
            /*
            $('#point_chart_description').append("<div style='position:relative; float:right; right:0px; width:40px; margin-left:5px'><img style='width:20px; position:absolute; bottom:-20px;' src='"+static_url + "img/boxPlotIcon.png'></div>")
            */
        }

    else if (selectedClimateStat=='Change' || climateVariable == "arid") {
            document.getElementById('point_chart_description').innerHTML="<b>Description:</b> " + "The chart above shows modeled predictions of average "  + annualModifier + selectedClimateVar.toLowerCase()  + " change " +  seasonalMonthlyModifier + " during two future time periods within the area selected on the map. Click on any point to display the dataset used to generate the plotted value."
        }

    /**************************************** End Description *********************************************************/

    $(function () {
        $('#point_chart').highcharts({
            chart: {
                zoomType: 'xy',
                type: 'scatter',
                width: 477,
                height:268
            },
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            subtitle: {
                text: '',
            },
            xAxis: {
                categories: ['Historical <br>(1971-2000)', '2016-2045', '2046-2075'],
            },
            yAxis: {
                title: {
                    text: yAxisLabel
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }],
                startOnTick:true,
                endOnTick:true,
                maxPadding:0,
                tickPixelInterval:50,
                /* Show tic on min and max of y axis */
                /*
                showFirstLabel: true,
                showLastLabel: true,
                */
            },
            tooltip: {
                backgroundColor: '#E9E6E0',
                borderWidth: 1,
                shadow: true,
                //useHTML causes hover problems.
                //useHTML: true,
                padding: 0,
                pointFormat: '<b>{point.y}</b> ' + valueSuffix + '<br><i>(Click to Map)</i>',
                /*
                positioner: function () {
                    return { x: 80, y: 0 };
                }
                */
            },

            legend: {
                itemStyle:{
                            fontWeight:'normal',
                            fontSize:'10px'
                          }
            },

            plotOptions: {
                radius:5,
                series: {
                    lineWidth : 0,
                    cursor: 'pointer',
                    marker: {
                        enabled:true,
                        states: {
                            select: {
                                lineWidth: 2,
                                radius:5,
                                shadow : true
                            }
                        }
                    }
                }
            },
        series: [{
        name: 'PRISM',
        //allowPointSelect: true,
        color:climateParams['models']['PRISM'][1],
        data: line1Values,
        cursor:'pointer',
        lineWidth : 0,
        marker : {
            enabled : true,
            radius : 6,
            states: {
                select: {
                    lineWidth: 2,
                    radius:5,
                }
            }
        },
        layersToAdd:PRISM_LayersToAdd,
        point: {
            events: {
                click: function() {
                    layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                    swapImageOverlay(layerToAddName)
                    swapLegend(layerToAddName, null, climateVariable)
                    /* Explore options for keepting point selected when a new area is selected */
                    /*
                    selectedPoint=this.series.data.indexOf(this)
                    selectedPoint=$('#point_chart').highcharts().series[0].data.indexOf(this)
                    alert(selectedPoint)
                    */
                    }
                }
            }
        },{
            name: 'ACCESS',
            //allowPointSelect: true,
            color:climateParams['models']['ACCESS'][1],
            data: line2Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            visible:true,
            layersToAdd:ACCESS_LayersToAdd,
            point: {
                events: {
                    click: function() {
                        layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the matching layer name
                        swapImageOverlay(layerToAddName)
                        swapLegend(layerToAddName, null, climateVariable)
                    }
                }
            }
        }, {
            name: 'CanESM2',
            //allowPointSelect: true,
            color:climateParams['models']['CanESM2'][1],
            data: line3Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor: '#717573',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            visible:true,
                        layersToAdd:CanESM2_LayersToAdd,
            point: {
                events: {
                    click: function() {
                        layerToAddName = this.series.userOptions.layersToAdd[this.x];
                        swapImageOverlay(layerToAddName)
                        swapLegend(layerToAddName, null, climateVariable)
                    }
                }
            }
        }, {
            name: 'CCSM4',
            //allowPointSelect: true,
            color:climateParams['models']['CCSM4'][1],
            data: line4Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor: '#C6D2DF',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            visible:true,
                        layersToAdd:CCSM4_LayersToAdd,
            point: {
                events: {
                    click: function() {
                        layerToAddName = this.series.userOptions.layersToAdd[this.x];
                        swapImageOverlay(layerToAddName)
                        swapLegend(layerToAddName, null, climateVariable)
                    }
                }
            }
        },  {
            name: 'CESM1',
            //allowPointSelect: true,
            color:climateParams['models']['CESM1'][1],
            data: line5Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor:'red',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            layersToAdd:CESM1_LayersToAdd,
            point: {
                    events: {
                        click: function() {
                            layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                            swapImageOverlay(layerToAddName)
                            swapLegend(layerToAddName, null, climateVariable)
                        }
                    }
                  }
        },   {
            name: 'CMCC',
            color:climateParams['models']['CMCC'][1],
            //allowPointSelect: true,
            data: line6Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor:'red',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            layersToAdd:CMCC_LayersToAdd,
            point: {
                    events: {
                        click: function() {
                            layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                            swapImageOverlay(layerToAddName)
                            swapLegend(layerToAddName, null, climateVariable)
                        }
                    }
                  }
        },   {
            name: 'CNRM',
            color:climateParams['models']['CNRM'][1],
            //allowPointSelect: true,
            data: line7Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor:'red',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            layersToAdd:CNRM_LayersToAdd,
            point: {
                    events: {
                        click: function() {
                            layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                            swapImageOverlay(layerToAddName)
                            swapLegend(layerToAddName, null, climateVariable)
                        }
                    }
                  }
        },   {
            name: 'GFDL',
            //allowPointSelect: true,
            color:climateParams['models']['GFDL'][1],
            data: line8Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor:'red',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            layersToAdd:GFDL_LayersToAdd,
            point: {
                    events: {
                        click: function() {
                            layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                            swapImageOverlay(layerToAddName)
                            swapLegend(layerToAddName, null, climateVariable)
                        }
                    }
                  }
        },   {
            name: 'HadGEM2CC',
            color:climateParams['models']['HadGEM2CC'][1],
            //allowPointSelect: true,
            data: line9Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor:'red',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            layersToAdd:HadGEM2CC_LayersToAdd,
            point: {
                    events: {
                        click: function() {
                            layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                            swapImageOverlay(layerToAddName)
                            swapLegend(layerToAddName, null, climateVariable)
                        }
                    }
                  }
        },   {
            name: 'HadGEM2ES',
            color:climateParams['models']['HadGEM2ES'][1],
            //allowPointSelect: true,
            data: line10Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor:'red',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            layersToAdd:HadGEM2ES_LayersToAdd,
            point: {
                    events: {
                        click: function() {
                            layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                            swapImageOverlay(layerToAddName)
                            swapLegend(layerToAddName, null, climateVariable)
                        }
                    }
                  }
        },   {
            name: 'MIROC5',
            color:climateParams['models']['MIROC5'][1],
            //allowPointSelect: true,
            data: line11Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor:'red',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            layersToAdd:MIROC5_LayersToAdd,
            point: {
                    events: {
                        click: function() {
                            layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                            swapImageOverlay(layerToAddName)
                            swapLegend(layerToAddName, null, climateVariable)
                        }
                    }
                  }
        },{
            name: 'Ensemble',
            color:climateParams['models']['Ensemble'][1],
            //allowPointSelect: true,
            data: line12Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    symbol:"circle",
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor:'red',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            layersToAdd:Ensemble_LayersToAdd,
            point: {
                    events: {
                        click: function() {
                            layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                            swapImageOverlay(layerToAddName)
                            swapLegend(layerToAddName, null, climateVariable)
                        }
                    }
                  }
        },
        ]
    });
   });

}