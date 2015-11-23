function createChart(climateVariable, statistic, season) {

    //Determine what variables are set in the drop down menu.
    climateVar = document.getElementById("variable_selection_form");
    selectedClimateVar= climateVar.options[climateVar.selectedIndex].text;
    climateStat = document.getElementById("statistic_selection_form");
    selectedClimateStat= climateStat.options[climateStat.selectedIndex].text;
    climateSeason = document.getElementById("season_selection_form");
    selectedClimateSeason = climateSeason.options[climateSeason.selectedIndex].text;

    yAxisLabel=climateParams['labels'][climateVariable][0]
    valueSuffix=climateParams['labels'][climateVariable][1]

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


    $('#point_chart_description').append(
        " Click on a point to display the dataset used to generate the plotted value. "
    )


    document.getElementById('point_chart_description').innerHTML="<b>Description:</b> " + "Within the area selected on the map, the average annual " + selectedClimateVar.toLowerCase() + " during the historical period from 1971-2000 was " + line1Values  + "&degC" + ". " + "The chart above shows the modeled projections for two future time periods within this same area. Click on any point to display the dataset used to generate the plotted value."
    if (climateParams['boxPlot']==true) {
        $('#point_chart_description').append(" Explore " + selectedClimateVar + " <a onclick=\"changeSelectionForm('EnableForBoxPlot'); createBoxPlot(document.getElementById('variable_selection_form').value, document.getElementById('statistic_selection_form').value, document.getElementById('season_selection_form').value)\"><span title='Click to view box plots' style='cursor: help; font-weight:bold; color: #0054A8'>variability</span></a> within the DRECP study area.")
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
                categories: climateParams["timePeriodLabels"],
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
                hideDelay:0,
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
            }

        });


    });

    //Loop through all the models in the config file and create new series out of them.
    chart=$('#point_chart').highcharts();
    seriesNumber=1;
    for (model in climateParams['models']){
        chart.addSeries({
            name: model,
            //allowPointSelect: true,
            color:climateParams['models'][model][1],
            data: eval("line"+seriesNumber+"Values"),
            layersToAdd:eval(model +"_LayersToAdd"),
            point: {
                events: {
                    click: function() {
                        layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                        swapImageOverlay(layerToAddName)
                        swapLegend(layerToAddName, null, climateVariable)
                    }
                }
            }

        });
        seriesNumber++;
    }

    /* Other options for informing the user about the legend clicking ability */
     //$('g.highcharts-legend:nth-child(9)').mouseover(function(){$('#legendTips').stop(true,true).delay(0).show(0)});
     //$('g.highcharts-legend:nth-child(9)').mouseout(function(){$('#legendTips').show().delay(1000).hide(0)});
     //$('g.highcharts-legend:nth-child(9)').attr('title', 'Click to show/hide this item in the chart');

    /* Hover over legend tip */
    var moveLeft = 2;
    var moveDown = 24;

    $('.highcharts-legend').hover(function(e) {

        $("div#pop-up").html('Click to show/hide model in the chart')

        $('div#pop-up').fadeIn(300);
        }, function() {
          $('div#pop-up').stop(true,true).hide(100);
        });

    $('.highcharts-legend').mousemove(function(e) {
        if (e.pageX > 1475) {
            $("div#pop-up").css('top', e.pageY + moveDown).css('left', e.pageX + moveLeft -108);
        }
        else {
            $("div#pop-up").css('top', e.pageY + moveDown).css('left', e.pageX + moveLeft);
        }
    });

}

function updateData(climateVariable, statistic, season) {

    $("#clickToMapInfo").hide();

    //Unit Conversion (metric to english)
    if (typeof unitsForChart == 'undefined') {
        unitsForChart='metric'
    }

    line1Values='0'

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
        $('#MetricLabel').html('&deg;Celsius');
        $('#EnglishLabel').html('&deg;Fahrenheit');
    }
    else if (climateVariable=='prec' || climateVariable=="pet") {
        $('#units_selector').show()
        $('#MetricLabel').html('Millimeters (mm)');
        $('#EnglishLabel').html('Inches (in)');
    }
    else if (climateVariable=='arid' || climateVariable=='pred') {
        $('#units_selector').hide()
    }

    yAxisLabel=climateParams['labels'][climateVariable][0]
    valueSuffix=climateParams['labels'][climateVariable][1]

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
                historicalDataToPlot=[0]
                PRISM_LayersToAdd=['single_transparent_pixel']
            } else {
                historicalDataToPlot=[resultsJSON['pm'+climateVariable+season+'t0'+'_'+statistic]]
                PRISM_LayersToAdd=['pm'+climateVariable+season+'t0']
                if (unitsForChart=='english'){
                    yAxisLabel=yAxisLabel.replace('mm','inches');
                    valueSuffix=valueSuffix.replace('mm','inches');
                    yAxisLabel=yAxisLabel.replace('°C','°F');
                    valueSuffix=valueSuffix.replace('°C','°F');
                    historicalDataToPlot=[EnglishUnitsConversion(historicalDataToPlot[0])]
                }
            }

            //Update the Data & the Click Event Layers to Add.
            chart.series[0].setData(historicalDataToPlot,false,true,true);
            //chart.series[0].data[0].update(historicalDataToPlot,false);

            chart.series[0].update({
                layersToAdd:eval(model +"_LayersToAdd")
            },false);

            //Update the units that appear in the tooltip
            chart.series[0].update({
                tooltip:{
                       pointFormat: '<b>{point.y}</b> ' + valueSuffix + '<br><i>(Click to Map)</i>'
                },
            },false);
        }

        else{

            //New Layers to Add on Point Click
            eval("var " + model+"_LayersToAdd=['']")
            //Array to store the new data to plot
            var fieldCode
            var dataPoint
            var dataToPlot=['']

            var j=1;
            //For Each Time Period. Loop through and push data into array
            while(j<=timePeriodCount) {
                fieldCode = modelAbbreviation + climateVariable + season + 't' + j
                //console.log(fieldCode)
                //Layers to Add
                eval(model + "_LayersToAdd").push(fieldCode)
                //Push data into array
                dataPoint=resultsJSON[fieldCode + '_' + db_statistic];
                if (unitsForChart == 'metric') {
                    dataToPlot.push(dataPoint);
                }
                else{
                    valueSuffix = valueSuffix.replace('mm', 'inches');
                    valueSuffix = valueSuffix.replace('°C', '°F');
                    dataToPlot.push(EnglishUnitsConversion(dataPoint))
                }
                j++;
            }

            //update the data in the chart
            var chartSeriesIndex = seriesNumber - 1
            chart.series[chartSeriesIndex].setData(dataToPlot,false,true,true);

            //Update the Click Event Layers To Add.
            chart.series[chartSeriesIndex].update({
                layersToAdd:eval(model +"_LayersToAdd")
            },false);

            //Update the units that appear in the tooltip
            chart.series[chartSeriesIndex].update({
                tooltip:{
                    pointFormat: '<b>{point.y}</b> ' + valueSuffix + '<br><i>(Click to Map)</i>',
                }
            },false);
        }

        seriesNumber++;
    }

    function EnglishUnitsConversion(dataValue){

        var convertedValue
        var roundedConvertedValue

        //Celsius to Fahrenheit
        if (climateVariable == 'tmin'|| climateVariable == 'tmax'){
            convertedValue=1.8*dataValue+32;
        }
        else {
            if (climateVariable == 'tmid'|| climateVariable == 'tmad'){
                var factor=1.8
            }
            else if (climateVariable == 'prec' || climateVariable == 'pet'){
                var factor=0.0393701
            }
            else if (climateVariable == 'arid' || climateVariable == 'pred'){
                var factor=1
            }

            convertedValue=dataValue*factor
        }

        roundedConvertedValue=Number(convertedValue.toFixed(2));
        return roundedConvertedValue
    }

    chart.yAxis[0].setTitle({ text:yAxisLabel }, false);

    //chart.redraw()


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
            document.getElementById('point_chart_description').innerHTML="<b>Description:</b> " + "Within the area selected on the map, the average " + annualModifier + selectedClimateVar.toLowerCase() + seasonalMonthlyModifier + " during the historical period from 1971-2000 was " + historicalDataToPlot[0] +" "+valueSuffix + ". " + "The chart above shows the modeled projections for two future time periods within this same area. Click on any point to display the dataset used to generate the plotted value."
            if (climateParams['boxPlot']==true) {
                $('#point_chart_description').append(" Explore " + selectedClimateVar + " <a onclick=\"changeSelectionForm('EnableForBoxPlot'); createBoxPlot(document.getElementById('variable_selection_form').value, document.getElementById('statistic_selection_form').value, document.getElementById('season_selection_form').value)\"><span title='Click to view box plots' style='cursor: help; font-weight:bold; color: #0054A8'>variability</span></a> within the DRECP study area.")
            }
            /*
            $('#point_chart_description').append("<div style='position:relative; float:right; right:0px; width:40px; margin-left:5px'><img style='width:20px; position:absolute; bottom:-20px;' src='"+static_url + "img/boxPlotIcon.png'></div>")
            */
        }

    else if (selectedClimateStat=='Change' || climateVariable == "arid") {
            document.getElementById('point_chart_description').innerHTML="<b>Description:</b> " + "The chart above shows modeled predictions of average "  + annualModifier + selectedClimateVar.toLowerCase()  + " change " +  seasonalMonthlyModifier + " during two future time periods within the area selected on the map. Click on any point to display the dataset used to generate the plotted value."
        }

    chart.yAxis[0].setTitle({
        text: yAxisLabel
    });

}

