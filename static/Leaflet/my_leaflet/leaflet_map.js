var latlng = L.latLng(center_lat,center_lon);

if (last_poly != '') {
    var results_poly = omnivore.wkt.parse(last_poly)
}

var map = L.map("map", {
    zoomControl: false,
    clickable: false,
    drawcontrol:false,
}).setView(latlng,zoomLevel);

//SCALE BAR
L.control.scale({maxWidth:200}).addTo(map);

//BEGIN TEXT UPPER LEFT ("Selection Tools")
var toolTitle = L.Control.extend({
    options: {position: 'topleft'},

    onAdd: function (map) {
        this._div = L.DomUtil.create('div', 'toolTitle');
        this._div.innerHTML = "1. Select Reporting Units";
        return this._div;
    }
});

map.addControl(new toolTitle());

//DYNAMIC LEGEND
var dynamic_legend = L.control({position: 'bottomright'});

//Initialize Legend
dynamic_legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML=""
    return div;
};
dynamic_legend.addTo(map)

//Swap legend on data point click
function swapLegend(layerToAddName, layerToAdd, climateVariable) {
    if ((! map.hasLayer(climate_PNG_overlay) && ! map.hasLayer(layerToAdd)) || layerToAddName == 'single_transparent_pixel') {

        document.getElementsByClassName('info legend leaflet-control')[0].innerHTML=''

    } else {

        dbid=Data_Basin_ID_Dict[layerToAddName]

        if (climateVariable=='EEMSmodel'){

            legendTitle=window[layerToAddName+"Params"].legendTitle
            legendImage=window[layerToAddName+"Params"].legendPNG
            legendHeight=window[layerToAddName+"Params"].legendHeight
            dbid=window[layerToAddName+"Params"].dataBasinID

        } else {

            //Legend Title
            modelName=layerToAddName.replace(/c2.*/,'CanESM2').replace(/c4.*/,'CCSM4').replace(/m5.*/,'MIROC5').replace(/ee.*/,'Ensemble').replace(/pm.*/,'PRISM')
            modelName=modelName.replace(/g3.*/,'GFDL-CM3').replace(/hs.*/,'HadGEM2-ES').replace(/hc.*/,'HadGEM2-CC').replace(/a0.*/,'ACCESS1-0').replace(/cc.*/,'CESM1-BGC').replace(/cm.*/,'CMCC-CM').replace(/c5.*/,'CNRM-CM5')
            timePeriod=layerToAddName.replace(/.*t0.*/,'1971-2000').replace(/.*t1.*/,'2016-2045').replace(/.*t2.*/,'2046-2075')
            season=layerToAddName.replace(/.*s0.*/,'Annual').replace(/.*s1.*/,'Jan-Feb-Mar').replace(/.*s2.*/,'Apr-May-Jun').replace(/.*s3.*/,'Jul-Aug-Sep').replace(/.*s4.*/,'Oct-Nov-Dec')

            //Create Climate Variable Label
            if (layerToAddName.indexOf('tma') != -1  ){
               var climateVariableLabel='Max Temp'

            } else if (layerToAddName.indexOf('tmi') != -1  ){
                var climateVariableLabel='Min Temp'

            } else if (layerToAddName.indexOf('pre') != -1  ){
                var climateVariableLabel='Precipitation'

            } else if (layerToAddName.indexOf('ari') != -1  ){
                var climateVariableLabel='Aridity'

            } else if (layerToAddName.indexOf('pet') != -1  ){
                var climateVariableLabel='PET'
            }

            //Create Statistic Label
            if (layerToAddName.match(/(tmaa|tmia|prea|aria|peta)/)){
                var statisticLabel='Anomaly'

            } else if (layerToAddName.match(/(tmad|tmid|pred|arid|petd)/)){
                var statisticLabel='Change'

            } else {
                var statisticLabel='Average'
            }

            legendTitle=climateVariableLabel+"<br>"+ statisticLabel + "<br>" + season + "<br>" + timePeriod + "<br>(" + modelName + ")"

            //legendImage=climateVariable+"_legend"
            if(unitsForChart=="english"){
                legendImage="Legends/"+layerToAddName+"_english_legend"
            }
            else {
                legendImage="Legends/"+layerToAddName+"_legend"
            }

            layerToAddName="climate"
            legendHeight=window[layerToAddName+"Params"].legendHeight

        }

          document.getElementsByClassName('info')[0].innerHTML=
            '<div id="DataBasinRedirect"> <a target="_blank" href="http://databasin.org/datasets/' + dbid + '"><img class="DataBasinRedirectImg" title="Click to view or download this dataset on Data Basin" src="'+static_url+'img/dataBasinRedirect.png"></a></div>' +
            '<div id="LegendHeader">' + legendTitle+ '</div>' +
            '<img style="float:left" height="' + legendHeight + '" src="'+static_url+'Leaflet/myPNG/climate/TrimmedPNG/'+legendImage + '.png">'+
            '<div class="legendLabels">'

            for (i in window[layerToAddName+"Params"].legendLabels) {
                $(".legendLabels").append(window[layerToAddName+"Params"].legendLabels[i] + "<br>");
            }
        }
}

overlay_bounds = [[32.6339585982195,-118.643362495493], [37.302775947927, -114.130781641769 ]];
overlay_bounds = [[32.52777441016329, -124.41250000002108], [42.02083587646484, -114.1214454281304]];

if (typeof climate_PNG_overlay != 'undefined') {
    climate_PNG_overlay_url=static_url+'Leaflet/myPNG/climate/TrimmedPNG/' + climate_PNG_overlay
    climate_PNG_overlay=L.imageOverlay(climate_PNG_overlay_url, overlay_bounds);
    climate_PNG_overlay.addTo(map)

} else {
    climate_PNG_overlay_url='';
    climate_PNG_overlay=L.imageOverlay(climate_PNG_overlay_url, overlay_bounds);
}

//Function used by the Climate chart to add PNGs. Obviates the need to manually define each image overlay object.
function swapImageOverlay(layerName) {
        $("#clickToMapInfo").hide();
        //Transparency slider
        elements=document.getElementsByClassName('ui-opacity')
        map.removeLayer(climate_PNG_overlay)
        //ti
        if (climate_PNG_overlay_url.search(layerName)> 0){
            map.removeLayer(climate_PNG_overlay)
            climate_PNG_overlay_url=""
            //Transparency slider
            for (var i = 0; i < elements.length; i++) {
                elements[i].style.display = elements[i].style.display = 'none';
            }

        } else {
                climate_PNG_overlay_url=static_url+'Leaflet/myPNG/climate/TrimmedPNG/' + layerName + '.png';
                climate_PNG_overlay=L.imageOverlay(climate_PNG_overlay_url, overlay_bounds);

                climate_PNG_overlay.addTo(map)
                climate_PNG_overlay.bringToBack()
                elements=document.getElementsByClassName('ui-opacity')
                //Transparency slider
                for (var i = 0; i < elements.length; i++) {
                    elements[i].style.display = elements[i].style.display = 'inline';
                }
                climate_PNG_overlay.setOpacity(1 - (handle.offsetTop / 200))

        }
        //For keeping table row selected
        climate_PNG_overlay.name=layerName

        // allLayers is not used in this app. If image overlays can come from a different source (e.g., bar chart.)
        // define allLayers as a list of those layers to be removed when this function is called.
        /*
        var arrayLength = allLayers.length;
        for (var i = 0; i < arrayLength; i++) {
                map.removeLayer(allLayers[i])
        }
        */
}

var defaultStyle = {
    color: '#F8981D',
    weight:2,
    dashArray: 0,
    fillOpacity:0,
    opacity:1
};

var hoverStyle = {
    color:'#5083B0',
    fillColor:'#5083B0',
    fillOpacity:0,
    weight:3,
    dashArray: '3',
    opacity: '1'
};

allLayers = new Array();

// CREATE LAYERS FROM TopoJSON
// Study Area Boundary
var study_area_boundary = omnivore.topojson(static_url+'Leaflet/myJSON/CA_Boundary_5_simplify.json')
    .on('ready',function(layer){
        this.eachLayer(function(dist){
            //dist.setStyle({color:'orange', weight:2, fill:'', fillOpacity:.001, opacity:.8 })
            dist.setStyle({color:'orange', weight:2, fillOpacity:0, opacity:.8 })
            //dist.setStyle(styleBLM Admin Units(dist.toGeoJSON().properties.FMNAME_PC))
            //dist.bindPopup(dist.toGeoJSON().properties.FMNAME_PC);
        })
    })//.addTo(map)


// Getting rid of the fill opacity above and adding the "on" function below allows the user click anywhere in the map
// when the 1km reporting units are selected because the study area boundary turns on when the 1km reporting units are selected.
study_area_boundary.on('click',function(e){selectFeature(e) })

allLayers.push(study_area_boundary)

//Counties
var counties = L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
});
var counties_layer = omnivore.topojson(static_url+'Leaflet/myJSON/CA_Reporting_Units_County_Boundaries_5_simplify.json', null, counties)

allLayers.push(counties)

//Jepson Ecoregions
var jepson_ecoregions = L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
});

var jepson_ecoregions_layer = omnivore.topojson(static_url+'Leaflet/myJSON/CA_Reporting_Units_Jepson_Ecoregions_2_simplify.json', null, jepson_ecoregions)

allLayers.push(jepson_ecoregions)

//BLM Field Offices
var blm_field_offices = L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
});

var blm_field_offices_layer = omnivore.topojson(static_url+'Leaflet/myJSON/CA_Reporting_Units_BLM_Field_Offices_7_simplify.json', null, blm_field_offices)

allLayers.push(blm_field_offices)

//Watersheds
var huc5_watersheds= L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
});

var huc5_watersheds_layer = omnivore.topojson(static_url+'Leaflet/myJSON/CA_Reporting_Units_HUC5_Watersheds_5_simplify.json', null, huc5_watersheds)

allLayers.push(huc5_watersheds)

//National Forests
var usfs_national_forests= L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
});

var usfs_national_forests_layer = omnivore.topojson(static_url+'Leaflet/myJSON/CA_Reporting_Units_USFS_National_Forests_15_simplify.json', null, usfs_national_forests)

allLayers.push(usfs_national_forests)

//1km Reporting Units | NOTE: 4KM reporting units, even simplified at 100% in mapshaper, makes the application unusable.
onekmBounds = [[36, -114], [36, -114]];
var onekm_url= static_url+'Leaflet/myPNG/single_transparent_pixel.png';
var onekm= L.imageOverlay(onekm_url, onekmBounds);

//Set Default Reporting Units
counties_layer.addTo(map)
reporting_units="counties"

//Map Layers in layer control. Arrange order here. Uses the grouped layers plugin.
OpenStreetMap=L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' })
lightGray= L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer')
worldTopo=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer').addTo(map)
USATopo=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer')
streetMap=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer')
imagery=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer')

var overlayMaps = {
    //"Selected Features":results_poly
}

var groupedOverlays = {
    /* Option to have reporting units in the upper right hand layer widget.
    "Reporting Units": {
        "Counties": counties,
        //"Jepson Ecoregions": jepson_ecoregions,
        "BLM Field Offices": blm_field_offices,
        "USFS National Forests": usfs_national_forests,
        "HUC5 Watersheds": huc5_watersheds,
        "User Defined (1km)": onekm,
    },
    */
    "Base Maps": {
        'Light Gray Base': lightGray,
        'World Topo Map': worldTopo,
        'USA Topo Map': USATopo,
        'Street Map': streetMap,
        'Imagery': imagery,
        'Open Street Map': OpenStreetMap,
    },
    "": {

        //"Selected Features": results_poly,
        "Study Area Boundary": study_area_boundary,
        //"Study Area Boundary": study_area_boundary.addTo(map),
    }

};

//The order here affects the order in the list in the upper left.
var reportingUnitLayers = {"Counties": counties, "Jepson Ecoregions": jepson_ecoregions, "USFS National Forests": usfs_national_forests, "BLM Field Offices": blm_field_offices,"HUC5 Watersheds": huc5_watersheds,"User Defined (1km)": onekm};

layerControl = L.control.layers(reportingUnitLayers, overlayMaps, {collapsed:false, position:'topleft', width:'300px'} ).addTo(map)

//reporting_units = last_reporting_units

//Layers icon in the upper right
var options = { exclusiveGroups: ["Reporting Units","Base Maps"]};
L.control.groupedLayers(overlayMaps, groupedOverlays, options).addTo(map);

map.on('baselayerchange', function (event) {
    var layer = event.layer;
    //boundary shows behind the admin units, slightly misaligned due to simplification of Admin Units.
    //if (event.name == "BLM Admin Units") { reporting_units="BLM Admin Units"; map.removeLayer(study_area_boundary)}
    if (event.name == "Counties") { remember_reporting_units=counties; reporting_units="counties"; map.removeLayer(study_area_boundary)}
    if (event.name == "USFS National Forests") { remember_reporting_units=usfs_national_forests; reporting_units="usfs_national_forests"; map.removeLayer(study_area_boundary)}
    if (event.name == "Jepson Ecoregions") { remember_reporting_units=jepson_ecoregions; reporting_units="jepson_ecoregions"; map.removeLayer(study_area_boundary)}
    if (event.name == "BLM Field Offices") { remember_reporting_units=blm_field_offices; reporting_units="blm_field_offices"; map.removeLayer(study_area_boundary)}
    if (event.name == "HUC5 Watersheds") { remember_reporting_units=huc5_watersheds; reporting_units="huc5_watersheds"; map.removeLayer(study_area_boundary)}
    if (event.name == "User Defined (1km)") { remember_reporting_units=onekm;reporting_units="onekm"; map.addLayer(study_area_boundary)}
});

// AJAX for posting
function create_post(newWKT) {
    initialize=0
    //console.log("create post is working!")
    $.ajax({
        url : "", // the endpoint (for a specific view configured in urls.conf /view_name/)
        //Webfactional
        //url : "/climate", // the endpoint
        type : "POST", // http method
        //data sent to django view with the post request
        //data : { the_post : $('#post-text').val() },
        data: {wktPOST: newWKT, reporting_units: reporting_units},

        // handle a successful response
        success : function(json) {
            //json is what gets returned from the HTTP Response
            //console.log(json); // log the returned json to the console
            //console.log("success");
            //console.log(response.resultsJSON)

            response=JSON.parse(json)
            resultsJSON=JSON.parse(response.resultsJSON)

            initialize=response.initialize;

            if (typeof results_poly != 'undefined') {
                map.removeLayer(results_poly)
                layerControl.removeLayer(results_poly)
            }

            last_poly=response.WKT_SelectedPolys
            results_poly = omnivore.wkt.parse(last_poly)

            //Allows for clicking reporting units that are beneath the selected feature(s).
            results_poly.on('click',function(e){selectFeature(e) })
            results_poly.addTo(map)
            results_poly.setStyle({color:'#00FFFF', weight: 5, dashArray: 0, fillOpacity:0, opacity:1})
            results_poly.bringToFront()

            layerControl.addOverlay(results_poly, "Current Selection");

            //Hide the initialization container upon successful response and show the tabs.
            document.getElementById('initialization_container').style.display="none";
            document.getElementById('tab_container').style.display="block";

            refreshSelectedFeaturesTab()
            //createDynamicDataTable()

            //Populate the list of selected features in the bottom left hand corner.
            if (reporting_units != "onekm"){
                $('.info2').html("<b><span style='color:#5083B0'>Currently Selected: "+response['categoricalValues']+"</span>")
            }
            else {
                $('.info2').html("")
            }

            //column chart colors.
            columnChartColorsCSV=response['columnChartColors']

            //create the charts.
            if (showChartOnMapSelect=="PointChart"){
                createChart(document.getElementById("variable_selection_form").value,document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
            }
            else if(showChartOnMapSelect=="BoxPlot"){
                createBoxPlot(document.getElementById("variable_selection_form").value,document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
            }
            else {
               createChart('tmax', 'avg', 's0')
            }
            createColumnChart()

        },

        // handle a non-successful response
        error : function(xhr,errmsg,err) {
            alert('No features selected. Please make a new selection.')
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $("#initialization_wait").css("display", "None");
        }

    });


    if (typeof firstChartDisplay == 'undefined'){
        animateClickToMapInfoBox()
    }
    else{
        $("#clickToMapInfo").hide();
    }
    firstChartDisplay=1

}

function onEachFeature(feature, layer) {
    layer.on({
        //Uncomment the line below (and the line in the select feature function) to trigger database query on feature click:
        click: selectFeature,
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

function selectFeature(e){

    //Comment out to prevent spinner on click. Uncomment in the map draw function.
    $(document).ajaxStart(function(){
        //Show Loading Bars on Draw
        $("#initialization_wait").css("display", "block");
        $("#view1").css("opacity", ".1");
        $("#view2").css("opacity", ".1");
        $(".wait").css("display", "block");
    });

    $(document).ajaxComplete(function(){
        $("#view1").css("opacity", "1");
        $("#view2").css("opacity", "1");
        $(".wait").css("display", "none");
        //map.removeLayer(layer)
    });

    user_wkt="POINT(" + e.latlng.lng + " " + e.latlng.lat + ")";
    //AJAX REQUEST
    create_post(user_wkt,reporting_units)
}

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(hoverStyle)

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    //this.openPopup();
    //document.getElementById("test").innerHTML = layer.feature.properties.NAME
    info2.update(layer.feature.properties);
}

function resetHighlight(e) {
    var layer= e.target
    layer.setStyle(defaultStyle)

    //info2.update('');
    if (initialize==0 && reporting_units != "onekm" && typeof response != 'undefined') {
        $('.info2').html("<b><span style='color:#5083B0'>Currently Selected: "+response['categoricalValues']+"</span>")
    }
    else {
        info2.update('');
    }
    if (typeof results_poly != 'undefined') {
        results_poly.bringToFront()
    }

}

function mouseOverTextChangeColor(hovername) {
    if (reporting_units=="counties"){text_hover_layer=counties}
    else if (reporting_units=="jepson_ecoregions"){text_hover_layer=jepson_ecoregions}
    else if (reporting_units=="epa_ecoregions"){text_hover_layer=epa_ecoregions}
    else if (reporting_units=="blm_field_offices"){text_hover_layer=blm_field_offices}
    else if (reporting_units=="huc5_watersheds"){text_hover_layer=huc5_watersheds}
    else if (reporting_units=="usfs_national_forests"){text_hover_layer=usfs_national_forests}
    else { text_hover_layer = null }

    if (text_hover_layer != null) {

        text_hover_layer.eachLayer(function(dist){
            if (dist.toGeoJSON().properties.NAME == hovername) {
                dist.setStyle(hoverStyle)
                if (!L.Browser.ie && !L.Browser.opera) {
                    dist.bringToFront();
                }
            }
        });

    }

}

function mouseOutTextChangeBack() {
        //Loop through the array of all layers and remove them
    allLayers.forEach( function (arrayItem) {
        arrayItem.setStyle(defaultStyle)
    })
    results_poly.bringToFront()

}

// BEGIN EXPORT TO WKT
// Takes user draw shape and converts it to WKT format. This ships to the PostGIS database where it is used in the SBL.
function toWKT(layer) {
    var lng, lat, coords = [];
    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
        var latlngs = layer.getLatLngs();
        for (var i = 0; i < latlngs.length; i++) {
            latlngs[i]
            coords.push(latlngs[i].lng + " " + latlngs[i].lat);
            if (i === 0) {
                lng = latlngs[i].lng;
                lat = latlngs[i].lat;
            }
        };
        if (layer instanceof L.Polygon) {
            return "POLYGON((" + coords.join(",") + "," + lng + " " + lat + "))";
        } else if (layer instanceof L.Polyline) {
            return "LINESTRING(" + coords.join(",") + ")";
        }
        //} else if (layer instanceof L.Marker) {
    } else if (layer instanceof L.Marker) {
        return "POINT(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + ")";
    }
}

map.on('draw:created', function (e) {

    $(document).ajaxStart(function(){
        //Show Loading Bars on Draw
        $("#initialization_wait").css("display", "block");
        $("#view1").css("opacity", ".1");
        $("#view2").css("opacity", ".1");
        $(".wait").css("display", "block");
    });

    $(document).ajaxComplete(function(){
        $("#view1").css("opacity", "1");
        $("#view2").css("opacity", "1");
        $(".wait").css("display", "none");
        map.removeLayer(layer)
    });

    if(map.hasLayer(results_poly)){
        map.removeLayer(results_poly)
    }

    var type = e.layerType;
    var layer = e.layer;
    drawnItems.addLayer(layer);
    //console.log(toWKT(layer));
    user_wkt=toWKT(layer);

    //Check for area selections that may take a long time. Ask for confirmation.
    if (e.layerType=='rectangle' || e.layerType=='polygon'){
        area=L.GeometryUtil.geodesicArea(layer.getLatLngs());
    } else{
        area=0
    }
    if ((reporting_units == 'onekm') & (e.layerType=='rectangle' || e.layerType=='polygon') & area > 10000000000 ){
        if (! confirm("Warning: This selection may require a significant amount of processing time. \n\n Click \"Ok\" to proceed with the selection, or \"Cancel\" to cancel the selection." )){drawnItems.clearLayers(); return}
    }

    create_post(user_wkt,reporting_units)

    //Don't show spinner on Select Features.
    //After a successful post from the drawing tools. set the display of the wait div back to none.
    /*

    $(document).ajaxStart(function(){
        $("#view1").css("opacity", "1");
        $("#view2").css("opacity", "1");
        $(".wait").css("display", "none");
    });
    $(document).ajaxComplete(function(){
        $("#view1").css("opacity", "1");
        $("#view2").css("opacity", "1");
        $(".wait").css("display", "none");
        map.removeLayer(layer)
    });
    */

})

/********************************* BEGIN MAP CONTROLS -- Right Hand Side **********************************************/

//Opacity/transparency slider on image overlays
var handle = document.getElementById('handle'),
    start = false,
    startTop;

document.onmousemove = function(e) {
    if (!start) return;
    // Adjust control.
    handle.style.top = Math.max(-5, Math.min(145, startTop + parseInt(e.clientY, 10) - start)) + 'px';

    fillOpacityLevel=(1 - (handle.offsetTop / 150));

    // Adjust opacity on image overlays.
    if (climate_PNG_overlay_url != '') {
        climate_PNG_overlay.setOpacity(fillOpacityLevel);
    }
    // Adjust opacity on climateDivisions.
    near_term_climate_divisions.setStyle({fillOpacity: fillOpacityLevel});
};

handle.onmousedown = function(e) {
    // Record initial positions.
    start = parseInt(e.clientY, 10);
    startTop = handle.offsetTop - 5;
    return false;
};

document.onmouseup = function(e) {
    start = null;
};

//Move the zoom level buttons (put below the layers)
L.control.zoom({
    position:'topright'
}).addTo(map);


//BEGIN TEXT UPPER LEFT ("Selection Tools")

var toolTitle = L.Control.extend({
    options: {position: 'topleft'},

    onAdd: function (map) {
        this._div = L.DomUtil.create('div', 'toolTitle2');
        this._div.innerHTML = "2. Select Features<br><div class='info2Subtitle'>(Use the tools below or click on a feature)</div>";
        return this._div;
    },
});

map.addControl(new toolTitle());

//END TEXT UPPER LEFT

//BEGIN LEAFLET.DRAW
drawnItems = L.featureGroup().addTo(map);

var drawButtons = new L.Control.Draw({
    /*edit: { featureGroup: drawnItems },*/
    draw: {
        polyline: true,
        circle: false,
        marker: false,
        polygon: {
            shapeOptions: {
                color:"#00FFFF",
                opacity:.6
            },
        },
        rectangle: {
            shapeOptions: {
                color:"#00FFFF",
                opacity:.6
            }
        },
        showArea:true,
    },
})
map.addControl(drawButtons)

map.on('draw:created', function(event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);
})
//END LEAFLET.DRAW

// BEGIN TEXT BOTTOM LEFT
var info2 = L.control({position:'bottomleft'});

info2.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info2');
    this.update();
    return this._div;
};

info2.update = function (props) {
    this._div.innerHTML =(props ?
        '<b><span style="color:#5083B0">' + props.NAME + '</span></b><br />'
        : ' ');
};

// add the info window to the map
info2.addTo(map);
// END TEXT BOTTOM LEFT

/********************************* END MAP CONTROLS -- Right Hand Side **********************************************/

/**************************************  Near-Term Forecast *********************************************************/

var near_term_climate_divisions= L.geoJson(null, {

    onEachFeature:passClimateDivisionID,

});

//var near_term_climate_divisions_layer= omnivore.topojson(static_url+'Leaflet/myJSON/Climate_Divisions_CA_Clip.json', null, near_term_climate_divisions)
var near_term_climate_divisions_layer= omnivore.topojson(static_url+'Leaflet/myJSON/Climate_Divisions_USA.json', null, near_term_climate_divisions)

function passClimateDivisionID(feature, layer) {
    layer.on({
        click: function (e) { generateNearTermClimateResults(selectedNearTermClimatePeriod, feature.properties.NAME); selectClimateDivision(e); },
        mouseover: highlightClimateDivision,
        mouseout: resetClimateDivision
    });
}

function highlightClimateDivision(e) {
    var layer = e.target;
    climateDivisionHover=layer.feature.properties.NAME
    document.getElementsByClassName('info2')[0].innerHTML='<span style="font-weight:bold; color: #5083B0;">Click to select Climate Division ' + climateDivisionHover+ '</span>'
}

function resetClimateDivision(e) {
    document.getElementsByClassName('info2')[0].innerHTML='<span style="font-weight:bold; color: #5083B0;">Currently Selected: Climate Division ' + selectedClimateDivision + '</span>'
}


function selectClimateDivision(e) {

    //set all polygon border back to the default.
    near_term_climate_divisions.setStyle({color:'#444444', weight:2})

    clickedPolygon = e.target;
    document.getElementsByClassName('info2')[0].innerHTML='<span style="font-weight:bold; color: #5083B0;">Currently Selected: Climate Division ' + selectedClimateDivision + '</span>'
    selectedClimateDivision=clickedPolygon.feature.properties.NAME

    clickedPolygon.setStyle({color :'#00FFFF', weight:5})

    if (!L.Browser.ie && !L.Browser.opera) {
        clickedPolygon.bringToFront();
    }
}

function activateMapForClimateForecast(){

    if ( typeof fillOpacityLevel == 'undefined') {
        fillOpacityLevel=.85
    }

    $('.leaflet-control-layers').hide()
    $('.leaflet-draw').hide()
    $('.toolTitle2').hide()
    $('.toolTitle').html('Select a Climate Division')
    $('.leaflet-bottom').show()
    $('.ui-opacity').show()
    $('.leaflet-control-layers:nth-child(1)').show()

    map.setView([37.229722,-121.509444],6);

    generateNearTermClimateResults(selectedNearTermClimatePeriod,selectedClimateDivision)

    //Loop through the array of all layers and remove them
    allLayers.forEach( function (arrayItem) {
        map.removeLayer(arrayItem)
    })

    //Also remove any climate overlays nd the results_poly
    map.removeLayer(climate_PNG_overlay)
    map.removeLayer(results_poly)

    /*  Note: this works too:
    var arrayLength = allLayers.length;
    for (var i = 0; i < arrayLength; i++) {
                map.removeLayer(allLayers[i])
    }
    */

    near_term_climate_divisions.addTo(map)
    near_term_climate_divisions.bringToFront()

    updateNearTermForecastLegend()
    updateClimateDivisionSymbology()

    document.getElementsByClassName('info2')[0].innerHTML='<span style="font-weight:bold; color: #5083B0;">Currently Selected: Climate Division ' + selectedClimateDivision + '</span>'
}

function updateNearTermForecastLegend(){

    if (typeof selectedNearTermVariableToMap=='undefined' ||  selectedNearTermVariableToMap=='temp'){
       legendTitle="Temperature Change <br> (Forecast - Historical)"
       units='&deg; F'
       color_6='#D62F27'
       color_5='#F56C42'
       color_4='#FCAE60'
       color_3='#FFE291'
       color_2='#FFFFBF'
       color_1='#DADADA'
       color_0='#4575B5'
    } else if (selectedNearTermVariableToMap=='precip'){
       legendTitle="Precipitiation Change <br> (Forecast - Historical)"
       units=' in.'
       color_6='#002673'
       color_5='#08519c'
       color_4='#3182bd'
       color_3='#6baed6'
       color_2='#bdd7e7'
       color_1='#DADADA'
       color_0='#654321'
    }

    label_6='> 1' + units
    label_5='>.75' + units
    label_4='>.50' + units
    label_3='>.25' + units
    label_2='> 0' + units
    label_1='No Change'
    label_0='Decrease'

    legend_image=''

    document.getElementsByClassName('info')[0].innerHTML=

        '<div id="LegendHeader">' + legendTitle+ '</div>' +
            '<table class="legendTable" border="0">' +
            '<td class="symbologyTd" style="background-color:' + color_6 + '"></td><td style="vertical-align:top">'+label_6+'</td></tr>' +
            '<td class="symbologyTd" style="background-color:' + color_5 + '"></td><td>'+label_5+'</td></tr>' +
            '<td class="symbologyTd" style="background-color:' + color_4 + '"></td><td>'+label_4+'</td></tr>' +
            '<td class="symbologyTd" style="background-color:' + color_3 + '" ></td><td style="vertical-align:middle">'+label_3+'</td></tr>' +
            '<td class="symbologyTd" style="background-color:' + color_2 + '"></td><td>'+label_2+'</td></tr>' +
            '<td class="symbologyTd" style="background-color:' + color_1 + '"></td><td>'+label_1+'</td></tr>' +
            '<td class="symbologyTd" style="background-color:' + color_0 + '"></td><td style="vertical-align:bottom">'+label_0+'</td></tr>' +
            '</tr></table>';
}

function activateMapForDefault(){

    if (climate_PNG_overlay_url != ''){

        climate_PNG_overlay.addTo(map)
        climate_PNG_overlay.bringToBack()
        $('.ui-opacity').show()

    } else {

        $('.ui-opacity').hide()
    }

    $('.leaflet-control-layers').show()
    $('.leaflet-draw').show()
    $('.toolTitle2').show()
    $('.toolTitle').html('1. Select Reporting Units')

    map.setView(latlng,zoomLevel);

    map.removeLayer(near_term_climate_divisions)
    map.addLayer(study_area_boundary)
    if (typeof remember_reporting_units == 'undefined') {
        map.addLayer(counties)
    }
    else {
        map.addLayer(remember_reporting_units)
    }
    if (typeof results_poly != 'undefined' && results_poly != '') {
        //map.addLayer(results_poly)
    }
    //map.addLayer(results_poly)
    document.getElementsByClassName('info2')[0].innerHTML=''
    document.getElementsByClassName('info')[0].innerHTML=''

}

function updateClimateDivisionSymbology(){

    selectedNearTermVariableToMap = $('input[name=nearTermMapVariable]:checked').val();

    map.removeLayer(near_term_climate_divisions)

    near_term_climate_divisions= L.geoJson(null, {
        style: function(feature) {

            if (feature.properties.NAME == selectedClimateDivision){
                if (selectedNearTermVariableToMap == 'temp'){
                    return { fillColor: getNearTermColor(allTempDeltaDict[feature.properties.NAME][selectedNearTermClimatePeriod-1]), weight:5, color: '#00FFFF',  dashArray: 0, fillOpacity: fillOpacityLevel}
                }
                else if (selectedNearTermVariableToMap == 'precip') {
                    return { fillColor: getNearTermColor(allPrecipDeltaDict[feature.properties.NAME][selectedNearTermClimatePeriod-1]), weight:5, color: '#00FFFF',  dashArray: 0, fillOpacity: fillOpacityLevel}
                }
            } else{
                if (selectedNearTermVariableToMap == 'temp'){
                    return { fillColor: getNearTermColor(allTempDeltaDict[feature.properties.NAME][selectedNearTermClimatePeriod-1]), weight:2, color: '#444444', dashArray: 0, fillOpacity: fillOpacityLevel }
                }
                else if (selectedNearTermVariableToMap == 'precip') {
                    return { fillColor: getNearTermColor(allPrecipDeltaDict[feature.properties.NAME][selectedNearTermClimatePeriod-1]), weight:2, color: '#444444', dashArray: 0, fillOpacity: fillOpacityLevel}
                }
            }
        },
        onEachFeature:passClimateDivisionID,

    });

    //near_term_climate_divisions_layer= omnivore.topojson(static_url+'Leaflet/myJSON/Climate_Divisions_CA_Clip.json', null, near_term_climate_divisions)
    near_term_climate_divisions_layer= omnivore.topojson(static_url+'Leaflet/myJSON/Climate_Divisions_USA.json', null, near_term_climate_divisions)
    map.addLayer(near_term_climate_divisions)
}

function getNearTermColor(d) {

    if (selectedNearTermVariableToMap=='temp'){

    return d > 1  ? '#D62F27' :
        d > 0.75  ? '#F56C42' :
        d > 0.5   ? '#FCAE60' :
        d > 0.25  ? '#FFE291' :
        d > 0     ? '#FFFFBF' :
        d == 0    ? '#DADADA' :
                     '#4575B5';
    } else {

    return d > 1  ? '#002673' :
        d > 0.75  ? '#08519c' :
        d > 0.5   ? '#3182BD' :
        d > 0.25  ? '#6BAED6' :
        d > 0     ? '#BDD7E7' :
        d == 0    ? '#DADADA' :
                     '#654321';
    }

}

//************************************ End Near-Term Forecast ********************************************************//