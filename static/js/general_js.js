 $(document).ready(function(){

     var currentDate=new Date()
     currentYear=currentDate.getFullYear()

     document.title=title + " Climate Console"
     //$("#view1Link").click()

    //Prepare Near Term Forecast

    previousDivision=''
    countTimesNoaa3MonthCalled=0
    //Initialize Selected Time Frame
    selectedNearTermClimatePeriod=1

    acquireNearTermClimate();
    createDynamicMonthlyRadioButtons()
     //Only need this because for cases when the page is refreshed and the Near-Term Forecast tab is selected.
     //Otherwise it could go in the leaflet_map function activateMapForNearTerm...function.
    generateNearTermClimateResults(selectedNearTermClimatePeriod,selectedClimateDivision)

    //Check the top radio buttons
     $('.neartermclimateform').each(function(){
        $('input[type=radio]', this).get(0).checked = true;
    });

     $('#nearTermMapForm').each(function(){
         $('input[type=radio]', this).get(0).checked = true;
     });

     //Initialize Downlscaled Time Series
     create_post_downscale(initialDownscaleMarkerLon,initialDownscaleMarkerLat)
     $('#downscaled_coords').html(initialDownscaleMarkerLon +", "+ initialDownscaleMarkerLat)

     //enable intro.js  on the control layers
     gettingStartedIntro=introJs();

     $('.leaflet-control-layers-expanded').each(function(i) {
         $(this).attr('data-step','1')
         $(this).attr('data-intro','Reporting units define the ecological or administrative boundaries for which the climate projections will be calculated. By selecting counties, for example, you will be able to examine the climate projections for a specified county or counties of interest.')
     });

     $('.leaflet-draw').each(function(i) {
         $(this).attr('data-step','2')
         //$(this).attr('data-intro','<b>Select a feature or set of features in the map.</b><br>A feature refers to a polygon delineating a specific administrative or ecological boundary. For example, a county or watershed. You can use one of the selection tools on the left to select multiple features, or simply click on a single feature of interest in the map.')
         $(this).attr('data-intro','A feature refers to a specific administrative or ecological boundary in the reporting units layer selected above. For example, a county or watershed. You can use one of the selection tools on the left to select multiple features (selected features will be those that intersect the drawn shape), or simply click on a single feature of interest in the map.')
     });

     $('.leaflet-geonames-search').each(function(i) {
         $(this).attr('data-step','3')
         //$(this).attr('data-intro','<b>Select a feature or set of features in the map.</b><br>A feature refers to a polygon delineating a specific administrative or ecological boundary. For example, a county or watershed. You can use one of the selection tools on the left to select multiple features, or simply click on a single feature of interest in the map.')
         $(this).attr('data-intro','You can also click here to select a feature based on the location of a specified place name.')
     });

     //ShowBullets is not working. Set dispay=none for the .introjs-bullets class in the css file instead.
     gettingStartedIntro.setOptions({'showStepNumbers':false, 'showBullets': 'false', 'tooltipPosition': 'right'});

});

/************************************************ TABLE TAB FUNCTIONS *************************************************/

/* Selected Features Table */
function refreshSelectedFeaturesTab(){

    //var save = $('#view2 .select_container').detach();
    //$('#view2').empty().append(save);

    $('#view2').empty()

    //$('#view2').append("<br><h3>Current Selection:</h3>")
    $('#view2').append('<br><div id="dynamicSelectedFeaturesTableDiv"></div>')
    $('#dynamicSelectedFeaturesTableDiv').append('<table class="dynamicDataTable" id="selectedFeaturesTable"></table>');
    var selectedFeaturesTable=$('#dynamicSelectedFeaturesTableDiv').children();
    selectedFeaturesTable.append("<tr><th>Reporting Units</th><th>Selected Features</th></tr>")

    featureCount=response['count']

    if (featureCount > 1)  {
        pluralize="s"
    } else {
        pluralize=""
    }

    if (response['reporting_units'] == 'onekm'){
           selectedFeaturesTable.append("<tr><td>" + 'User Defined (1km)' + "</td><td>" + response['count'] + " grid cell"+pluralize+ " selected </td></tr>")
    } else {

            var count = 1
            listOfSelectedFeatures=""
            categoricalValuesArray=response['categoricalValues']
            //console.log(categoricalValuesArray)

            for (var i=0,  tot=categoricalValuesArray.length; i < tot; i++) {

                listOfSelectedFeatures=listOfSelectedFeatures+"<div class='selectedFeaturesText' onmouseout='mouseOutTextChangeBack()' onmouseover='mouseOverTextChangeColor(\"" + categoricalValuesArray[i] + "\")' id='" + categoricalValuesArray[i] + "' >" + count + ". " + categoricalValuesArray[i] + "<span class='inner'></span></div>";

                count=count+1
            }

            selectedFeaturesTable.append("<tr><td>" + activeReportingUnitsName +"</span></td><td>" + listOfSelectedFeatures + "</td></tr>")
   }


    //$('#view2').append('<div id="getRawValuesButton"><button onclick="getRawValues()">Show Raw Data Table</button></div>')
    $('#view2').append('</table>')

    //createDynamicDataTable()

}

/* Data Tables (Climate & EEMS) */
/* Not currently being used */
function createDynamicDataTable(){

    //var save = $('#view2 .select_container').detach();
    //$('#view2').empty().append(save);

    $('#getRawValuesButton').css('display','None')
    $('#view2').append("<br><h3>Climate Data:</h3>")

    resultsJSONsorted=sortObject(resultsJSON)

    $('#view2').append('<div id="dynamicDataTableDiv"></div>')
    $('#dynamicDataTableDiv').append('<table class="dynamicDataTable"></table>');
    var table=$('#dynamicDataTableDiv').children();
    table.append("<tr><th>Model</th><th>Variable</th><th>Season</th><th>Time Period</th><th>Value</th></tr>")

    $('#view2').append("<br><h3>EEMS Data:</h3>")

    $('#view2').append('<div id="dynamicEEMSDataTableDiv"></div>')
    $('#dynamicEEMSDataTableDiv').append('<table class="dynamicDataTable"></table>');

    var EEMStable=$('#dynamicEEMSDataTableDiv').children();
    EEMStable.append("<tr><th>EEMS Model</th><th>Time Period</th><th>Climate Model Input </th><th>Value</th></tr>")

    for (var key in resultsJSONsorted) {

        var imageOverlayName=key.replace("_avg","")

        if (key != 'count'){

            if (key == 'intactness_avg' || key == 'eepifzt1_avg' || key == 'eepifzt2_avg' || key == 'eecefzt1_avg' || key == 'eecefzt2_avg' || key == 'hisensfz_avg') {

                if (imageOverlayName == 'intactness'){
                    EEMSData='<td>Terrestrial Intactness</td><td></td><td></td>'
                }
                else if(imageOverlayName == 'hisensfz') {
                    EEMSData='<td>Site Sensitivity</td><td></td><td></td>'
                }
                else if(imageOverlayName == 'eecefzt1') {
                    EEMSData='<td>Climate Exposure</td><td>2016-2045</td><td>Ensemble</td>'
                }
                else if(imageOverlayName == 'eecefzt2') {
                    EEMSData='<td>Climate Exposure</td><td>2046-2075</td><td>Ensemble</td>'
                }
                else if(imageOverlayName == 'eepifzt1') {
                    EEMSData='<td>Potential Impact</td><td>2016-2045</td><td>Ensemble</td>'
                }
                else if(imageOverlayName == 'eepifzt2') {
                    EEMSData='<td>Potential Impact</td><td>2046-2075</td><td>Ensemble</td>'
                }

                if (imageOverlayName == climate_PNG_overlay.name){
                    background_color="#00FFFF"
                } else {
                    background_color="white"
                }

                EEMStable.append("<tr style='background-color:"+ background_color + "' onclick='swapImageOverlay(&quot;" +imageOverlayName + "&quot;); swapLegend(&quot;"+imageOverlayName +"&quot;," + null + ",&quot;EEMSmodel&quot;)'>" + EEMSData + "<td>" +resultsJSONsorted[key] + "</td></tr>")

            }else{

                if ((key).indexOf('') > -1 ) {


                    expandedLabel = key.replace('g3', '<td>GFDL-CM3</td>')
                    expandedLabel = expandedLabel.replace('c2', '<td>CanESM2 </td>')
                    expandedLabel = expandedLabel.replace('ee', '<td>Ensemble </td>')
                    expandedLabel = expandedLabel.replace('c5', '<td>CESM1-CAM5 </td>')
                    expandedLabel = expandedLabel.replace('m3', '<td>MRI-CGCM3 </td>')
                    expandedLabel = expandedLabel.replace('c4', '<td>CCSM4 </td>')
                    expandedLabel = expandedLabel.replace('m5', '<td>MIROC5 </td>')
                    expandedLabel = expandedLabel.replace('pm', '<td>PRISM </td>')

                    expandedLabel = expandedLabel.replace('arid', '<td>Aridity Change </td>')
                    expandedLabel = expandedLabel.replace('pet', '<td>PET Average </td>')

                    expandedLabel = expandedLabel.replace('prec', '<td>Precip Average </td>')
                    expandedLabel = expandedLabel.replace('pred', '<td>Precip Change </td>')
                    expandedLabel = expandedLabel.replace('prea', '<td>Precip Anomaly </td>')
                    expandedLabel = expandedLabel.replace('tmax', '<td>Max Temp Average </td>')
                    expandedLabel = expandedLabel.replace('tmaa', '<td>Max Temp Anomaly </td>')
                    expandedLabel = expandedLabel.replace('tmad', '<td>Max Temp Change </td>')
                    expandedLabel = expandedLabel.replace('tmin', '<td>Min Temp Average </td>')
                    expandedLabel = expandedLabel.replace('tmia', '<td>Min Temp Anomaly </td>')
                    expandedLabel = expandedLabel.replace('tmid', '<td>Min Temp Change </td>')

                    expandedLabel = expandedLabel.replace('s0', '<td>Annual </td>')
                    expandedLabel = expandedLabel.replace('s1', '<td>Jan-Feb-Mar </td>')
                    expandedLabel = expandedLabel.replace('s2', '<td>Apr-May-Jun </td>')
                    expandedLabel = expandedLabel.replace('s3', '<td>Jul-Aug-Sep </td>')
                    expandedLabel = expandedLabel.replace('s4', '<td>Oct-Nov-Dec </td>')

                    expandedLabel = expandedLabel.replace('t0', '<td>Historical</td>')
                    expandedLabel = expandedLabel.replace('t1', '<td>2016-2045</td>')
                    expandedLabel = expandedLabel.replace('t2', '<td>2046-2075</td>')

                    if (imageOverlayName == climate_PNG_overlay.name){
                        class_name="active"
                    } else {
                        class_name=""
                    }

                    table.append("<tr class='" +class_name + "' onclick='swapImageOverlay(&quot;" +imageOverlayName + "&quot;); swapLegend(&quot;"+imageOverlayName +"&quot;," + null + ",&quot;null&quot;)'>" + expandedLabel + "<td>" +resultsJSONsorted[key] + "</td></tr>")

                }
            }
        }
    }

    //Used to highlight selected record. Needs to after the dynamic table is created.
    $('.dynamicDataTable tr').click(function () {
        $('.dynamicDataTable tr').removeClass("active");
        $(this).addClass("active");
    });

}

function sortObject(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
                a.push(key);
        }
    }
    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}


/*********************************** CHANGE SELECTION DROP-DOWN BASED ON CHART  ***************************************/
function changeSelectionForm(whichChart){

    if (whichChart=="EnableForBoxPlot"){
        showChartOnMapSelect="BoxPlot"
        $( "#variable_selection_form" ).change(function() {
            createBoxPlot(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });
        $( "#statistic_selection_form" ).change(function() {
            createBoxPlot(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });
        $( "#season_selection_form" ).change(function() {
            createBoxPlot(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });
        $("#statistic_selection_form option[value='delta']").remove()
        $("#variable_selection_form option[value='arid']").remove()
        /*
        $("#point_chart").css("height","38%")
        $("#point_chart").css("maxHeight","350px")
        */

    }
    else if (whichChart=="EnableForPointChart") {
        showChartOnMapSelect="PointChart"
        $( "#variable_selection_form" ).change(function() {
            createChart(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });
        $( "#statistic_selection_form" ).change(function() {
            createChart(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });
        $( "#season_selection_form" ).change(function() {
            createChart(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });

         var climateVar = document.getElementById("variable_selection_form");
         var variable = climateVar.options[climateVar.selectedIndex].text;
         if (variable!="PET")  {
            var option = $('<option class="delta"></option>').attr("value", "delta").text("Change");
         }
        $("#statistic_selection_form").append(option);
        var option = $('<option class="arid"></option>').attr("value", "arid").text("Aridity");
        $("#variable_selection_form").append(option);
        /*
        $("#point_chart").css("height","32%")
        $("#point_chart").css("maxHeight","260px")
        */
    }
}

$(document).ready(function() {

    $("#variable_selection_form").change(function(){
        var selectedVal = $(this).val();

        if(selectedVal == "arid")
        {
         $('#statistic_selection_form').val('delta').change();
         //$("select#statistic_selection_form").prop("selectedIndex",1);
         $(".delta,.children").show();
         $(".avg,.children").hide();
         $(".anom,.children").hide();
        }
        else if (selectedVal == "pet")
        {
         $('#statistic_selection_form').val('avg').change();
         //$("select#statistic_selection_form").prop("selectedIndex",0);
         $(".avg,.children").show();
         $(".anom,.children").hide();
         $(".delta,.children").hide();
        }
        else{
         $(".avg,.children").show();
         $(".anom,.children").show();
         $(".delta,.children").show();
        }
      });
});


/****************************************** Near-Term Climate ********************************************************/

function acquireNearTermClimate() {

    //get the data files and parse out to an array (for chart) and a dictionary (for map).
    //Called once during initial page load.

    // TEMPERATURE
    allTempDataArray=[]
    allTempDeltaDict={}

    $.ajax({
        type: "GET",
        url: static_url + "data/noaa/climate/cpcllftd.dat",
        dataType: "text",
        success: function(data) {createTemperatureDataArray(data);},
        // required for allTextLines to be global
        async: false
    });

    function createTemperatureDataArray(allText) {
        //All lines in the near-term climate text file.
        var allTextLines = allText.split(/\r\n|\n/);
        for (var i=2; i<allTextLines.length; i++) {
            allTempDataArray.push(allTextLines[i].split(/\s+/));
        }

        //Dictionary of all deltas For Setting Map Symbology
        //allTempDeltaDict[division][period]=value
        for (var i=0; i< allTempDataArray.length; i++){
            division=allTempDataArray[i][3]

            temp_climatological_mean=allTempDataArray[i][19]
            temp_forecast_mean=allTempDataArray[i][18]

            delta=temp_forecast_mean-temp_climatological_mean

            if ( !(division in allTempDeltaDict)) {
                allTempDeltaDict[division]=[]
            }
            allTempDeltaDict[division].push(delta)
        }
    }

    allPrecipDataArray=[]
    allPrecipDeltaDict={}

    // PRECIPITATION
    $.ajax({
        type: "GET",
        url: static_url + "data/noaa/climate/cpcllfpd.dat",
        dataType: "text",
        success: function(data) {createPrecipDataArray(data);},
        async: false
    });

    function createPrecipDataArray(allText) {
        var allTextLines = allText.split(/\r\n|\n/);
        for (var i=2; i<allTextLines.length; i++) {
            allPrecipDataArray.push(allTextLines[i].split(/\s+/));
        }

        for (var i=0; i< allPrecipDataArray.length; i++){
            division=allPrecipDataArray[i][3]

            precip_climatological_mean=allPrecipDataArray[i][19]
            precip_forecast_mean=allPrecipDataArray[i][18]

            delta=precip_forecast_mean-precip_climatological_mean

            if ( !(division in allPrecipDeltaDict)) {
                allPrecipDeltaDict[division]=[]
            }
            allPrecipDeltaDict[division].push(delta)
        }
    }


    firstYearInFile=allTempDataArray[0][0]
    firstMonthInFile=allTempDataArray[0][1]

}

function createDynamicMonthlyRadioButtons(){

    $(".nearTermClimateForm").empty()

    month_list=[]
    year_list=[]

    firstDateInFile=new Date(firstYearInFile,firstMonthInFile)

    for (i=0; i<15; i++) {
        locale = "en-us",
        month = firstDateInFile.toLocaleString(locale, { month: "short" });
        year = firstDateInFile.toLocaleString(locale, { year: "numeric" });
        firstDateInFile.setMonth(firstDateInFile.getMonth()+1);
        month_list[i]=month
        year_list[i]=year

    }


    date_labels=[]
    for (i=0; i<13; i++) {

        if (year_list[i] == year_list[i+1] && year_list[i+1]== year_list[i+2]){

            date_labels.push(month_list[i] + '-' + month_list[i+1] + '-' + month_list[i+2] + ' ' + year_list[i])

            $(".nearTermClimateForm").append('<input class="testDiv" type="radio" id="test-' + i + '" name="period" value="' + (i+1) + '"><div class="radio-button-circle"> </div><div class="radio-button-span" id="radio-button-span'+ i +'">'+ date_labels[i] + ' </div></input><br>')
        }
        else {

            year_span = year_list[i].slice(-2) + "-" + (parseInt(year_list[i].slice(-2)) + 1)

            date_labels.push(month_list[i] + '-' + month_list[i+1] + '-' + month_list[i+2] + ' ' + year_span)

            $(".nearTermClimateForm").append('<input class="testDiv" type="radio" id="test-' + i + '" name="period" value="' + (i+1) + '" ><div class="radio-button-circle"> </div><div class="radio-button-span" id="radio-button-span'+ i +'">' + date_labels[i] + ' </div></input><br>')

        }

    }
     $("#radio-button-span0").css({'background-color':'#D8E8CC'})
}

function generateNearTermClimateResults(period,division) {

    //Function to replace the contents of table 2 & table 3 when a user clicks on a climate division or changes the Time Frame

    //Update Climate Divsion # at the top of the tab
    $('#climateDivision').html(division)

    // TEMPERATURE
    temp_array=[]

    for (var i=0; i< allTempDataArray.length; i++){
        if (allTempDataArray[i][3] == division && allTempDataArray[i][2] == period){
            temp_array=allTempDataArray[i]
        }
    }

    temp_climatological_mean=temp_array[19]
    temp_forecast_mean=temp_array[18]
    temp_change=temp_forecast_mean-temp_climatological_mean
    temp_change_rounded=Math.round(temp_change * 100) / 100
    temp_ninety_percent_confidence_interval=temp_array[6] + "&deg;F - "  + temp_array[16] + "&deg;F"

    // PRECIPITATION
    precip_array=[]

    for (var i=0; i< allPrecipDataArray.length; i++){
        if (allPrecipDataArray[i][3] == division && allPrecipDataArray[i][2] == period){
            precip_array=allPrecipDataArray[i]
        }
    }

    precip_climatological_mean=precip_array[19]
    precip_forecast_mean=precip_array[18]
    precip_change=precip_forecast_mean-precip_climatological_mean
    precip_change_rounded=Math.round(precip_change * 100) / 100
    precip_ninety_percent_confidence_interval=precip_array[6] + " in. - "  + precip_array[16] + " in."

    //console.log(precip_array)

    //Table 2

    //Save the "Show on Map" Radio Buttons.
    var save = $('#nearTermClimateWrapper #mapRadioRow').detach();

    $('#nearTermClimateWrapper').empty();

    $('#nearTermClimateWrapper').append('<br><div id="dynamicNearTermClimateTableDiv"></div>')
    $('#dynamicNearTermClimateTableDiv').append('<table class="dynamicNearTermClimateTable" id="nearTermChangeTable"></table>');

    var nearTermClimateTable=$('#dynamicNearTermClimateTableDiv').children();

    if (temp_change_rounded > 0 ) {
        //$('#thermometerDegreeChange').html('&#9650;')
        temp_change_td_contents='<img height="17px" src="'+static_url+'img/up_arrow.png"> ' + temp_change_rounded + '&deg;F'
    }
    else if (temp_change_rounded < 0 ) {
        //$('#thermometerDegreeChange').html('&#9660')
        temp_change_td_contents='<img height="17px" src="'+static_url+'img/down_arrow.png"> ' + temp_change_rounded + '&deg;F'
    }
    else {
        temp_change_td_contents='No Change'
    }

    if (precip_change_rounded > 0 ) {
        //$('#rainGaugeChange').html('&#9650;')
        precip_change_td_contents='<img height="17px" src="'+static_url+'img/up_arrow.png"> ' + precip_change_rounded + " in."
    }
    else if (precip_change_rounded < 0 ) {
        //$('#rainGaugeChange').html('&#9660')
        precip_change_td_contents='<img height="17px" src="'+static_url+'img/down_arrow.png"> ' + precip_change_rounded + " in."
    }
    else {
        precip_change_td_contents='No Change'
    }

    nearTermClimateTable.append('<tr style="border-bottom:none !important"><td rowspan="1" style="border-right:none !important;">Variable</td>'+'<td><b>Temperature</b></td><td><b>Precipitation</b></td></tr>')
    nearTermClimateTable.append('<tr style="border-bottom:none !important"><td rowspan="1" style="border-right:none !important;">Change from the <br> Historical Mean</td>'+'<td class="changeTD">'+temp_change_td_contents+'</td><td class="changeTD">'+precip_change_td_contents+'</td></tr>')

    //Append the "Show on Map" Radio Buttons.
    nearTermClimateTable.append(save);

    //Table 3

    $('#nearTermClimateWrapper2').empty();
    $('#nearTermClimateWrapper2').append('<div id="dynamicNearTermClimateTableDiv2"></div>')
    $('#dynamicNearTermClimateTableDiv2').append('<table class="dynamicNearTermClimateTable" id="nearTermDetailsTable"></table>');

    var nearTermClimateTable2=$('#dynamicNearTermClimateTableDiv2').children();

    nearTermClimateTable2.append("<tr><td>Historical Mean </td><td>" + temp_climatological_mean+ "&deg;F</td><td>"+precip_climatological_mean+ " in.</td></tr>")
    nearTermClimateTable2.append("<tr><td>Forecast Mean</td><td>"+temp_forecast_mean+"&deg;F</td><td>"+precip_forecast_mean+" in.</td></tr>")
    nearTermClimateTable2.append("<tr><td>90% Confidence</td><td>"+temp_ninety_percent_confidence_interval+ "</td><td>"+precip_ninety_percent_confidence_interval+"</td></tr>")

    // Adjust the thermometer and rain gauge levels based on the change
    // +21 to offset for Historical Mean
    $('#thermometerAfter').css('height', (temp_change_rounded * 37 + 67) + "px")
    $('#rainGaugeAfter').css('height', (precip_change_rounded * 37 + 67) + "px")


    //test new noaa chart
    if (typeof createNoaa3Month == "function") {


                var temp_array_selected_division = []
                j = 0
                for (var i = 0; i < allTempDataArray.length; i++) {
                    if (allTempDataArray[i][3] == division) {
                        temp_array_selected_division[j] = allTempDataArray[i]
                        j += 1
                    }
                }

                //test new noaa chart
                var precip_array_selected_division = []
                j = 0
                for (var i = 0; i < allPrecipDataArray.length; i++) {
                    if (allPrecipDataArray[i][3] == division) {
                        precip_array_selected_division[j] = allPrecipDataArray[i]
                        j += 1
                    }
                }

                countTimesNoaa3MonthCalled+=1

                //Prevent NT charts from reloading if the climate divios
                //This has to be called twice for some reason in order for the charts to sync up.
                //It's currently called once at the top of this file and once in leaflet_map.js when the NT Forecast tab is clicked
                //The initialize==1 handles the case where the app is refreshed while on the NT tab.
                if (countTimesNoaa3MonthCalled <= 2 || initialize == 1 || division != previousDivision)
                {
                    createNoaa3Month(temp_array_selected_division, precip_array_selected_division)
                }

                previousDivision = division
            }
}

function showInfoPopup(layerToDescribe){

    var dbid=EEMSParams['models'][layerToDescribe][5]
    title=EEMSParams['models'][layerToDescribe][0]
    description=EEMSParams['models'][layerToDescribe][6]
    new Messi(description, {title: title, center:true, width:'1000px', modal:true, modalOpacity:.4,center: true});

}

$(window).load(function(){

     //Comment out to prevent spinner on click. Uncomment in the map draw function.
    $(document).ajaxStart(function(){
        $("#view1").css("opacity", ".1");
        $("#view2").css("opacity", ".1");
        $("#initialization_container").css("background-color", "white");
        $("#initialization_text").css("opacity", "0");
        $(".loading").css("display", "block");
    });

    $(document).ajaxComplete(function(){
        $("#view1").css("opacity", "1");
        $("#view2").css("opacity", "1");
        $(".loading").css("display", "none");
        //Handles case where initial selection is made using draw tools, and no features selected. Show getting started info again.
        $("#initialization_text").css("opacity", "1");
        //map.removeLayer(layer)

    });

//Function to start and stop automatic time cycling on the near term climate tab.

function startCycle(){

    index=$(".nearTermClimateForm input[type='radio']:checked").val();

    change = function () {
        setTimeout(function () {
            if (index > 12)
                index = 0;
            $("#test-"+index).click();
            index++;
            change();
        },
        1000);
    }

    $(function () {
        change();
    });

}

function stopCycle(){
    change='';
    clearTimeout(change)
}

$('#start').click(function(e){
    e.preventDefault();
    startCycle();
});

$('#stop').click(function(e){
    e.preventDefault();
    stopCycle();
})

preload([
    static_url + 'img/start.png',
    static_url + 'img/stop.png',
    static_url + 'img/start_hover.png',
    static_url + 'img/stop_hover.png',
    static_url + 'img/info_rotate5_hover.png',
]);

$('#cbp-spmenu-s3').html("\
   			<h3>Climate Tools & Links</h3>\
			<a href='?studyarea=ca'>California Climate Console</a>\
            <a href='http://climate.databasin.org/'>CBI Climate Center</a>\
            <a href='javascript:void(0);' id='close_explore'>&#10006</a>\
            \
			<a href='?studyarea=drecp'>DRECP Climate Console</a>\
            <a href='http://cal-adapt.org/'>Cal-Adapt</a>\
            <a href=''> &nbsp</a>\
            \
			<a href='?studyarea=utah'>Utah/Colorado Plateau Climate Console</a>\
            <a href='http://climate.calcommons.org/'>Climate Commons</a>\
            <a href=''> &nbsp</a>\
    "
)

/* Slide Out Menu Variables & Functions */
var
    menuTop = document.getElementById( 'cbp-spmenu-s3' ),
    showTop = document.getElementById( 'showTop' ),
    closeExplore = document.getElementById('close_explore')
    body = document.body;

showTop.onclick = function() {
    classie.toggle( this, 'active' );
    classie.toggle( menuTop, 'cbp-spmenu-open' );
};

closeExplore.onclick = function() {
    classie.toggle( showTop, 'active' );
    classie.toggle( menuTop, 'cbp-spmenu-open' );
};


});//]]>

function preload(arrayOfImages) {
    //Image Preloader

    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
        // Alternatively you could use:
        // (new Image()).src = this;
    });
}

$(function() {
    //Mouse over and click functions on the start/stop buttons.

    $('#startDiv').on({
        mouseover: function(){
            $(this).css('background-image', 'url(' + static_url + 'img/start_hover.png');
        },
         mouseleave: function(){
             $(this).css('background-image', 'url(' + static_url + 'img/start.png');
        },
        click: function(){
            $(this).off('mouseleave');
            $(this).css('background-image', 'url(' + static_url + 'img/start_hover.png');
            $('#stopDiv').css('background-image', 'url(' + static_url + 'img/stop.png');
        }
    });

    $('#stopDiv').on({
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
            $('#startDiv').css('background-image', 'url(' + static_url + 'img/start.png');
            //Need this in order to make the mouseout work on the start button again for some reason.
            $('#startDiv').on({
                 mouseleave: function(){
                     $(this).css('background-image', 'url(' + static_url + 'img/start.png');
                 }
            });
        }
    });
});

function update_slider_label(value){
    if (value <=-.75){
        return "Very Low"
    }
    else if (value <=-.5){
        return "Low"
    }
    else if (value <=0){
        return "Moderately Low"
    }
    else if (value <=.5){
        return "Moderately High"
    }
    else if (value <=.75){
        return "High"
    }
    else {
        return "Very High"
    }
}

function changeUnits(units){
    unitsForChart=units;
    if (typeof layerToAddName != 'undefined'){
        swapLegend(layerToAddName, null, document.getElementById("variable_selection_form").value);
    }
    updateData(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value,document.getElementById("season_selection_form").value);
}


function animateClickToMapInfoBox(){
    $('.clickToMapInfo').delay(1000).animate({"right":"100px"},900);
    $('.clickToMapInfo').animate({"right":"80px"},600);
}
 // Apply events to text elements (SVG) and spans within the legend (VML + modern browsers with useHTML option).


