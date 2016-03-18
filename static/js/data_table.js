var defaultQueryLayerStyle = {
    color: 'gray',
    fillColor:'green',
    weight:1,
    dashArray: 0,
    fillOpacity:.5,
    opacity:.5
};

var hoverQueryLayerStyle = {
    color:'#00B700',
    fillColor:'#0F5F9B',
    fillOpacity:.8,
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
    document.getElementById("view5Link").click()

}

function createDynamicDataTable(){

    $('#view1').empty()
    $('#getRawValuesButton').css('display','None')
    //$('#view5').append("<br><h3>Climate Data:</h3>")
    resultsJSONsorted=sortObject(tabularResultsJSON)

    $('#view1').append('<div id="dynamicDataTableDiv"></div>')
    $('#dynamicDataTableDiv').append('<table class="dynamicDataTable"></table>');
    var table=$('#dynamicDataTableDiv').children();
    table.append("<tr><th>Name</th><th>TMAX</th><th>TMIN</th><th>Precip</th></tr>")

    $('#view1').append('<div id="dynamicEEMSDataTableDiv"></div>')
    $('#dynamicEEMSDataTableDiv').append('<table class="dynamicDataTable"></table>');
    console.log

    var tr;
    reporting_units='multi_lcc_reporting_units_usfs_2_simplify'

    $.each(resultsJSONsorted,function(key,value_list){
        tr = $('<tr/>');
        tr.append("<td onclick='selectFeatureFromTable(&quot;"+key+"&quot;)' onmouseover='mouseOverShowFeature(&quot;"+ key +"&quot;)' onmouseout='mouseOutDeselect()'>" + key + "</td>")
        $.each(value_list, function(index, value) {
            tr.append("<td>" + value + "</td>")
        })
        table.append(tr)
    });

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
