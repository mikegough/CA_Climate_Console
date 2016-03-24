$(document).ready(function() {
    /*$("div.leaflet-top:nth-child(1)").hide()*/
    $("#dynamicDataTable").tablesorter();
    document.title = title + " Climate Dashboard"
    layer0.setStyle(defaultStyle)
    layer0.bringToFront()

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

var defaultQueryLayerStyle = {
    color: 'gray',
    fillColor:'green',
    weight:1,
    dashArray: 0,
    fillOpacity:.5,
    opacity:.5,
};

var hoverQueryLayerStyle = {
    color:'#00B700',
    fillColor:'#2C88CD',
    fillOpacity:.9,
    weight:1,
    dashArray: '3',
    opacity: '0'

}


function mouseOverShowFeature(hovername) {
    text_hover_layer=query_layer
    if (text_hover_layer != null) {

        text_hover_layer.eachLayer(function(dist){
            if (dist.toGeoJSON().properties.NAME == hovername) {
                dist.setStyle(hoverQueryLayerStyle)
                if (!L.Browser.ie && !L.Browser.opera) {
                    dist.bringToFront();
                }
            }
        });
    }
}

function mouseOutDeselect() {
    //Loop through the array of all layers and remove them
     query_layer.setStyle(defaultQueryLayerStyle)
    results_poly.bringToFront()
}

function selectFeatureFromTable(name) {
    //Loop through the array of all layers and remove them
    query_layer.setStyle(defaultQueryLayerStyle)
    results_poly.bringToFront()
    reporting_units='multi_lcc_reporting_units_usfs_2_simplify'
    create_post(name,reporting_units)
    //document.getElementById("view5Link").click()
    $("#map").css("width","calc(100% - 960px)")
    $("#detailedView").css("display","block")
    $("#tab_container").css("width","958px")
    $("#dataTableDiv").css("width","460px")
    $("#detailedView").css("width","478px")
    $("#detailedView").css("float","right")
    $(".loading").css("width", "958px")

}


function createDynamicDataTable(){

    $('#dataTableDiv').empty()
    $('#getRawValuesButton').css('display','None')
    //$('#view5').append("<br><h3>Climate Data:</h3>")
    resultsJSONsorted=sortObject(tabularResultsJSON)

    $('#dataTableDiv').append('<div id="dynamicDataTableDiv"></div>')
    $('#dynamicDataTableDiv').append('<table id="dynamicDataTable" class="tablesorter"></table>');
    var table=$('#dynamicDataTableDiv').children();
    table.append('<thead><tr><th>Protected Area</th><th></td><span class="quick_therm_tmax_small"><i class="wi wi-thermometer"></i></span> TMAX</th><th><span class="quick_therm_tmin_small"><i class="wi wi-thermometer"></i></span> TMIN</th><th><span class="quick_rain_small"><i class="wi wi-rain-mix"></i></span>Precip</th></tr></thead>')

    $('#dataTableDiv').append('<div id="dynamicEEMSDataTableDiv"></div>')
    $('#dynamicEEMSDataTableDiv').append('<table id="dynamicDataTable" class="tablesorter"></table>');
    console.log

    var tr;
    reporting_units='multi_lcc_reporting_units_usfs_2_simplify'

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

