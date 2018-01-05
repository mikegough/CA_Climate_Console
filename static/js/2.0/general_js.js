 $(document).ready(function(){

     var currentDate=new Date();
     currentYear=currentDate.getFullYear();

     document.title=title + " Climate Console";
     //$("#view1Link").click()

    //Prepare Near Term Forecast

    previousDivision='';
    countTimesNoaa3MonthCalled=0;
    //Initialize Selected Time Frame
    selectedNearTermClimatePeriod=1;

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
     if (enableDownscale) {
         create_post_downscale(initialDownscaleMarkerLon, initialDownscaleMarkerLat)
         $('#downscaled_coords').html(initialDownscaleMarkerLon + ", " + initialDownscaleMarkerLat)
     }

     //If using introJs, the function needs to be called in the script section at the bottom of the template.
     if (typeof introJs  == "function") {

         $('.leaflet-control-layers').each(function (i) {
             $(this).attr('data-step', '1');
             $(this).attr('data-intro', '<b>Reporting units</b> define the ecological or administrative boundaries for which the climate projections will be calculated. By selecting counties, for example, you will be able to examine the climate projections for a specified county or counties of interest.')
         });

         $('.leaflet-draw').each(function (i) {
             $(this).attr('data-step', '2');
             //$(this).attr('data-intro','<b>Select a feature or set of features in the map.</b><br>A feature refers to a polygon delineating a specific administrative or ecological boundary. For example, a county or watershed. You can use one of the selection tools on the left to select multiple features, or simply click on a single feature of interest in the map.')
             $(this).attr('data-intro', 'A <b>feature</b> refers to a specific administrative or ecological boundary in the reporting units layer selected above. For example, a county or watershed. You can use one of the selection tools on the left to select multiple features (selected features will be those that intersect the drawn shape), or simply click on a single feature of interest in the map.')
         });

         $('.leaflet-geonames-search').each(function (i) {
             $(this).attr('data-step', '3')
             $(this).attr('data-intro', 'You can also click here to select a feature based on the location of a specified place name.')
         });

         //ShowBullets is not working. Set dispay=none for the .introjs-bullets class in the css file instead.
         //gettingStartedIntro.setOptions({'showStepNumbers': false, 'showBullets': 'false', 'tooltipPosition': 'right'});
         gettingStartedIntro.setOptions({ 'showStepNumbers': false, 'showBullets': 'false', 'tooltipPosition': 'left', 'exitOnOverlayClick': true, 'showProgress': false});
     }

    /*  If we decide to make the link go to the About tab.*/
     $("#modelInfoLink").click(function() {
         document.getElementById("view3Link").click();
         //Only want to calculate this once
         if (typeof aboutClimateDataAnchor == 'undefined') {
             //fix for page reload
             $("#view3").scrollTop(0);
             aboutClimateDataAnchor = $("#aboutClimateData").offset().top - $("#view3").offset().top - 10
         }
         $("#view3").scrollTop(aboutClimateDataAnchor);
         return false;
     });

     $("#weatherInfoLink").click(function() {
         document.getElementById("view3Link").click();
         //Only want to calculate this once
         if (typeof aboutWeatherDataAnchor == 'undefined') {
             //fix for page reload
             $("#view3").scrollTop(0);
             aboutWeatherDataAnchor = $("#aboutWeatherData").offset().top - $("#view3").offset().top - 10
         }
         $("#view3").scrollTop(aboutWeatherDataAnchor);
         return false;
     });

     $("#EEMSInfoLink").click(function() {
         document.getElementById("view3Link").click();
         //Only want to calculate this once
         if (typeof aboutEEMSDataAnchor == 'undefined') {
             //fix for page reload
             $("#view3").scrollTop(0);
             aboutEEMSDataAnchor = $("#aboutEEMSData").offset().top - $("#view3").offset().top - 10
         }
         $("#view3").scrollTop(aboutEEMSDataAnchor);
         return false;
     });

     $("#EcosystemServicesInfoLink").click(function() {
         document.getElementById("view3Link").click();
         //Only want to calculate this once
         if (typeof aboutEcosystemServicesDataAnchor == 'undefined') {
             //fix for page reload
             $("#view3").scrollTop(0);
             aboutEcosystemServicesDataAnchor = $("#aboutEcosystemServicesData").offset().top - $("#view3").offset().top - 10
         }
         $("#view3").scrollTop(aboutEcosystemServicesDataAnchor);
         return false;
     });

     $(".additionalFeaturesCount").click(function() {
            $('.selectedFeaturesFullList').empty()
            $(".selectedFeaturesShortList").hide()
            $(".closeSelectedFeaturesFullList").show()
            $(".additionalFeaturesCount").hide()

            $('.selectedFeaturesFullList').append('<br><div class="selectedFeaturesFullListTableContainer"></div>')
            $('.selectedFeaturesFullListTableContainer').append('<table class="selectedFeaturesFullListTable" class="selectedFeaturesTable"></table>');
            var selectedFeaturesTable=$('.selectedFeaturesFullListTableContainer').children();

            $('.selectedFeaturesFullList').show()

            var count = 1
            listOfSelectedFeatures = ""
            categoricalValuesArray = response['categoricalValues']
            //console.log(categoricalValuesArray)

            for (var i = 0, tot = categoricalValuesArray.length; i < tot; i++) {

                listOfSelectedFeatures = listOfSelectedFeatures + "<div class='selectedFeaturesText' onmouseout='mouseOutTextChangeBack()' onmouseover='mouseOverTextChangeColor(\"" + categoricalValuesArray[i] + "\")' id='" + categoricalValuesArray[i] + "' >" + count + ". " + categoricalValuesArray[i] + "<span class='inner'></span></div>";

                count = count + 1
            }

            selectedFeaturesTable.append("<tr><td>" + listOfSelectedFeatures + "</td></tr>")

     });

     $(".closeSelectedFeaturesFullListLink").click(function(){
         $(".closeSelectedFeaturesFullList").hide()
         $(".selectedFeaturesShortList").show()
         $(".additionalFeaturesCount").show()
         $('.selectedFeaturesFullList').empty()
         $('.selectedFeaturesFullList').hide()

     })

     /* Hover over legend tip */
     /*
     var moveLeft = -350;
     var moveDown = 24;

     $('#modelInfoLink').hover(function(e) {

        $("div#pop-up2").html(modelInfoText)

        $('div#pop-up2').fadeIn(300);
        }, function() {
          $('div#pop-up2').stop(true,true).hide(100);
        });

        $('#modelInfoLink').mousemove(function(e) {
            if (e.pageX > 1475) {
                $("div#pop-up2").css('top', e.pageY + moveDown).css('left', e.pageX + moveLeft -108);
            }
            else {
                $("div#pop-up2").css('top', e.pageY + moveDown).css('left', e.pageX + moveLeft);
            }
        });

     weatherInfoText="The near-term weather forecast data presented on this tab streams directly from the forecast distribution files generated by NOAA's Climate Prediction Center (click on the \"About\" tab for direct links to these files).<p> The data in these files represent probability of exceedance values. The field headers (98, 95, 90 ,80, 70, 60, 50, 40, 30, 20, 10, 5, 2) indicate the probability that the actual temperature or precipitation level during the three month period expressed by the LEAD time will be greater than the stated value within the specified climate division (CD). <p>The historical means and forecast means displayed above come directly from the values in the climatological mean field (C MEAN) and the forecast mean field (F MEAN), respectively. The forecast mean corresponds to the 50% probability of exceedance value. These data are automatically updated on the third Thursday of each month.<p> Reference: Barnston et al., 2000, Bull. Amer. Meteor. Soc. 81:1271-1279<br> Source: http://www.cpc.ncep.noaa.gov/"

     $('#weatherInfoLink').hover(function(e) {

         $("div#pop-up2").html(weatherInfoText)

         $('div#pop-up2').fadeIn(300);
     }, function() {
         $('div#pop-up2').stop(true,true).hide(100);
     });

     $('#weatherInfoLink').mousemove(function(e) {
         if (e.pageX > 1475) {
             $("div#pop-up2").css('top', e.pageY + moveDown).css('left', e.pageX + moveLeft -108);
         }
         else {
             $("div#pop-up2").css('top', e.pageY + moveDown).css('left', e.pageX + moveLeft);
         }
     });
     */
     $("#view1").scroll(function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
             $('#scroll_for_more').fadeOut( 'fast' );
        }
         else {
              $('#scroll_for_more').fadeIn( 'fast' );
          }

     });

    // Metadata Download
     $(".info3_icon").on("click", function(){

         var opt = {
            autoOpen: false,
            modal: true,
            title: "Climate Console Data Download Information"
        };

         var this_info_button_id = this.id;
         var this_content_id = this.id + "_content";
         var this_title = this.title;
         var pdf_button_id = this.id + "_pdf";

         $("#"+ this_content_id).remove();

         // Get the associated metadata file and load it into a div.
         $.get(static_url + "data/metadata/" + this_info_button_id + ".html", function(data) {
             // Needed to wrap button in a div with an id, in order to hide the button in the pdf.
             var pdf_button = "<div id='pdf_button_container'><button id='" + pdf_button_id + "' class='save_as_pdf_button'>Save as PDF</button></div>";
             $("<div id='" + this_content_id + "' class='metadata_div'/>").html(pdf_button + data).dialog(opt).dialog("open");
         }).done(function(){
             var pdf_content = $("#" + this_content_id).get(0);
             var doc = new jsPDF('p', 'mm', 'legal');
             // After the file has been loaded, add PDF creation action to button. // specialElementHandlers is used to Ignore the save as pdf button
             var specialElementHandlers = {
                 '#pdf_button_container': function (element, renderer) {
                     return true;
                 }
             };

             $('#'+ pdf_button_id).on("click", function () {
                 doc.fromHTML(pdf_content, 10, 10, {
                     'width': 192,
                     'pagesplit': true,
                     'elementHandlers': specialElementHandlers
                 });
                 doc.save(this_title);
             });

         });
     });

     $('.tab_help').click(function (evt) {
         evt.stopPropagation();
         return false;
     });


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

function EnglishUnitsConversionQuickTable(dataValue,climateVariable){

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
        else {
            var factor=1
        }

        //Turns out precip deltas for the DRECP are mm
        if ((climateVariable == 'prec' || climateVariable == 'pred')  && title == 'DRECP'){
                var factor=0.03936996
        }

        convertedValue=dataValue*factor
    }

    roundedConvertedValue=Number(convertedValue.toFixed(2));
    return roundedConvertedValue
}

var season_labels={};
season_labels["s0"] = 'Annual';
season_labels["s1"] = 'Jan-Feb-Mar';
season_labels["s2"] = 'Apr-May-Jun';
season_labels["s3"] = 'Jul-Aug-Sep';
season_labels["s4"] = 'Oct-Nov-Dec';

function updateQuickViewTable(season,model){

            if (typeof model == "undefined"){
                if (typeof model_code_dropdown == "undefined"){
                        model_code_dropdown = "ee"
                    }
            }
            else{
                model_code_dropdown = model
            }

            $('#seasonLabel').html(season_labels[season]);

             if (unitsForChart == "english") {

                //Update Quick Table
                $('#quick_value_tmax_t1').html(EnglishUnitsConversionQuickTable(resultsJSON[model_code_dropdown + 'tmad' + season + 't1_avg'], 'tmad'))
                $('#quick_value_tmax_t2').html(EnglishUnitsConversionQuickTable(resultsJSON[model_code_dropdown + 'tmad' + season + 't2_avg'], 'tmad'))

                $('#quick_value_tmin_t1').html(EnglishUnitsConversionQuickTable(resultsJSON[model_code_dropdown + 'tmid' + season + 't1_avg'], 'tmid'))
                $('#quick_value_tmin_t2').html(EnglishUnitsConversionQuickTable(resultsJSON[model_code_dropdown + 'tmid' + season + 't2_avg'], 'tmid'))

                $('#quick_value_precip_t1').html(EnglishUnitsConversionQuickTable(resultsJSON[model_code_dropdown + 'pred' + season + 't1_avg'], 'pred'))
                $('#quick_value_precip_t2').html(EnglishUnitsConversionQuickTable(resultsJSON[model_code_dropdown + 'pred' + season + 't2_avg'], 'pred'))

                $('#quick_value_aridity_t1').html(EnglishUnitsConversionQuickTable(resultsJSON[model_code_dropdown + 'arid' + season + 't1_avg'], 'arid'))
                $('#quick_value_aridity_t2').html(EnglishUnitsConversionQuickTable(resultsJSON[model_code_dropdown + 'arid' + season + 't2_avg'], 'arid'))

                $('.quick_value_temp_units').each(function() {
                    $(this).html('F');
                });

                /*
                $('.quick_value_pet_units').each(function() {
                     $(this).html('in');
                 });
                */

                if (title=="DRECP") {
                     $('.quick_value_precip_units').each(function () {
                         $(this).html('in');
                     });
                }


            }

            else {

                //Update Quick Table
                $('#quick_value_tmax_t1').html(resultsJSON[model_code_dropdown + 'tmad' + season + 't1_avg'])
                $('#quick_value_tmax_t2').html(resultsJSON[model_code_dropdown + 'tmad' + season + 't2_avg'])

                $('#quick_value_tmin_t1').html(resultsJSON[model_code_dropdown + 'tmid' + season + 't1_avg'])
                $('#quick_value_tmin_t2').html(resultsJSON[model_code_dropdown + 'tmid' + season + 't2_avg'])

                $('#quick_value_precip_t1').html(resultsJSON[model_code_dropdown + 'pred' + season + 't1_avg'])
                $('#quick_value_precip_t2').html(resultsJSON[model_code_dropdown + 'pred' + season + 't2_avg'])

                $('#quick_value_aridity_t1').html(resultsJSON[model_code_dropdown + 'arid' + season + 't1_avg'])
                $('#quick_value_aridity_t2').html(resultsJSON[model_code_dropdown + 'arid' + season + 't2_avg'])

                $('.quick_value_temp_units').each(function() {
                    $(this).html('C');
                });

                /*
                $('.quick_value_pet_units').each(function() {
                     $(this).html('mm');
                });
                */

                if (title=="DRECP") {

                     $('.quick_value_precip_units').each(function () {
                         $(this).html('mm');
                     });
                }

            }

            $('#quick_value_vpr_t1').html(resultsJSON[model_code_dropdown + 'vpd' + season + 't1_avg'])
            $('#quick_value_vpr_t2').html(resultsJSON[model_code_dropdown + 'vpd' + season + 't2_avg'])

            // Since there is no PET change, need to calculate on the fly
            if (Object.keys(resultsJSON).length != 0 && typeof resultsJSON['pmpet' + season + 't0_avg'] != "undefined"){
                var pet_hist = resultsJSON['pmpet' + season + 't0_avg'].toFixed(2);
                var pet_ee_t1 = resultsJSON[model_code_dropdown + 'pet' + season + 't1_avg'].toFixed(2);
                var pet_ee_t2 = resultsJSON[model_code_dropdown + 'pet' + season + 't2_avg'].toFixed(2);
                var pet_ee_t1_delta = ((pet_ee_t1 - pet_hist) / pet_hist * 100).toFixed(2);
                var pet_ee_t2_delta = ((pet_ee_t2 - pet_hist) / pet_hist * 100).toFixed(2);

                $('#quick_value_pet_t1').html(pet_ee_t1_delta);
                $('#quick_value_pet_t2').html(pet_ee_t2_delta);
            }

            // Precip text modifications
            if (resultsJSON[model_code_dropdown + 'pred' + season + 't1_avg'] < 0) {
                //$('#arrow_dir_precip_t1').html("<i class='wi wi-rotate-0  wi-direction-down'></i>")
                $('#increase_or_decrease_precip_t1').html("fall below")
            }
            else {
                //$('#arrow_dir_precip_t1').html("<i class='wi wi-rotate-0  wi-direction-up'></i>")
                $('#increase_or_decrease_precip_t1').html("exceed")
            }

            // Both time periods increase or both time periods decrease.
            if ((resultsJSON[model_code_dropdown + 'pred' + season + 't1_avg'] < 0 && resultsJSON[model_code_dropdown + 'pred' + season + 't2_avg']< 0) || (resultsJSON[model_code_dropdown + 'pred' + season + 't1_avg'] > 0 && resultsJSON[model_code_dropdown + 'pred' + season + 't2_avg'] > 0)) {
                //$('#arrow_dir_precip_t2').html("<i class='wi wi-rotate-0  wi-direction-down'></i>")
                $('#increase_or_decrease_precip_t2').html("")
            }

            // Decrease during the second time period and increase during the first time period
            else if (resultsJSON[model_code_dropdown + 'pred' + season + 't2_avg'] < 0 && resultsJSON[model_code_dropdown + 'pred' + season + 't1_avg'] > 0) {
                //$('#arrow_dir_precip_t2').html("<i class='wi wi-rotate-0  wi-direction-down'></i>")
                $('#increase_or_decrease_precip_t2').html("decrease ")
            }

            // Increase during the second time period and decrease during the first time period
            else if (resultsJSON[model_code_dropdown + 'pred' + season + 't2_avg'] > 0 && resultsJSON[model_code_dropdown + 'pred' + season + 't1_avg'] < 0) {
                //$('#arrow_dir_precip_t2').html("<i class='wi wi-rotate-0  wi-direction-up'></i>")
                $('#increase_or_decrease_precip_t2').html("increase ")
            }

            // Aridity text modifications
            if (resultsJSON[model_code_dropdown + 'arid' + season + 't1_avg'] < 0) {
                $('#increase_or_decrease_aridity_t1').html("fall below")
            }
            else {
                $('#increase_or_decrease_aridity_t1').html("exceed")
            }

            // Both time periods increase or both time periods decrease.
            if ((resultsJSON[model_code_dropdown + 'arid' + season + 't1_avg'] < 0 && resultsJSON[model_code_dropdown + 'arid' + season + 't2_avg'] < 0) || (resultsJSON[model_code_dropdown + 'arid' + season + 't1_avg'] > 0 && resultsJSON[model_code_dropdown + 'arid' + season + 't2_avg'] > 0)) {
                $('#increase_or_decrease_aridity_t2').html("")
            }

            // Decrease during the second time period and increase during the first time period
            else if (resultsJSON[model_code_dropdown + 'arid' + season + 't2_avg'] < 0 && resultsJSON[model_code_dropdown + 'arid' + season + 't1_avg'] > 0) {
                $('#increase_or_decrease_aridity_t2').html("decrease ")
            }

            // Increase during the second time period and decrease during the first time period
            else if (resultsJSON[model_code_dropdown + 'arid' + season + 't2_avg'] > 0 && resultsJSON[model_code_dropdown + 'arid' + season + 't1_avg'] < 0) {
                $('#increase_or_decrease_aridity_t2').html("increase ")
            }

            // VPR text modifications
            if (resultsJSON[model_code_dropdown + 'vpd' + season + 't1_avg'] < 0) {
                $('#increase_or_decrease_vpr_t1').html("fall below")
            }
            else {
                $('#increase_or_decrease_vpr_t1').html("exceed")
            }

            // Both time periods increase or both time periods decrease.
            if ((resultsJSON[model_code_dropdown + 'vpd' + season + 't1_avg'] < 0 && resultsJSON[model_code_dropdown + 'vpd' + season + 't2_avg'] < 0) || (resultsJSON[model_code_dropdown + 'vpd' + season + 't1_avg'] > 0 && resultsJSON[model_code_dropdown + 'vpd' + season + 't2_avg'] > 0)) {
                $('#increase_or_decrease_vpr_t2').html("")
            }

            // Decrease during the second time period and increase during the first time period
            else if (resultsJSON[model_code_dropdown + 'vpd' + season + 't2_avg'] < 0 && resultsJSON[model_code_dropdown + 'vpd' + season + 't1_avg'] > 0) {
                $('#increase_or_decrease_vpr_t2').html("decrease ")
            }

            // Increase during the second time period and decrease during the first time period
            else if (resultsJSON[model_code_dropdown + 'vpd' + season + 't2_avg'] > 0 && resultsJSON[model_code_dropdown + 'vpd' + season + 't1_avg'] < 0) {
                $('#increase_or_decrease_vpr_t2').html("increase ")
            }

            // PET text modifications
            if (pet_ee_t1_delta < 0) {
                $('#increase_or_decrease_pet_t1').html("fall below")
            }
            else {
                $('#increase_or_decrease_pet_t1').html("exceed")
            }

            // Both time periods increase or both time periods decrease.
            if ( (pet_ee_t1_delta < 0 && pet_ee_t2_delta < 0) || ( pet_ee_t1_delta > 0 && pet_ee_t2_delta  > 0) ) {
                $('#increase_or_decrease_pet_t2').html("")
            }

            // Decrease during the second time period and increase during the first time period
            else if (pet_ee_t2_delta < 0 && pet_ee_t1_delta > 0) {
                $('#increase_or_decrease_pet_t2').html("decrease ")
            }

            // Increase during the second time period and decrease during the first time period
            else if (pet_ee_t2_delta  > 0 && pet_ee_t1_delta < 0) {
                $('#increase_or_decrease_pet_t2').html("increase ")
            }

            $("#modelLabel").html($("#model_selection_formSelectBoxItText").text())
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
        else if (selectedVal == "pet" || selectedVal == "vpr")
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
    allTempDataArray=[];
    allTempDeltaDict={};

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
            division=allTempDataArray[i][3];

            temp_climatological_mean=allTempDataArray[i][19];
            temp_forecast_mean=allTempDataArray[i][18];

            delta=temp_forecast_mean-temp_climatological_mean;

            if ( !(division in allTempDeltaDict)) {
                allTempDeltaDict[division]=[]
            }
            allTempDeltaDict[division].push(delta)
        }
    }

    allPrecipDataArray=[];
    allPrecipDeltaDict={};

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
            division=allPrecipDataArray[i][3];

            precip_climatological_mean=allPrecipDataArray[i][19];
            precip_forecast_mean=allPrecipDataArray[i][18];

            delta=precip_forecast_mean-precip_climatological_mean;

            if ( !(division in allPrecipDeltaDict)) {
                allPrecipDeltaDict[division]=[]
            }
            allPrecipDeltaDict[division].push(delta)
        }
    }


    firstYearInFile=allTempDataArray[0][0];
    firstMonthInFile=allTempDataArray[0][1];

}

month_names_short=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function createDynamicMonthlyRadioButtons(){

    $(".nearTermClimateForm").empty();

    month_list=[];
    year_list=[];

    //The inintial lead of "1" in the file is automatically factored in since new Date(2016,2) returns March.
    firstDateInFile=new Date(firstYearInFile,firstMonthInFile)

    for (i=0; i<15; i++) {
        //firstDateInFile.getMonth() below for March returns 2, which is the correct index for March in the short list array.
        //If the first month in the file is a 2, the first value stored in the month variable will be a 3
        //which is what is wanted because of the lead.
        month = month_names_short[firstDateInFile.getMonth()];
        year = String(firstDateInFile.getFullYear());
        firstDateInFile.setMonth(firstDateInFile.getMonth()+1);
        month_list[i]=month;
        year_list[i]=year;

    }


    date_labels=[]
    for (i=0; i<13; i++) {

        if (year_list[i] == year_list[i+1] && year_list[i+1]== year_list[i+2]){

            date_labels.push(month_list[i] + '-' + month_list[i+1] + '-' + month_list[i+2] + ' ' + year_list[i]);

            $(".nearTermClimateForm").append('<input class="testDiv" type="radio" id="test-' + i + '" name="period" value="' + (i+1) + '"><div class="radio-button-circle"> </div><div class="radio-button-span" id="radio-button-span'+ i +'">'+ date_labels[i] + ' </div></input><br>')
        }
        else {

            year_span = year_list[i].slice(-2) + "-" + (parseInt(year_list[i].slice(-2)) + 1);

            date_labels.push(month_list[i] + '-' + month_list[i+1] + '-' + month_list[i+2] + ' ' + year_span);

            $(".nearTermClimateForm").append('<input class="testDiv" type="radio" id="test-' + i + '" name="period" value="' + (i+1) + '" ><div class="radio-button-circle"> </div><div class="radio-button-span" id="radio-button-span'+ i +'">' + date_labels[i] + ' </div></input><br>')

        }

    }
     $("#radio-button-span0").css({'background-color':'#D8E8CC'})
}

function generateNearTermClimateResults(period,division) {

    //Function to replace the contents of table 2 & table 3 when a user clicks on a climate division or changes the Time Frame

    //Update Climate Divsion # at the top of the tab
    $('#climateDivision').html(division);

    // TEMPERATURE
    temp_array=[]

    for (var i=0; i< allTempDataArray.length; i++){
        if (allTempDataArray[i][3] == division && allTempDataArray[i][2] == period){
            temp_array=allTempDataArray[i]
        }
    }

    temp_climatological_mean=Number(temp_array[19]);
    temp_forecast_mean=Number(temp_array[18]);
    temp_change=temp_forecast_mean-temp_climatological_mean;
    temp_change_rounded=Math.round(temp_change * 100) / 100;
    temp_ninety_percent_confidence_interval=temp_array[6] + "&deg;F - "  + temp_array[16] + "&deg;F";

    // PRECIPITATION
    precip_array=[];

    for (var i=0; i< allPrecipDataArray.length; i++){
        if (allPrecipDataArray[i][3] == division && allPrecipDataArray[i][2] == period){
            precip_array=allPrecipDataArray[i]
        }
    }

    precip_climatological_mean=precip_array[19];
    precip_forecast_mean=precip_array[18];
    precip_change=precip_forecast_mean-precip_climatological_mean;
    precip_change_rounded=Math.round(precip_change * 100) / 100;
    precip_ninety_percent_confidence_interval=precip_array[6] + " in. - "  + precip_array[16] + " in.";

    //console.log(precip_array)

    //Table 2

    //Save the "Show on Map" Radio Buttons.
    var save = $('#nearTermClimateWrapper #mapRadioRow').detach();

    $('#nearTermClimateWrapper').empty();

    $('#nearTermClimateWrapper').append('<br><div id="dynamicNearTermClimateTableDiv"></div>');
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
    nearTermClimateTable.append('<tr style="border-bottom:none !important"><td rowspan="1" style="border-right:none !important;">Change from the <br> Historical Mean*</td>'+'<td class="changeTD">'+temp_change_td_contents+'</td><td class="changeTD">'+precip_change_td_contents+'</td></tr>')

    //Append the "Show on Map" Radio Buttons.
    nearTermClimateTable.append(save);

    //Table 3

    $('#nearTermClimateWrapper2').empty();
    $('#nearTermClimateWrapper2').append('<div id="dynamicNearTermClimateTableDiv2"></div>');
    $('#dynamicNearTermClimateTableDiv2').append('<table class="dynamicNearTermClimateTable" id="nearTermDetailsTable"></table>');

    var nearTermClimateTable2=$('#dynamicNearTermClimateTableDiv2').children();

    nearTermClimateTable2.append("<tr><td>Historical Mean*</td><td>" + temp_climatological_mean+ "&deg;F</td><td>"+precip_climatological_mean+ " in.</td></tr>");
    nearTermClimateTable2.append("<tr><td>Forecast Mean</td><td>"+temp_forecast_mean+"&deg;F</td><td>"+precip_forecast_mean+" in.</td></tr>");
    nearTermClimateTable2.append("<tr><td>90% Confidence</td><td>"+temp_ninety_percent_confidence_interval+ "</td><td>"+precip_ninety_percent_confidence_interval+"</td></tr>");

    // Adjust the thermometer and rain gauge levels based on the change
    // +21 to offset for Historical Mean
    $('#thermometerAfter').css('height', (temp_change_rounded * 37 + 67) + "px");
    $('#rainGaugeAfter').css('height', (precip_change_rounded * 37 + 67) + "px");


    //test new noaa chart
    if (typeof createNoaa3Month == "function") {


                var temp_array_selected_division = [];
                j = 0;
                for (var i = 0; i < allTempDataArray.length; i++) {
                    if (allTempDataArray[i][3] == division) {
                        temp_array_selected_division[j] = allTempDataArray[i];
                        j += 1
                    }
                }

                //test new noaa chart
                var precip_array_selected_division = [];
                j = 0;
                for (var i = 0; i < allPrecipDataArray.length; i++) {
                    if (allPrecipDataArray[i][3] == division) {
                        precip_array_selected_division[j] = allPrecipDataArray[i]
                        j += 1
                    }
                }

                countTimesNoaa3MonthCalled+=1;

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
    description=EEMSParams['models'][layerToDescribe][8]
    new Messi(description, {title: title, center:true, width:'1000px', modal:true, modalOpacity:.4,center: true});

}

$(window).load(function(){

     //Comment out to prevent spinner on click. Uncomment in the map draw function.
    $(document).ajaxStart(function(){
        // wrap view1 in a span to fix chrome bug where the quickview table's opacity wouldn't change.
        $("#view1_contents").css("opacity", ".1");
        $("#view2").css("opacity", ".1");
        $("#view3").css("opacity", ".1");
        $("#view5").css("opacity", ".1");
        $("#view6").css("opacity", "0");
        $("#initialization_container").css("background-color", "white");
        $("#initialization_text").css("opacity", "0");
        $(".loading").css("display", "block");
    });

    $(document).ajaxComplete(function(){
        $("#view1_contents").css("opacity", "1");
        $("#view2").css("opacity", "1");
        $("#view3").css("opacity", "1");
        $("#view5").css("opacity", "1");
        $("#view6").css("opacity", "1");
        $(".loading").css("display", "none");
        //Handles case where initial selection is made using draw tools, and no features selected. Show getting started info again.
        $("#initialization_text").css("opacity", "1");
        //map.removeLayer(layer)

        //Update MEEMSE2.0 values
        if (typeof st != 'undefined' && typeof resultsJSON[modelForTree+"_avg"] != 'undefined') {

            $(".EEMS_Tree_Value").remove();
            $("#" + top_node).append("<div class='EEMS_Tree_Value'>" + resultsJSON[modelForTree + "_avg"] + "</div>")
        }

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
        2000);
    };

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

$('#start2').click(function(e){
    e.preventDefault();
    animateMap();
    $(".info").html("");
});

$('#stop2').click(function(e){
    e.preventDefault();
    animationState = "off"
     $.each(timeouts, function (_, id) {
       clearTimeout(id);
    });
    timeouts = [];
})

$('#start3').click(function(e){
    e.preventDefault();
    animateMapContinuous()
});

$('#stop3').click(function(e){
    e.preventDefault();
    animationState = "off"
     $.each(timeouts, function (_, id) {
       clearTimeout(id);
    });
    timeouts = [];
})


preload([
    static_url + 'img/start.png',
    static_url + 'img/stop.png',
    static_url + 'img/start_hover.png',
    static_url + 'img/stop_hover.png',
    static_url + 'img/info_rotate5_hover.png',
]);

// Create the header links from the links object in the config file.
$('#cbp-spmenu-s3').html("<h3>Climate Tools & Links</h3>");

if (typeof headerLinks != "undefined") {
    var link_count = 1;
    $.each(headerLinks, function (key, value) {

        if (link_count == 3) {
            $('#cbp-spmenu-s3').append("<a href='javascript:void(0);' id='close_explore'>&#10006</a>")
        }

        $('#cbp-spmenu-s3').append("<a href='" + value + "'>" + key + "</a>")
        link_count += 1
    });

    /* Slide Out Menu Variables & Functions */
    var
        menuTop = document.getElementById( 'cbp-spmenu-s3' ),
        showTop = document.getElementById( 'showTop' ),
        closeExplore = document.getElementById('close_explore'),
        body = document.body;

    showTop.onclick = function() {
        classie.toggle( this, 'active' );
        classie.toggle( menuTop, 'cbp-spmenu-open' );
    };

    closeExplore.onclick = function() {
        classie.toggle( showTop, 'active' );
        classie.toggle( menuTop, 'cbp-spmenu-open' );
    };

}

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


function changeUnits(units){
    unitsForChart=units;
    if (typeof layerToAddName != 'undefined' && typeof modelName != 'undefined'){
        swapLegend(layerToAddName, null, document.getElementById("variable_selection_form").value, modelName);
    }
    updateData(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value,document.getElementById("season_selection_form").value);

    updateQuickViewTable(document.getElementById("season_selection_form").value)
}


function animateClickToMapInfoBox(){
    $('.clickToMapInfo').delay(1000).animate({"right":"100px"},900);
    $('.clickToMapInfo').animate({"right":"80px"},600);
}

function updateEcosystemServicesCharts(dropDownValue) {
    createAreaChart(dropDownValue);
    if (typeof createSplineChart == "function") {
        createSplineChart(dropDownValue);
    }
    // lastThingViewed gets set to continuous when the user clicks a point in the continuous chart.
    // if the last thing the looked at in the map was veg_type, load a new veg type PNG on model dropdown change
    if (typeof lastThingViewed == "undefined" || lastThingViewed != "continuous") {
        swapImageOverlay("vtype_agg_" + dropDownValue + "__" + pngCloverYear, "EcosystemServices")
    }
    // otherwise change it to the new continous model
    else {
        var previous_model = pngName.split("__")[0].split("_").pop()
        var new_mc2_pngName = pngName.replace(previous_model,dropDownValue)
        swapImageOverlay(new_mc2_pngName, "EcosystemServices")
    }

}
 function updateClimateHelpContent(){
     gettingStartedIntro2 = introJs();
     gettingStartedIntro2.setOptions({
         'showStepNumbers': false,
         'showBullets': 'false',
         'tooltipPosition': 'left'
     });
     /*
     $('#all_point_chart_goodies').each(function (i) {
         $(this).attr('data-step', '1');
         $(this).attr('data-intro', '<div id="climate_chart_help_content"><b>The observed past and the projected future</b><p>This chart shows the historical climate conditions for the period ' +  (climateParams['timePeriodLabels'][0]).replace('Historical','').replace('<br>','') + ' within the selected area, as well as the modeled projections for a set of future time periods.<p>Each value represents the mean average calculated across the selected area and the time period indicated on the x-axis. You can use the dropdown menus at the top to specify what data to plot in the chart. <div>Clicking any point in the chart will display the corresponding dataset in the map. For more information about the climate data click on the <img src="'+static_url+ 'img/info.png"> tab.</div>');
     });
     */
     gettingStartedIntro2.goToStep(1).start();
 }

function addEventHandlerForModelChange(){

    // Only for model change. All other dropdowns need to go through the updateData function to plot the new data.
    // The chart data doesn't need to be changed when a new model is selected from the dropdown.
    // Change color of selected point & update quickview table on drop-down change (could get here from point click as well).
    $("#model_selection_form").on("change", function () {

        // Set point colors back to their default colors.
        if (typeof last_model_id != "undefined") {
            chart.series[last_model_id].update({
                color: climateParams['models'][last_model_name][1]
            });
        }
        // Show selected model point as red
        chart.series[this.value].update({
            color: "red"
        });

        chart.series[this.value].markerGroup.toFront();
        last_model_name = chart.series[this.value].name;
        last_model_id = this.value;
        var modelCode  = climateParams['models'][last_model_name][0];
        var season = document.getElementById("season_selection_form").value;
        var variable = document.getElementById("variable_selection_form").value;
        var statistic = document.getElementById("statistic_selection_form").value;

        updateQuickViewTable(season,modelCode);

        // Call function below to show new image overlay
        var modelIndex = this.value;
        if (typeof activeTimePeriod != "undefined") {
            changeImageOverlayBasedOnNewDropdownSelection(modelIndex,variable,season,statistic)
        }

    });

     // Trigger once on initial select
     var selected_model_dropdown = $("#model_selection_form").val();
     $("#model_selection_form").val(selected_model_dropdown).trigger('change');
}

var last_pngCode;

 // On dropdown change, swap image overlay
function changeImageOverlayBasedOnNewDropdownSelection(modelIndex,climateVariable,season,statistic) {

        // Remove image overlay and deselect points.
        //swapImageOverlay("single_transparent_pixel")
        selectedPoints = chart.getSelectedPoints();
        if (selectedPoints.length > 0) {
            selectedPoints[0].select();
        }

        var overlay_bounds = climateParams['overlayBounds'];

        // ActiveTimePeriod gets set on first point click (need a point click to indicate what time period the user wants to see).
        if (typeof activeTimePeriod != "undefined") {

            // PRISM
            if (activeTimePeriod == 0 || modelIndex == "0") {
                if (statistic != "delta") {
                    var modelCode = "pm";
                    pngCode = modelCode + climateVariable + season + "t0";
                    chart.series[modelIndex].data[0].select();
                    swapImageOverlay(pngCode);
                    swapLegend(pngCode, null, climateVariable, "PRISM")
                }
                // No delta overlays for PRISM
                else {
                    swapImageOverlay("single_transparent_pixel")
                }
                pngCode = ""
            }

            else {

                // We're here because a point click has happened already.
                var lastPointClickTimePeriod = "t" + activeTimePeriod.toString();

                // Some climate consoles won't have a model dropdown
                if (typeof modelIndex != "undefined") {
                    var modelCode = climateParams["models"][chart.series[modelIndex].name][0];
                    var modelName = chart.series[modelIndex].name;
                    if (statistic=="delta") {
                        //remove the last character and add a "d" (e.g., tmin->tmid)
                        climateVariable = (climateVariable.slice(0,-1) + 'd');
                    }
                    pngCode = modelCode + climateVariable + season + lastPointClickTimePeriod;
                    chart.series[modelIndex].data[activeTimePeriod].select();
                    // This check has to be performed because when the user changes to aridity or pet, that changes the statistic dropdown which calls updateData again.
                    if (last_pngCode != pngCode) {
                        swapImageOverlay(pngCode);
                        swapLegend(pngCode, null, climateVariable, modelName);
                    }
                }

                last_pngCode = pngCode;
                last_climate_PNG_overlay_url = climate_PNG_overlay_url;

            }
        }
}


// Beta test preload MC2 images. Only for CA Console
function preLoadOverlay(arrayOfImages) {
    $(arrayOfImages).each(function(){
        swapImageOverlay(this,"EcosystemServices")
    });
}

function load_help_content(title, file) {

     $.ajax({ url : static_url + "help/" + file,
        global: false,
        dataType: "text",
        success : function (data) {

                alertify.alert("<div class='info_header'>" + title + "</div><div class='info_popup'>" + data  + "</div>", function(e){

                })

        }
    });

}

$(document).on("change", "#macrogroup_dropdown", function(){

    extract_raster_values(last_poly);
    var png_file = $(this).val();
    swapImageOverlay("none", "");
    swapImageOverlay(png_file, "bioclim");
    last_png_overlay = png_file;

 });

$(document).on("mouseover", ".macrogroup_option", function () {
    $('.info').empty();
    var macrogroup_id=$(this)[0].dataset.val;
    swapImageOverlay("none", "");
    swapImageOverlay(macrogroup_id, "bioclim");
});


$(document).on("mouseout", ".macrogroup_option", function () {
   if (typeof last_png_overlay != "undefined") {

         swapImageOverlay("none", "");
         swapImageOverlay(last_png_overlay, "bioclim")
    }
    else {
         swapImageOverlay("none", "");
     }
});

vtype_images = [
"vtype_agg_canesm2__58804",
"vtype_agg_canesm2__62457",
"vtype_agg_canesm2__66109",
"vtype_agg_canesm2__69762",
"vtype_agg_canesm2__73414",
"vtype_agg_canesm2__77067",
"vtype_agg_canesm2__80719",
"vtype_agg_canesm2__84372",
"vtype_agg_canesm2__88024",
"vtype_agg_ccsm4__58804",
"vtype_agg_ccsm4__62457",
"vtype_agg_ccsm4__66109",
"vtype_agg_ccsm4__69762",
"vtype_agg_ccsm4__73414",
"vtype_agg_ccsm4__77067",
"vtype_agg_ccsm4__80719",
"vtype_agg_ccsm4__84372",
"vtype_agg_ccsm4__88024",
"vtype_agg_cnrm__62457",
"vtype_agg_cnrm__66109",
"vtype_agg_cnrm__69762",
"vtype_agg_cnrm__73414",
"vtype_agg_cnrm__77067",
"vtype_agg_cnrm__80719",
"vtype_agg_cnrm__84372",
"vtype_agg_cnrm__88024",
"vtype_agg_hadgem2-es__58804",
"vtype_agg_hadgem2-es__62457",
"vtype_agg_hadgem2-es__66109",
"vtype_agg_hadgem2-es__69762",
"vtype_agg_hadgem2-es__73414",
"vtype_agg_hadgem2-es__77067",
"vtype_agg_hadgem2-es__80719",
"vtype_agg_hadgem2-es__84372",
"vtype_agg_hadgem2-es__88024",
"vtype_agg_hadgem2es__58804",
"vtype_agg_hadgem2es__62457",
"vtype_agg_hadgem2es__66109",
"vtype_agg_hadgem2es__69762",
"vtype_agg_hadgem2es__73414",
"vtype_agg_hadgem2es__77067",
"vtype_agg_hadgem2es__80719",
"vtype_agg_hadgem2es__84372",
"vtype_agg_hadgem2es__88024",
"vtype_agg_cnrm__58804",
]

