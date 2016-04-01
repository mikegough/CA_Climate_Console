$(document).ready(function() {
    /*$("div.leaflet-top:nth-child(1)").hide()*/
    $("#dynamicDataTable").tablesorter();
    document.title = title + " Climate Dashboard"
    layer0.setStyle(defaultStyle)
    layer0.bringToFront()

    $('input[type=radio][name=pa_visibility]').change(function() {
        if (this.value == 'on') {
            protected_areas_overlay.addTo(map).bringToBack();
        }
        else if (this.value == 'off') {
           map.removeLayer(protected_areas_overlay)
        }
    });

});



/*
$(".info2").html("Select an LCC Boundary")
*/

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
    color:'#01FEFE',
    fillColor:'#2C88CD',
    fillOpacity:.9,
    weight:1,
    dashArray: '4',
    opacity: '0'

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
        hoverFeature.setStyle(defaultQueryLayerStyle)
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
    reporting_units='multi_lcc_query_layer_protected_areas_5_simplify'
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

function createDynamicDataTable(){

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
    table.append('<thead><tr><th>Protected Area</th><th>Type</th><th></td><span class="quick_therm_tmax_small"><i class="wi wi-thermometer"></i></span> TMAX</th><th><span class="quick_therm_tmin_small"><i class="wi wi-thermometer"></i></span> TMIN</th><th><span class="quick_rain_small"><i class="wi wi-rain-mix"></i></span>Precip</th></tr></thead>')

    $('#dataTableDiv').append('<div id="dynamicEEMSDataTableDiv"></div>')
    $('#dynamicEEMSDataTableDiv').append('<table id="dynamicDataTable" class="tablesorter"></table>');
    console.log

    var tr;

    rowClass="rowClass1"
    loop_count=0

    $.each(resultsJSONsorted,function(key,value_list){
        loop_count=loop_count+1
        if (loop_count % 2 == 0) {
            rowClass='rowClass1'
        }
        else {
            rowClass='rowClass2'
        }

        tr = $('<tr class="'+rowClass+'"/>');
        tr.append("<td  onclick='selectFeatureFromTable(&quot;"+key+"&quot;)' onmouseover='mouseOverShowFeature(&quot;"+ key +"&quot;)' onmouseout='mouseOutDeselect()'>" + key + "</td>")
        $.each(value_list, function(index, value) {
            tr.append("<td>" + value + "</td>")

        })
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
         widgetZebra: {css: ["rowClass1","rowClass2"]}

    });

    var table1Filters = {
        col_0: "select",
        col_1: "select",
        col_2: "none",
        col_3: "none",
        col_4: "none"
    }

    setFilterGrid("dynamicDataTable",0,table1Filters);
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


onekmBounds = [[49.0023040716397,-124.762157363724], [32.5362189626958,-105.482414210877]];
var protected_areas_url= static_url+'Leaflet/myPNG/other/multi_lcc/multi_lcc_protected_areas2.png';
var protected_areas_overlay= L.imageOverlay(protected_areas_url, onekmBounds);
protected_areas_overlay.addTo(map).setOpacity(.7).bringToBack();

$('.info').html("Protected Areas<form id='toggle_protected_areas' style='margin-bottom:0' action=''><input type='radio' name='pa_visibility' checked value='on'>On</input><input type='radio' name='pa_visibility' value='off'>Off</input></form><img src='" + static_url+ "Leaflet/my_leaflet/legends/Protected_Areas.png'>")

