$(document).ready(function() {
    /*$("div.leaflet-top:nth-child(1)").hide()*/
    $("#dynamicDataTable").tablesorter();
    document.title = title + " Climate Dashboard"
    layer0.setStyle(defaultStyle)
    layer0.bringToFront()

});

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
    color:'#00FFFF',
    fillColor:'#2C88CD',
    fillOpacity:.9,
    weight:1,
    opacity: 1
}
/*

var defaultQueryLayerStyle = {
    color: '#23B25F',
    radius:4
};

var hoverQueryLayerStyle = {
    radius: 10,
    color: "#4575B5",
    fillOpacity: 0.85
}
*/

function mouseOverShowFeature(hovername) {

        query_layer.then(function(data) {

        hoverFeature = L.geoJson(data, {
            filter: function(feature, layer) {
                return feature.properties.ID_For_Zon==OID_Index[hovername];
            }
        });
        hoverFeature.setStyle(hoverQueryLayerStyle)
        hoverFeature.addTo(map)
    });
}


/*
function mouseOverShowFeature(hovername) {
    //query_layer=static_url + 'Leaflet/myJSON/'+ hovername.replace(" ", "_") +".json"
    text_hover_layer=query_layer
    if (text_hover_layer != null) {

        text_hover_layer.eachLayer(function(dist){
            //if (dist.toGeoJSON().properties.OBJECTID == OID_Index[hovername]) {
            if (dist.toGeoJSON().properties.NAME == hovername) {
                dist.setStyle(hoverQueryLayerStyle)
                if (!L.Browser.ie && !L.Browser.opera) {
                    dist.bringToFront();
                }
            }
        });
    }
}

*/
function mouseOutDeselect() {
    //Loop through the array of all layers and remove them
    //query_layer.setStyle(defaultQueryLayerStyle)
    map.removeLayer(hoverFeature)
    results_poly.bringToFront()
}

function selectFeatureFromTable(name) {

    //Loop through the array of all layers and remove them
    //query_layer.setStyle(defaultQueryLayerStyle)
    results_poly.bringToFront()
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
        $('#AboutSelectedProtectedArea').html(response['categoricalValues'] + " is a protected area....")
        //$('#AboutSelectedProtectedArea').html(response['categoricalValues'] + " is a protected area centered at <a target='_blank' href='http://www.google.com/maps/place/"+centerLat+","+centerLon+"'>" + centerLat + centerLon +"</a>")
        /*
         $.get(static_url+"config/html/mlcc/" + response['categoricalValues']+".html", function (data) {
         $("#AboutSelectedProtectedArea").html(data);
         });
         */
    });


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

function createDynamicDataTable(time_period_for_table){

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
    //$('#view5').append("<br><h3>Climate Data:</h3>")
    resultsJSONsorted=sortObject(tabularResultsJSON)

    $('#dataTableDiv').append('<div id="dynamicDataTableDiv"></div>')
    $('#dynamicDataTableDiv').append('<table id="dynamicDataTable" class="tablesorter"></table>');
    var table=$('#dynamicDataTableDiv').children();
    table.append('<thead><div><th>Protected Area</th><th>Type</th><th><div class="dataHeader"><span class="quick_therm_tmax_small"><i class="wi wi-thermometer"></i></span> Tmax</div></th><th><div class="dataHeader"><span class="quick_therm_tmin_small"><i class="wi wi-thermometer"></i></span>Tmin</th></div><th><div class="dataHeader"><span class="quick_rain_small"><i class="wi wi-rain-mix"></i></span>Prec</div></th><th><div class="dataHeader">&nbsp&nbspAcres</div></th></tr></thead>')

    $('#dataTableDiv').append('<div id="dynamicEEMSDataTableDiv"></div>')
    $('#dynamicEEMSDataTableDiv').append('<table id="dynamicDataTable" class="tablesorter"></table>');
    console.log

    var tr;

    rowClass="rowClass1"
    loop_count=0
    start_index=0

    //object_to_show={}
    //array_to_show=[]
    //object_to_show["array_to_show"]=array_to_show;
    //object_to_show[array_to_showarray_to_show.push(value_list[0], value_list[start_index + 1], value_list[start_index + 2], value_list[start_index + 3])


    if (time_period_for_table==1) {
        start_index=1
        end_index=4
    }
    else if (time_period_for_table==2) {
        start_index=4
        end_index=7
    }

    $.each(resultsJSONsorted, function (key, value_list) {

        loop_count = loop_count + 1
        if (loop_count % 2 == 0) {
            rowClass = 'rowClass1'
        }
        else {
            rowClass = 'rowClass2'
        }

        tr = $('<tr class="' + rowClass + '"/>');
        tr.append("<td  onclick='selectFeatureFromTable(&quot;" + key + "&quot;)' onmouseover='mouseOverShowFeature(&quot;" + key + "&quot;)' onmouseout='mouseOutDeselect()'>" + key + "</td>")
        tr.append("<td>" + value_list[0] + "</td>")
        $.each(value_list.slice(start_index,end_index), function (index, value) {
            tr.append("<td>" + value + "</td>")

        })
        tr.append("<td>" + value_list[7] + "</td>")
        table.append(tr)
    });

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

    var table1Filters = {
        col_1: "select",
        col_2: "none",
        col_3: "none",
        col_4: "none",
        col_5: "none",
        display_all_text: "Filter by Type",
        col_1_text: "Filter by Name"
    }

    setFilterGrid("dynamicDataTable",0,table1Filters);
    //Problem when combining with dropdown filter (No Matches).
    //$("#flt0_dynamicDataTable").attr("value", "Filter by Name")
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
baseDataBounds = [[49.0023040716397,-124.762157363724], [32.5362189626958,-105.482414210877]];

base_data_PNG_overlay=""

function swapBaseDataOverlay(PNG,modelType) {

        $("#control").hide()

        if (map.hasLayer(base_data_PNG_overlay)){
            map.removeLayer(base_data_PNG_overlay)
        }
        if (map.hasLayer(climate_PNG_overlay)){
            map.removeLayer(climate_PNG_overlay)
        }
        base_data_PNG_overlay_url = static_url + "Leaflet/myPNG/other/multi_lcc/" + PNG;

        base_data_PNG_overlay=L.imageOverlay(base_data_PNG_overlay_url, baseDataBounds);

        base_data_PNG_overlay.addTo(map).setOpacity(.7).bringToBack();
        base_data_PNG_overlay.bringToBack()
        //$('.info').html("Protected Areas<form id='toggle_protected_areas' style='margin-bottom:0' action=''><input type='radio' name='pa_visibility' checked value='on'>On</input><input type='radio' name='pa_visibility' value='off'>Off</input></form><img src='" + static_url+ "Leaflet/my_leaflet/legends/Protected_Areas.png'>")

        $('.info').html("<div id='base_data_visibility_radio'><input type='radio' name='base_data_visibility' checked value='on'>On</input><input type='radio' name='base_data_visibility' value='off'>Off</input></div><img class='dashboard_legend' src='" + static_url+ "Leaflet/my_leaflet/legends/" + PNG +"'>")

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

}


swapBaseDataOverlay('multi_lcc_protected_areas2.png')

$("#view99Link").click(function() {
        swapBaseDataOverlay('multi_lcc_soil_sensitivity_300dpi.png')
 })

$("#view98Link").click(function() {
    swapBaseDataOverlay('multi_lcc_protected_areas2.png')
})

function changeTimePeriod(time_period){
    time_period_for_table=time_period
    createDynamicDataTable(time_period_for_table)
}

function changeUnitsForTable(units){
    changeUnits(units)
    createDynamicDataTable(time_period_for_table)
}

