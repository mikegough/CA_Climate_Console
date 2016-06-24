$(document).ready(function() {
    /*$("div.leaflet-top:nth-child(1)").hide()*/
    $("#dynamicDataTable").tablesorter();
    document.title = title + " Climate Dashboard"
    layer0.setStyle(defaultStyle)
    layer0.bringToFront()
    //Need to set the radio buttons back to the default after a refresh otherwise they get out of sync with data in tables/charts.
    $('#timePeriodRadioDiv').each(function(){
        $('input[type=radio]', this).get(0).checked = true;
    });
    $('#unitsRadioDiv').each(function(){
        $('input[type=radio]', this).get(0).checked = true;
    });

});

$(".leaflet-control-layers-base").css("display","none")

//Soils
PNG_Bounds = [[49.0009868862815,-124.737501543016], [32.5295807355456,-105.450672392969]];
PNG_Overlay='multi_lcc_soil_sensitivity_300dpi.png'

//Protected Areas Service
serviceURL="http://ec2-52-11-27-69.us-west-2.compute.amazonaws.com/services/multi_lcc_protected_areas/tiles/{z}/{x}/{y}.png"
serviceLegendName="multi_lcc_protected_areas2.png"
serviceOpacity=.8

var myTextExtraction = function(node)
{
    console.log($(node).find("span").text()[0])
    return $(node).find("span").text()[0];

}

var defaultStyle = {
    color: '#F8981D',
    weight:3,
    dashArray: 0,
    fillOpacity:0,
    opacity:1
};

var hoverStyle = {
    weight:5,
    fillColor:"#FFFFFF",
    fillOpacity:.1,
};

var defaultQueryLayerStyle = {
    color: 'gray',
    fillColor:'#2C71A5',
    weight:1,
    dashArray: 0,
    fillOpacity:.7,
    opacity:0,
};

var hoverQueryLayerStyle = {
    color:'#2C88CD',
    fillColor:'#2C88CD',
    fillOpacity:.9,
    weight:5,
    opacity: 1
}

function mouseOverShowFeature(hovername) {

        query_layer.then(function(data) {

        hoverFeature = L.geoJson(data, {
            filter: function(feature, layer) {
                //return feature.properties.ID_For_Zon==OID_Index[hovername];
                return feature.properties.gridcode==OID_Index[hovername];
            },
            //Option to show markers only on smaller features.
            /*
            onEachFeature: function (feature, layer) {
                hoverFeatureArea=feature.properties.GIS_ACRES
            }
            */
        });

        hoverFeature.setStyle(hoverQueryLayerStyle)
        hoverFeature.addTo(map)

        bounds = hoverFeature.getBounds();
        //This handles cases where there isn't a matching field in the json file,
        if  (Object.keys(bounds).length > 0) {
            center = bounds.getCenter();
            marker = L.marker(center).addTo(map);
        }
    });
}

function mouseOutDeselect() {
    //Loop through the array of all layers and remove them
    //query_layer.setStyle(defaultQueryLayerStyle)
    map.removeLayer(hoverFeature)
    if (map.hasLayer(results_poly)) {
        results_poly.bringToFront()
    }
    if (typeof marker != "undefined" && map.hasLayer(marker)) {
        map.removeLayer(marker)
    }
}

function selectFeatureFromTable(name) {

    // Check checkbox for results_poly
    $( "#results_poly_visibility" ).prop( "checked", true );

    //layerControlDashboard.removeLayer(results_poly)

    //Loop through the array of all layers and remove them
    //query_layer.setStyle(defaultQueryLayerStyle)
    if (map.hasLayer(results_poly)){
        results_poly.bringToFront()
    }
    reporting_units='multi_lcc_query_layer_protected_areas_soils_5_simplify'
    create_post(name,reporting_units)

    //document.getElementById("view5Link").click()
    $("#map").css("width","calc(100% - 960px)")
    $("#detailedView").css("display","block")
    $("#tab_container").css("width","958px")
    $("#dataTableDiv").css("width","460px")
    $("#detailedView").css("width","478px")
    $("#detailedView").css("float","right")
    $(".loading").css("width", "958px")

    $(document).ajaxComplete(function(){
        results_poly.setStyle({color:'#00FFFF', fillColor:'#00FFFF', weight: 5, dashArray: 0, fillOpacity:.5, opacity:1})
        //$('#AboutSelectedProtectedArea').html(response['categoricalValues'] + " is a protected area....")
        /*
         $.get(static_url+"config/html/mlcc/" + response['categoricalValues']+".html", function (data) {
         $("#AboutSelectedProtectedArea").html(data);
         });
         */
        //Change Units on Point Chart. Required for initial load.
    });

    changeUnits(units_for_table)

     $('input[type=checkbox][name=results_poly_visibility]').change(function() {
        var ischecked = $(this).is(':checked');
        if(ischecked){
            results_poly.addTo(map)
        }
        else {
            map.removeLayer(results_poly)
        }
    });


    $(".layerToggleControl").css("display","block")
    $("#results_visibility_radio").css("display","block")

}

function getMaskIndex(){

     LCC_Name=response['categoricalValues']
     switch(LCC_Name) {
         case "Great Northern":
             return 2
             break;
         case "Great Basin":
             return 3
             break;
         case "North Pacific":
             return 1
             break;
         case "California":
             return 0
             break;
     }

}

function createDynamicDataTable(time_period_for_table, units_for_table){

    // Back to protected areas when a new map selection is made. Fixes floating transparency slider.
    swapMapService(serviceURL,serviceLegendName)

    if ($('#dynamicDataTable').length > 0) {
        TF_RemoveFilterGrid("dynamicDataTable")
    }


    $(document).ajaxComplete(function(){
        results_poly.setStyle({color:'#00FFFF', fillColor:'#00FFFF', weight: 5, dashArray: 0, fillOpacity:0, opacity:1})
    });


    if (typeof mask != 'undefined') {
        map.removeLayer(mask)

    }

    function loadMask(){
     mask = omnivore.topojson(static_url+'Leaflet/myJSON/Multi_LCC_Reporting_Units_LCC_Boundaries_remove_small_polys_2_simplify.json')
        .on('ready', function(){
            if (typeof current_mask != 'undefined') {map.removeLayer(current_mask)}
            mask_index=getMaskIndex()
            current_mask=L.mask(this.getLayers()[mask_index].getLatLngs()).addTo(map);
            current_mask.setStyle({color:'#00FFFF', fillColor:'#000000', weight: 5, dashArray: 0, fillOpacity:.2, opacity:0})

        });
    }

    //loadMask()
    //map.addLayer(query_layer);

    $('#dataTableDiv').empty()
    $('#getRawValuesButton').css('display','None')
    //$('#view5').append("<br><h3>Climate Data:</h3>"=
    resultsJSONsorted=sortObject(tabularResultsJSON)

    $('#dataTableDiv').append('<div id="dynamicDataTableDiv"></div>')
    $('#dynamicDataTableDiv').append('<table id="dynamicDataTable" class="tablesorter"></table>');
    var table=$('#dynamicDataTableDiv').children();

    //Time Period 1 & Time Period 2 Headers needed in order for the sorting to work.
    table.append('<thead>' +
        '<th title = "Name of the protected area. Click to sort.">Name</th>' +
        '<th title = "Protected area type. Click to sort." >Type</th>' +
        '<th title = "The value in this field represents the projected change in annual maximum temperature from the historical period 1971-2000 averaged across the selected area and the selected time period. This value is based on the ensemble average of nine models (CanESM2, CCSM4, HadGEM2-CC, HadGEM2-ES, IPSL-CM5A-MR, NorESM1-M, BCC-CSM1-1-M, MIROC5, CSIRO-Mk3.6.0) under RCP8.5. Click to sort." class="t1_header"><div class="dataHeader"><span class="quick_therm_tmax_small"><i class="wi wi-thermometer"></i></span>Tmax<div class="units" id="units_tmax_t1">(&deg;F)</div></div></th>' +
        '<th title = "The value in this field represents the projected change in annual minimum temperature from the historical period 1971-2000 averaged across the selected area and the selected time period. This value is based on the ensemble average of nine models (CanESM2, CCSM4, HadGEM2-CC, HadGEM2-ES, IPSL-CM5A-MR, NorESM1-M, BCC-CSM1-1-M, MIROC5, CSIRO-Mk3.6.0) under RCP8.5. Click to sort." class="t1_header"><div class="dataHeader"><span class="quick_therm_tmin_small"><i class="wi wi-thermometer"></i></span>Tmin<div class="units" id="units_tmin_t1">(&deg;F)</div></th>' +
        '<th title = "The value in this field represents the projected change in precipitation from the historical period 1971-2000 averaged across the selected area and the selected time period. This value is based on the ensemble average of nine models (CanESM2, CCSM4, HadGEM2-CC, HadGEM2-ES, IPSL-CM5A-MR, NorESM1-M, BCC-CSM1-1-M, MIROC5, CSIRO-Mk3.6.0) under RCP8.5. Click to sort." class="t1_header"><div class="dataHeader"><span class="quick_rain_small"><i class="wi wi-rain-mix"></i></span>Prec<div class="units" id="units_prec">(%)</div></div></th>' +
        '<th class="t2_header"><div class="dataHeader"><span class="quick_therm_tmax_small"><i class="wi wi-thermometer"></i></span>Tmax<div class="units" id="units_tmax_t2">(&deg;F)</div></div></th>' +
        '<th class="t2_header"><div class="dataHeader"><span class="quick_therm_tmin_small"><i class="wi wi-thermometer"></i></span>Tmin<div class="units" id="units_tmin_t2">(&deg;F)</div></th>' +
        '<th class="t2_header"><div class="dataHeader"><span class="quick_rain_small"><i class="wi wi-rain-mix"></i></span>Prec<div class="units" id="units_prec">(%)</div></div></th>' +
        '<th title="Approximate size of the selected protected area. Click to sort."><div class="dataHeader">&nbsp&nbspArea<br><div class="units" id="units_area">(Acres)</div></div></th>' +

        '</tr></thead>')

    $('#dataTableDiv').append('<div id="dynamicEEMSDataTableDiv"></div>')
    $('#dynamicEEMSDataTableDiv').append('<table id="dynamicDataTable" class="tablesorter"></table>');

    var tr;

    rowClass="rowClass1"
    loop_count=0
    start_index=0

    $.each(resultsJSONsorted, function (key, value_list) {

        loop_count = loop_count + 1
        if (loop_count % 2 == 0) {
            rowClass = 'rowClass1'
        }
        else {
            rowClass = 'rowClass2'
        }

        tr = $('<tr class="' + rowClass + '"/>');
        //Protected Area Name
        tr.append("<td  onclick='selectFeatureFromTable(&quot;" + key + "&quot;)' onmouseover='mouseOverShowFeature(&quot;" + key + "&quot;)' onmouseout='mouseOutDeselect()'>" + key + "</td>")

        //Protected Area Type
        tr.append("<td>" + value_list[0] + "</td>")

        /////////////////////////  Time Period 1 /////////////////////////////

        //Tmax
        tr.append("<td>" +
            "<span class='english'>" + (value_list[1]*1.8).toFixed(2) +"</span>" +
            "<span class='metric'>" + value_list[1] + "</span>" +
            "</td>")

        //Tmin
        tr.append("<td>" +
            "<span class='english'>" + (value_list[2]*1.8).toFixed(2) +"</span>" +
            "<span class='metric'>" + value_list[2] + "</span>" +
            "</td>")

        //Precipitation (%)
        tr.append("<td>" + value_list[3] + "</td>")

        /////////////////////////  Time Period 2 /////////////////////////////
        //Temperature (C)
        tr.append("<td>" +
            "<span class='english'>" + (value_list[4]*1.8).toFixed(2) +"</span>" +
            "<span class='metric'>" + value_list[4] + "</span>" +
            "</td>")

        tr.append("<td>" +
            "<span class='english'>" + (value_list[5]*1.8).toFixed(2) +"</span>" +
            "<span class='metric'>" + value_list[5] + "</span>" +
            "</td>")

        //Precipitation (%)
        tr.append("<td>" + value_list[6] + "</td>")

        /////////////////////////  Area (T1 & T2) /////////////////////////////

        //tr.append("<td>" + Number(value_list[7]) +
        tr.append("<td>" +
            "<span class='english'>" + Number((value_list[7]).toFixed(0)) + "</span>" +
            "<span class='metric'>" + Number((value_list[7] * 0.004046859).toFixed(1))+ "</span>" +
            "</td>")

        table.append(tr)

    });

    //Fix for when only 1 features is selected. Without this tablesorter throws an error.
    tr = $('<tr/>');
    tr.append("<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>")
    table.append(tr)

    //Used to highlight selected record. Needs to after the dynamic table is created.
    $('#dynamicDataTable tr').click(function () {
        $('#dynamicDataTable tr').removeClass("active");
        $(this).addClass("active");
    });

    //Set default table sort order
    $("#dynamicDataTable").tablesorter({
        // default sortInitialOrder setting
        sortInitialOrder: "desc",
        widgets: ['zebra'],
        widgetZebra: {css: ["rowClass1","rowClass2"]},
    });

    //Gives a thousands separator to the values in the area field, while still allowing it to sort properly.
    $("table#dynamicDataTable td span").digits();

    var table1Filters = {
        col_1: "select",
        col_2: "none",
        col_3: "none",
        col_4: "none",
        col_5: "none",
        col_6: "none",
        col_7: "none",
        col_8: "none",
        display_all_text: "Filter by Type",
        col_1_text: "Filter by Name"
    }

    setFilterGrid("dynamicDataTable",0,table1Filters);
    //Problem when combining with dropdown filter (No Matches).
    //$("#flt0_dynamicDataTable").attr("value", "Filter by Name")

    if (time_period_for_table==1) {
        $('td:nth-child(3)').show();
        $('td:nth-child(4)').show();
        $('td:nth-child(5)').show();

        $('td:nth-child(6)').hide();
        $('td:nth-child(7)').hide();
        $('td:nth-child(8)').hide();
    }
    else if (time_period_for_table==2) {
        $('td:nth-child(3)').hide();
        $('td:nth-child(4)').hide();
        $('td:nth-child(5)').hide();

        $('td:nth-child(6)').show();
        $('td:nth-child(7)').show();
        $('td:nth-child(8)').show();
    }


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


///Image Overlays

base_data_PNG_overlay=""

function swapPNGOverlay(PNG,bounds,modelType) {

        //$("#control").hide()

        if (map.hasLayer(mapService)){
            map.removeLayer(mapService)
        }
        if (map.hasLayer(base_data_PNG_overlay)){
            map.removeLayer(base_data_PNG_overlay)
        }
        if (map.hasLayer(climate_PNG_overlay)){
            map.removeLayer(climate_PNG_overlay)
        }

        base_data_PNG_overlay_url = static_url + "Leaflet/myPNG/other/multi_lcc/" + PNG;

        base_data_PNG_overlay=L.imageOverlay(base_data_PNG_overlay_url, bounds);

        base_data_PNG_overlay.addTo(map).setOpacity(.7).bringToBack();
        base_data_PNG_overlay.bringToBack()

        elements=document.getElementsByClassName('ui-opacity')
        //Transparency slider
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = elements[i].style.display = 'inline';
        }
        base_data_PNG_overlay.setOpacity(1 - (handle.offsetTop / 200))

        //Radio Buttons
        //$('.info').html("<div id='base_data_visibility_radio'><input type='radio' name='base_data_visibility' checked value='on'>On</input><input type='radio' name='base_data_visibility' value='off'>Off</input></div><img class='dashboard_legend' src='" + static_url+ "Leaflet/my_leaflet/legends/" + PNG +"'>")

        //Checkbox
        $('.info').html("<div id='base_data_visibility_radio'>" +
            "<input type='checkbox' name='base_data_visibility' checked value='on'>Show on Map</input>"  +
            "</div><img class='dashboard_legend' src='" + static_url+ "Leaflet/my_leaflet/legends/" + PNG +"'>")

        // allLayers is not used in this app. If image overlays can come from a different source (e.g., bar chart.)
        // define allLayers as a list of those layers to be removed when this function is called.
        /*
        var arrayLength = allLayers.length;
        for (var i = 0; i < arrayLength; i++) {
                map.removeLayer(allLayers[i])
        }
        */

        $('input[type=radio][name=base_data_visibility]').change(function() {
            if (this.value == 'on') {
                base_data_PNG_overlay.addTo(map).bringToBack();
            }
            else if (this.value == 'off') {
                map.removeLayer(base_data_PNG_overlay)
            }
        });

        $('input[type=checkbox][name=base_data_visibility]').change(function() {
           var ischecked = $(this).is(':checked');
           if(ischecked){
                base_data_PNG_overlay.addTo(map).bringToBack();
            }
            else {
                map.removeLayer(base_data_PNG_overlay)
            }
        });

}

function swapMapService(serviceURL,serviceLegendName) {

    $("#control").hide()

    if (typeof mapService != 'undefined' && map.hasLayer(mapService)){
        map.removeLayer(mapService)
    }
    if (map.hasLayer(base_data_PNG_overlay)){
        map.removeLayer(base_data_PNG_overlay)
    }
    if (map.hasLayer(climate_PNG_overlay)){
        map.removeLayer(climate_PNG_overlay)
    }

    mapServiceURL=serviceURL
    mapService=L.tileLayer(serviceURL,{opacity:serviceOpacity}).addTo(map).bringToFront()

    $('.info').html("<div id='base_data_visibility_radio'>" +
        "<input type='checkbox' name='map_service_visibility' checked value='on'>Show on Map</input>"  +
        "</div><img class='dashboard_legend' src='" + static_url+ "Leaflet/my_leaflet/legends/" + serviceLegendName +"'>")

    $('input[type=checkbox][name=map_service_visibility]').change(function() {
        var ischecked = $(this).is(':checked');
        if(ischecked){
            mapService.addTo(map).bringToFront()
        }
        else {
            map.removeLayer(mapService)
        }
    });
}


//var PNG_Bounds = [[49.0023040716397,-124.762157363724], [32.5362189626958,-105.482414210877]];
//swapBaseDataOverlay('multi_lcc_protected_areas2.png',PNG_Bounds)

//Initial Map Service
swapMapService(serviceURL,serviceLegendName)

$("#view98Link").click(function() {
    //var PNG_Bounds = [[49.0023040716397,-124.762157363724], [32.5362189626958,-105.482414210877]];
    //swapBaseDataOverlay('multi_lcc_protected_areas2.png',PNG_Bounds)
    swapMapService("http://ec2-52-39-66-59.us-west-2.compute.amazonaws.com/services/multi_lcc_protected_areas/tiles/{z}/{x}/{y}.png","multi_lcc_protected_areas2.png")
})

$("#view99Link").click(function() {
    swapPNGOverlay(PNG_Overlay,PNG_Bounds)
 })

//Changing Time Period Hides TDs
function changeTimePeriod(time_period){

    time_period_for_table=time_period
    //createDynamicDataTable(time_period_for_table,units_for_table)
    if (time_period_for_table==1) {
        $('td:nth-child(3)').show();
        $('td:nth-child(4)').show();
        $('td:nth-child(5)').show();

        $('td:nth-child(6)').hide();
        $('td:nth-child(7)').hide();
        $('td:nth-child(8)').hide();

        //Show/Hide Headers
        $('.t1_header').show();
        $('.t2_header').hide();
    }
    else if (time_period_for_table==2) {
        $('td:nth-child(3)').hide();
        $('td:nth-child(4)').hide();
        $('td:nth-child(5)').hide();

        $('td:nth-child(6)').show();
        $('td:nth-child(7)').show();
        $('td:nth-child(8)').show();

        //Show/Hide Headers
        $('.t2_header').show();
        $('.t1_header').hide();
    }
}

//Changing Units Hides <spans> in TD
function changeUnitsForTable(units) {
    units_for_table=units
    changeUnits(units_for_table)
    if (units == 'english') {
        $(".english").show()
        $(".metric").hide()

        $("#units_tmax_t1").html("(&deg;F)")
        $("#units_tmin_t1").html("(&deg;F)")
        $("#units_tmax_t2").html("(&deg;F)")
        $("#units_tmin_t2").html("(&deg;F)")
        $("#units_area").html("(Acres)")
    }
    else if (units == 'metric') {
        $(".metric").show()
        $(".english").hide()

        $("#units_tmax_t1").html("(&deg;C)")
        $("#units_tmin_t1").html("(&deg;C)")
        $("#units_tmax_t2").html("(&deg;C)")
        $("#units_tmin_t2").html("(&deg;C)")
        $("#units_area").html("&nbsp;(km<sup>2</sup>)")
    }
}

/*Function override. This function was originally defined in general_js.
There was a problem when a user would click on a climate layer and then go back to clicking on a protected area in the table:
The legend would disappear. So this adds one additional check, to only swap the legend if there is a climate layer on and the user
changes the units */

function changeUnits(units){
    unitsForChart=units;
    if (typeof layerToAddName != 'undefined' && map.hasLayer(climate_PNG_overlay)){

        swapLegend(layerToAddName, null, document.getElementById("variable_selection_form").value, modelName);
    }
    updateData(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value,document.getElementById("season_selection_form").value);

    updateQuickViewTable(document.getElementById("season_selection_form").value)
}
/*
var layerToggle = L.Control.extend({
    options: {position: 'bottomright'},

    onAdd: function (map) {
        this._div = L.DomUtil.create('div', 'layerToggleControl');
        this._div.innerHTML = "<div id='results_visibility_radio'><b>Current Selection</b>" + "<input type='checkbox' id='results_poly_visibility' name='results_poly_visibility' checked value='on'><span id='result_poly_show_on_map_label'>Show on Map<span></div>";
        return this._div;
    },
});

map.addControl(new layerToggle());
*/

$("#leaflet-control-layers-group-0").append("<div id='results_visibility_radio'><hr>" + "<input type='checkbox' id='results_poly_visibility' name='results_poly_visibility' checked value='on'><b>Current Selection</b></div>");

//Function to add comma thousands separator to values in the area field while still allowing it to sort properly.
$.fn.digits = function(){
    return this.each(function(){
        $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") );
    })
}


