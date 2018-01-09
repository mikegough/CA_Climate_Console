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

    var timePeriodCount=climateParams['timePeriods'];

    for (model in climateParams['models']){

        modelAbbreviation=climateParams['models'][model][0];

        //Data To Plot (line1Values, line2Values, etc)
        //Historical (PRISM)
        if (modelAbbreviation == 'pm'){
            if (statistic=='anom' || statistic =='delta' ){
                eval("var " + "line"+seriesNumber+"Values=[0]");
                pm_LayersToAdd=['single_transparent_pixel']
            } else {
                eval("var " + "line"+seriesNumber+"Values=[resultsJSON['pm'+climateVariable+season+'t0'+'_'+statistic]]")
                pm_LayersToAdd=['pm'+climateVariable+season+'t0']
            }
        }

        else{

            eval("var " + "line"+seriesNumber+"Values=['']");
            eval("var " + modelAbbreviation+"_LayersToAdd=['']");
            var j=1;
            //For Each Time Period
            while(j<=timePeriodCount) {
                var value=modelAbbreviation+climateVariable+season+'t'+j;
                //Push data into series array
                eval("line"+seriesNumber+"Values").push(resultsJSON[value+'_'+db_statistic]);
                //Layers to Add
                eval(modelAbbreviation+"_LayersToAdd").push(value);
                j++;
            }
        }

        seriesNumber++;
    }


    updatePointDescription(climateVariable, line1Values);

    /*
    if (climateParams['boxPlot']==true) {
        $('#point_chart_description').append(" Explore " + selectedClimateVar + " <a onclick=\"changeSelectionForm('EnableForBoxPlot'); createBoxPlot(document.getElementById('variable_selection_form').value, document.getElementById('statistic_selection_form').value, document.getElementById('season_selection_form').value)\"><span title='Click to view box plots' style='cursor: help; font-weight:bold; color: #0054A8'>variability</span></a> within the DRECP study area.")
    }
    */

    /**************************************** End Description *********************************************************/

    $(function () {
        $('#point_chart').highcharts({
            chart: {
                zoomType: 'xy',
                type: 'scatter',
                height:330,
                marginTop:35,
                marginRight:50,
                marginLeft:60
            },
            title: {
                text: 'Click any point to map the data',
                text: '',
                style: { "color": "#666666", "fontSize": "13px" },
                y:0
            },
            credits: {
                enabled:false
            },
            exporting: {
                enabled:true,
                allowHTML:true,
                buttons: {
                    contextButton: {
                        align:'right',
                        y:-10,
                    }
                },
                filename:activeReportingUnitsName+ "_" + response['categoricalValues'] + "_" + selectedClimateVar + "_" + "_" + selectedClimateStat + "_" + "("+selectedClimateSeason+")",
                chartOptions: {
                    chart:{
                        /*
                        height:500,
                        width:600,
                        */
                    },
                    legend: {
                        y:-5
                    },
                    title: {
                        align:'center',
                        useHTML: false,
                        margin:20,
                        text: "<br>"+activeReportingUnitsName + ": " + response['categoricalValues'],
                    },
                    subtitle: {
                        text: "<br>"+selectedClimateVar + " " + " " + selectedClimateStat + " " + "(" + selectedClimateSeason +")"+"<br>",
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
            subtitle: {
                text: '',
            },
            xAxis: {
                categories: climateParams["timePeriodLabels"],
                labels: {
                    style: {
                        fontSize: '14px'
                    }
                }
            },
            yAxis: {
                title: {
                    text: yAxisLabel,
                    margin:20,
                    style: {
                        fontSize: '14px'
                    }
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
                enabled:false,
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
                    }
                }
            }

        });


    });

    //Loop through all the models in the config file and create new series out of them.
    chart=$('#point_chart').highcharts();
    seriesNumber=1;
    for (model in climateParams['models']){
        var modelAbbreviation=climateParams['models'][model][0];
        var radius;
        var symbol;
        var color;
        if (typeof climateParams['models'][model][4] != "undefined") {
            radius = climateParams['models'][model][4]    ;
        }
        else{
            radius = 4;
        }
        if (typeof climateParams['models'][model][5] != "undefined") {
            symbol = climateParams['models'][model][5]    ;
        }
        else{
            symbol = "";
        }
        if (typeof climateParams['models'][model][1] != "undefined") {
            color = climateParams['models'][model][1];
        }
        else{
            color = "";
        }
        chart.addSeries({
            name: model,
            allowPointSelect: true,
            color:color,
            data: eval("line"+seriesNumber+"Values"),
            visible: climateParams['models'][model][3],
            layersToAdd:eval(modelAbbreviation +"_LayersToAdd"),
            index:seriesNumber,
            marker:{
                radius: radius,
                symbol: symbol,
                states: {
                            select: {
                                lineWidth: 3,
                                fillColor:this.fillColor,
                                lineColor: "#00FFFF"
                            }
                        }
            },
            point: {
                data: eval("line"+seriesNumber+"Values"),
                events: {
                    click: function() {
                        layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                        modelName = this.series.userOptions.name; // onclick get the modelName (used in leaflet_map.js to get the Data Basin layer index)
                        /* Check for the model dropdown. If it exists, change the model dropdown when a user clicks on a point. Which also triggers a change in the image overlay and the quick view table. */
                        if ($("#model_selection_form").length) {
                            activeTimePeriod = this.index;
                            // This fixes the issue when a dropdown change triggers another dropdown change (e.g., Aridity only has Change).
                            last_pngCode = "";
                            if (this.series.index != 0) {
                                $('#model_selection_form').val(this.series.index).change();
                            }
                            // For PRISM don't need to change dropdown.
                            else {
                                swapImageOverlay(layerToAddName)
                                swapLegend(layerToAddName, null, climateVariable, modelName)
                            }
                        }
                        // If there's no model dropdown, use the original point click actions .
                        else {
                            swapImageOverlay(layerToAddName)
                            swapLegend(layerToAddName, null, climateVariable, modelName)
                        }
                        // return false to prevent default action. Prevents the d.select is not a function error in the console.
                        return false;
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

        $("div#pop-up").html('Click to show/hide this model in the chart above')

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


function updateData(climateVariable, statistic, season, model_index) {

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
    if (climateVariable=='pet' || climateVariable=='vpr') {
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
    else if (climateVariable=='arid' || climateVariable=='pred' || climateVariable=='vpr' || climateVariable=='vpd') {
        $('#units_selector').hide()
    }

    //Turns out precip deltas for the DRECP are mm
    if (title == 'DRECP'  &&  climateVariable=='pred'){
        $('#units_selector').show()
        $('#MetricLabel').html('Millimeters (mm)');
        $('#EnglishLabel').html('Inches (in)');
    }

    yAxisLabel=climateParams['labels'][climateVariable][0]
    valueSuffix=climateParams['labels'][climateVariable][1]

    var db_statistic="avg"

    var seriesNumber=1;


    //Data to plot comes from the resultsJSON dictionary (example: resultsJSON['m5arids2t1_avg'], where m5arids2t1 is the field name in the postGIS database.)
    //m5=MIROC5,arid=aridity(delta),s2=Season2,t1=Season1,avg=database statistic

    var timePeriodCount=climateParams['timePeriods']

    if (unitsForChart=='english') {
        yAxisLabel = yAxisLabel.replace('mm', 'inches');
        valueSuffix = valueSuffix.replace('mm', 'inches');
        yAxisLabel = yAxisLabel.replace('°C', '°F');
        valueSuffix = valueSuffix.replace('°C', '°F');
    }

    for (model in climateParams['models']){

        modelAbbreviation=climateParams['models'][model][0]

        //Data To Plot (line1Values, line2Values, etc)
        //Historical (PRISM)

        if (modelAbbreviation == 'pm'){
            if (statistic=='anom' || statistic =='delta' ){
                historicalDataToPlot=[0]
                pm_LayersToAdd=['single_transparent_pixel']
            } else {
                historicalDataToPlot=[resultsJSON['pm'+climateVariable+season+'t0'+'_'+statistic]]
                pm_LayersToAdd=['pm'+climateVariable+season+'t0']
                if (unitsForChart=='english'){
                    historicalDataToPlot=[EnglishUnitsConversion(historicalDataToPlot[0])]
                }
            }

            //Update the Data & the Click Event Layers to Add.
            chart.series[0].setData(historicalDataToPlot,false,true,true);
            //chart.series[0].data[0].update(historicalDataToPlot,false);

            chart.series[0].update({
                layersToAdd:eval(modelAbbreviation +"_LayersToAdd")
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
            eval("var " + modelAbbreviation +"_LayersToAdd=['']")
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
                eval(modelAbbreviation + "_LayersToAdd").push(fieldCode)
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
                layersToAdd:eval(modelAbbreviation +"_LayersToAdd")
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
                var factor=0.03936996
            }
            else if (climateVariable == 'arid' || climateVariable == 'pred'){
                var factor=1
            }

            //Turns out precip deltas for the DRECP are mm
            if (climateVariable == 'pred' && title == 'DRECP'){
                var factor=0.03936996
            }

            convertedValue=dataValue*factor
        }

        roundedConvertedValue=Number(convertedValue.toFixed(2));
        //If the configuration file contains a model abbreviation that is not in the database, the math above fails with a NaN. The chart will not plot this model.
        if (isNaN(roundedConvertedValue)) {
            console.log(modelAbbreviation + " is a model abbreviation that does not appear in the database")
            return ''
        }
        else {
            return roundedConvertedValue
        }
    }

    chart.yAxis[0].setTitle({ text:yAxisLabel }, false);

    //chart.redraw()

    updatePointDescription(climateVariable, historicalDataToPlot);

    chart.yAxis[0].setTitle({
        text: yAxisLabel
    });

    chart.options.exporting.filename=activeReportingUnitsName + "_"+response['categoricalValues'] + "_" + selectedClimateVar + "_" + selectedClimateStat + "_" + selectedClimateSeason,
    chart.options.exporting.chartOptions.title.text="<br>"+activeReportingUnitsName + ": " + response['categoricalValues']
    chart.options.exporting.chartOptions.subtitle.text="<br>"+selectedClimateVar + " " + selectedClimateStat + " " + "("+selectedClimateSeason+")"+"<br>"

    changeImageOverlayBasedOnNewDropdownSelection(model_index,climateVariable,season,statistic)


}


function updatePointDescription(climateVariable, historicalDataToPlot){

    selectedClimateVarLong = selectedClimateVar.replace("PET", "potential evapotranspiration").replace("Temp", "temperature").replace("Max", "maximum").replace("Min", "minimum");

    if (selectedClimateSeason=="Annual"){
        seasonalMonthlyModifier=" ";
        annualModifier=" annual ";
        selectedClimateSeason=selectedClimateSeason.toLowerCase()
    }
    else
    {
        seasonalMonthlyModifier=" (for the months of " + selectedClimateSeason + ")";
        annualModifier=""
    }

    if(selectedClimateStat=="Average") {
        document.getElementById('point_chart_description').innerHTML="<div class='description_header'>Description</div><p>" + "This chart shows the historical average " + annualModifier + selectedClimateVarLong.toLowerCase() + seasonalMonthlyModifier + " within the selected area (" + historicalDataToPlot[0] +" "+valueSuffix + "), as well as the modeled projections for two future time periods. Each point represents a different climate model. <p> Click any point to toggle the corresponding map layer on/off in the map."
        if (climateParams['boxPlot']==true) {
            $('#point_chart_description').append(" Explore " + selectedClimateVarLong + " <a onclick=\"changeSelectionForm('EnableForBoxPlot'); createBoxPlot(document.getElementById('variable_selection_form').value, document.getElementById('statistic_selection_form').value, document.getElementById('season_selection_form').value)\"><span title='Click to view box plots' style='cursor: help; font-weight:bold; color: #0054A8'>variability</span></a> within the DRECP study area.")
        }
        /*
         $('#point_chart_description').append("<div style='position:relative; float:right; right:0px; width:40px; margin-left:5px'><img style='width:20px; position:absolute; bottom:-20px;' src='"+static_url + "img/boxPlotIcon.png'></div>")
         */
    }
    else if (selectedClimateStat=='Change' || climateVariable == "arid") {
        document.getElementById('point_chart_description').innerHTML="<div class='description_header'>Description</div><p>" + "This chart shows the modeled projections of average "  + annualModifier + selectedClimateVarLong.toLowerCase()  + " change " +  seasonalMonthlyModifier + " for two future time periods within the area selected on the map. Each point represents a different climate model. <p>Click any point to display the map layer used to generate the plotted value."
    }

    $("#point_chart_description").append('<div id="point_chart_info"><div id="point_click_img_div"><img id="point_click_img" src="' + static_url + 'img/point_click.png">');
    $("#point_chart_description").append('<div onclick="load_help_content(\'Climate Projections\', \'climate_projections.html\')" class="learn_more">Learn more... </div>');

}
