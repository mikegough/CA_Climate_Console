//set a cookie for introJS. Only show on first visit
function setCookie(c_name,value,exdays){
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

//check for the cookie when user first arrives, if cookie doesn't exist call the intro.
function getCookie(c_name){
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1){
      c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1){
      c_value = null;
    }
    else{
      c_start = c_value.indexOf("=", c_start) + 1;
      var c_end = c_value.indexOf(";", c_start);
      if (c_end == -1){
        c_end = c_value.length;
      }
      c_value = unescape(c_value.substring(c_start,c_end));
    }

    return c_value;
}

var latlng = L.latLng(initialLat,initialLon);
enableDownscale = false;

var map = L.map("map", {
    zoomControl: false,
    clickable: false,
    drawcontrol:false,
}).setView(latlng,zoomLevel);

// Hack for map.on('click',onClick) is also fired when zoombox #1884
// Prevents zoombox from also doing a map click.
var mousedownPoint; // global
map.on('mousedown', function (e) {
  mousedownPoint = e.containerPoint;
});

//SCALE BAR
L.control.scale({maxWidth:200}).addTo(map);

//DYNAMIC LEGEND
var dynamic_legend = L.control({position: 'bottomleft'});

//Initialize Legend
dynamic_legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML=""
    return div;
};

//Swap legend on data point click
function swapLegend(layerToAddName, layerToAdd, climateVariable, modelName) {

    //layerToAdd is null for climate data
    if (layerToAdd != null) {
        layerIndex = layerToAdd.split(':')[1]
        layerToAdd = layerToAdd.split(':')[0]

        if (typeof layerIndex == 'undefined' || layerIndex == '') {
            dbid_with_index = EEMSParams["models"][modelForTree][5]
        }
        else {
            if (dbid != '') {
                urlBase = EEMSParams["models"][modelForTree][5].split('&')[0]
                dbid_with_index = urlBase + "&visibleLayers=" + layerIndex
            }
        }
    }

    DataBasinLayerIndex='0'

    if ((! map.hasLayer(climate_PNG_overlay) && ! map.hasLayer(layerToAdd)) || layerToAddName == 'single_transparent_pixel') {

        document.getElementsByClassName('info legend leaflet-control')[0].innerHTML=''
        $(".info").hide();

    } else {
        $(".info").show();

       if (typeof Data_Basin_ID_Dict != 'undefined' ) {
           dbid = Data_Basin_ID_Dict[layerToAddName]
       }

        //Column chart click
        if (climateVariable=='EEMSmodel'){

            legendTitle=EEMSParams["models"][layerToAddName][0]
            legendImage="/Legends/"+EEMSParams["models"][layerToAddName][2]
            legendHeight=EEMSParams["models"][layerToAddName][3]
            legendLabels=EEMSParams["models"][layerToAddName][4]
            dbid=dbid_with_index

        }

        //JIT tree standard
        else if (climateVariable=='EEMSmodelTREE_Standard'){

            legendTitle=layerToAdd
            legendImage="/Legends/"+EEMSParams["models"][layerToAddName][2]
            legendHeight=EEMSParams["models"][layerToAddName][3]
            legendLabels=EEMSParams["models"][layerToAddName][4]
            dbid=dbid_with_index

        }

        //JIT tree stretched
        else if (climateVariable=='EEMSmodelTREE_Stretched') {

            // Updated version. Legend name matched to filename.  Non-shared legends for non-fuzzy inputs.

            legendTitle=layerToAdd
            legendImage="/Legends/" + eems_file_name.split(".")[0] + "_" + layerToAddName +"_legend"
            legendHeight=""
            legendLabels=EEMSParams["models"]["inputs"][4]
            dbid=dbid_with_index
        }

        else if (climateVariable=="EcosystemServices"){

            legendTitle=modelName
            legendImage="/Legends/" + layerToAddName +"_legend"
            legendHeight=""

        }

        //Climate
        else {

            //Legend Title
            timePeriod=climateParams["timePeriodLabels"][parseInt(layerToAddName.match(/\d+$/)[0])];
            season=layerToAddName.replace(/.*s0.*/,'Annual').replace(/.*s1.*/,'Jan-Feb-Mar').replace(/.*s2.*/,'Apr-May-Jun').replace(/.*s3.*/,'Jul-Aug-Sep').replace(/.*s4.*/,'Oct-Nov-Dec')

            if (modelName == "PRISM") {
                //For PRISM, the layer index comes from the season, s0 is the average and is the first layer in the Data Basin Dataset, s1 is PRISM JFM, etc. Get the index number from the layer name.
                DataBasinLayerIndex = layerToAddName.substring(7, 8)
            }
            else {
                DataBasinLayerIndex = climateParams["models"][modelName][2]
            }

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
                var climateVariableLabel='Potential Evapotranspiration'

            } else if (layerToAddName.indexOf('vpr') != -1  ){
                var climateVariableLabel='Vapor Pressure'
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

            if (typeof dbid != "undefined" && dbid != "") {
                dbid = dbid + '&visibleLayers=' + DataBasinLayerIndex
            }
        }
          //If its a classified renderer from the EEMS charts or a climate variable
          if (renderer=="classified" || climateVariable.indexOf("EEMS") < 0) {
              if (typeof dbid !="undefined") {
                  document.getElementsByClassName('info')[0].innerHTML =
                      '<div id="DataBasinRedirect" title="Click to view or download this dataset on Data Basin"> <a target="_blank" href="http://databasin.org/maps/new#datasets=' + dbid + '"><img class="DataBasinRedirectImg"  src="' + static_url + 'img/dataBasinRedirect.png">' +
                      '<div id="DataBasinRedirectText">View this in<br>Data Basin</div></div></a>'
              }
              else {
                  document.getElementsByClassName('info')[0].innerHTML =''
              }
               document.getElementsByClassName('info')[0].innerHTML+=
              '<div id="LegendHeader">' + legendTitle + '</div>' +
                  //'<img style="float:left" height="' + legendHeight + '" src="'+static_url+'Leaflet/myPNG/climate/TrimmedPNG/'+legendImage + '.png">'+
              '<img style="float:left" height="' + legendHeight + '" src="' + static_url + 'Leaflet/myPNG/climate/' + climateParams['imageOverlayDIR'] + '/' + legendImage + '.png">' +
              '<div class="legendLabels">'

              if (typeof EEMSParams['models'][layerToAddName] != 'undefined') {
                  for (i in legendLabels) {
                      $(".legendLabels").append(legendLabels[i] + "<br>");
                  }
              }

          } else {
                //Otherwise, go into the stretched directory
                document.getElementsByClassName('info')[0].innerHTML =
                '<div id="DataBasinRedirect" title="Click to view or download this dataset on Data Basin"> <a target="_blank" href="http://databasin.org/maps/new#datasets=' + dbid + '"><img class="DataBasinRedirectImg"  src="' + static_url + 'img/dataBasinRedirect.png">' +
                '<div id="DataBasinRedirectText">View this in<br>Data Basin</div></div></a>' +
                '<div id="LegendHeader">' + legendTitle + '</div>' +
                '<img style="float:left" height="" src="' + static_url + 'Leaflet/myPNG/climate/' + climateParams['imageOverlayDIR'] + '/Stretched/' + legendImage + '.png">' +
                '<div class="legendLabelsStretch">';
                $(".legendLabelsStretch").append("Highest<br><br><br><br><br>Lowest");

          }

          if (typeof dbid == "undefined" || dbid == ''){
              $('#DataBasinRedirect').hide()
          }

        }

}

overlay_bounds = climateParams['overlayBounds'];

if (typeof climate_PNG_overlay != 'undefined') {
    climate_PNG_overlay_url=static_url+'Leaflet/myPNG/climate/'+climateParams['imageOverlayDIR']+'/' + climate_PNG_overlay
    climate_PNG_overlay=L.imageOverlay(climate_PNG_overlay_url, overlay_bounds);
    climate_PNG_overlay.addTo(map)

} else {
    climate_PNG_overlay_url='';
    climate_PNG_overlay=L.imageOverlay(climate_PNG_overlay_url, overlay_bounds);
}

base_data_PNG_overlay="";

var opacitySlider;

//Function used by the Climate chart to add PNGs. Obviates the need to manually define each image overlay object.
function swapImageOverlay(layerName,modelType) {


        //This is for multi-lcc overlays.
        if (map.hasLayer(base_data_PNG_overlay)){
            map.removeLayer(base_data_PNG_overlay)
        }

        //Need different overlay bounds for EEMS Models
        //The PNGs that come out of clover are not clipped to the data perfectly. So for those PNGs that come from the
        //Automated ArcMap Script, a different extent is needed.
        if (modelType=="EEMSmodel"){
            if (EEMSParams["models"][modelForTree][9]) {
                overlayBoundsNumber=(EEMSParams["models"][modelForTree][9]).toString()
                overlay_bounds = EEMSParams['overlayBounds' + overlayBoundsNumber];
            }
            else {
                overlay_bounds = EEMSParams['overlayBounds'];
            }
        }
        else if (modelType=="EcosystemServices"){
            overlay_bounds = ecosystemServicesParams["overlayBounds"];
        }

        else if (modelType == "bioclim") {

            overlay_bounds = [[32.427039656896916, -124.50659879999502], [42.06857458777702, -113.50224080966714]]
        }
        else{
            overlay_bounds = climateParams['overlayBounds'];
        }

        $("#clickToMapInfo").hide();
        //Transparency slider
        elements = document.getElementsByClassName('ui-opacity');
        map.removeLayer(climate_PNG_overlay);
        //ti
        if (climate_PNG_overlay_url.search(layerName)> 0 && lastRenderer==renderer){
            map.removeLayer(climate_PNG_overlay);
            climate_PNG_overlay_url="";
            //Transparency slider

            for (var i = 0; i < elements.length; i++) {
                elements[i].style.display = elements[i].style.display = 'none';
            }

        } else {
                if (renderer=='stretched' && modelType== "EEMSmodel") {
                    climate_PNG_overlay_url = static_url + 'Leaflet/myPNG/climate/' + climateParams['imageOverlayDIR'] + '/Stretched/' + layerName + '.png';
                }
                else{
                    climate_PNG_overlay_url = static_url + 'Leaflet/myPNG/climate/' + climateParams['imageOverlayDIR'] + '/' + layerName + '.png';
                }

                climate_PNG_overlay=L.imageOverlay(climate_PNG_overlay_url, overlay_bounds);

                climate_PNG_overlay.addTo(map);
                climate_PNG_overlay.bringToBack();
                elements=document.getElementsByClassName('ui-opacity');
                //Transparency slider
                for (var i = 0; i < elements.length; i++) {
                    elements[i].style.display = elements[i].style.display = 'inline';
                }
                climate_PNG_overlay.setOpacity(1 - (handle.offsetTop / 200))

        }

        if (typeof opacitySlider  != "undefined") {
            map.removeControl(opacitySlider);
        }

        opacitySlider = new L.Control.opacitySlider();
        map.addControl(opacitySlider);
        opacitySlider.setOpacityLayer(climate_PNG_overlay);

        lastRenderer=renderer;

        //For keeping table row selected
        climate_PNG_overlay.name=layerName;

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
    color: '#737373',
    weight:1,
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

//1km Reporting Units | NOTE: 4KM reporting units, even simplified at 100% in mapshaper, makes the application unusable.
onekmBounds = [[36, -114], [36, -114]];
var onekm_url= static_url+'Leaflet/myPNG/single_transparent_pixel.png';
var onekm= L.imageOverlay(onekm_url, onekmBounds);

allLayers = new Array();

// CREATE LAYERS FROM TopoJSON
// Study Area Boundary
if (typeof studyAreaBoundary != "undefined") {
    var study_area_boundary = omnivore.topojson(static_url + 'Leaflet/myJSON/' + studyAreaBoundary)
        .on('ready', function (layer) {
            this.eachLayer(function (dist) {
                //dist.setStyle({color:'orange', weight:2, fill:'', fillOpacity:.001, opacity:.8 })
                dist.setStyle({color: 'orange', weight: 2, fillOpacity: 0, opacity: .8})
                //dist.setStyle(styleBLM Admin Units(dist.toGeoJSON().properties.FMNAME_PC))
                //dist.bindPopup(dist.toGeoJSON().properties.FMNAME_PC);
            })
        })//.addTo(map)

// Getting rid of the fill opacity above and adding the "on" function below allows the user click anywhere in the map
// when the 1km reporting units are selected because the study area boundary turns on when the 1km reporting units are selected.
    study_area_boundary.on('click', function (e) {
        selectFeature(e)
    });

    allLayers.push(study_area_boundary)
}

//Create reporting units from config file.
i = 0;
var reportingUnitLayers = {};

for (reporting_unit in reportingUnits) {
    dbtable = reportingUnits[reporting_unit][0];
    dbnamefield = reportingUnits[reporting_unit][1];
    eval("var layer" + i + "= L.geoJson(null, { style: defaultStyle, onEachFeature: onEachFeature, dbtable:'" + dbtable + "',dbnamefield:'"+dbnamefield +"',name:'"+Object.keys(reportingUnits)[i]+"'  });");
    json_file = reportingUnits[reporting_unit][2];
    if (json_file) {
        eval("var layer" + i + "_layer = omnivore.topojson(static_url + 'Leaflet/myJSON/" + json_file + "', null,layer" + i + ")");
        allLayers.push(eval("layer" + i))
    }

    reportingUnitsName = Object.keys(reportingUnits)[i]
    reportingUnitLayers[reportingUnitsName] = eval("layer" + i);
    reporting_units = dbtable;
    i++
}

// Reporting units that use image overlays.
if (typeof reportingUnitsImageOverlays != "undefined") {
    for (reporting_unit_overlay in reportingUnitsImageOverlays) {
        reporting_unit_overlay_url = reportingUnitsImageOverlays[reporting_unit_overlay][2];
        reporting_unit_overlay_bounds = reportingUnitsImageOverlays[reporting_unit_overlay][3];
        reportingUnitLayers[reporting_unit_overlay] = L.imageOverlay(static_url + reporting_unit_overlay_url, reporting_unit_overlay_bounds);
        reportingUnitLayers[reporting_unit_overlay].options.name = reporting_unit_overlay;
        reportingUnitLayers[reporting_unit_overlay].options.dbtable = reportingUnitsImageOverlays[reporting_unit_overlay][0];
        reportingUnitLayers[reporting_unit_overlay].options.dbnamefield = reportingUnitsImageOverlays[reporting_unit_overlay][1];
        reportingUnitLayers[reporting_unit_overlay].options.type = "ImageOverlayType"
    }
}

//default reportingUnits is the first one in the config file
reporting_units = reportingUnits[Object.keys(reportingUnits)[0]][0];
name_field = reportingUnits[Object.keys(reportingUnits)[0]][1];
activeReportingUnitsName = Object.keys(reportingUnits)[0];
//Add the first layer to the map
layer0.addTo(map);
activeReportingUnits = layer0;

//1km Reporting Units | NOTE: 4KM reporting units, even simplified at 100% in mapshaper, makes the application unusable.
onekmBounds = [[36, -114], [36, -114]];
var onekm_url= static_url+'Leaflet/myPNG/single_transparent_pixel.png';
var onekm= L.imageOverlay(onekm_url, onekmBounds);

//Map Layers in layer control. Arrange order here. Uses the grouped layers plugin.
OpenStreetMap=L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' });
lightGray= L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer');
worldTopo=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer');
USATopo=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer');
streetMap=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer');
imagery=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer');
oceans=L.esri.tiledMapLayer('http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer');

if (typeof initialBaseMap == "undefined"){
    initialBaseMap="worldTopo";
}

eval(initialBaseMap).addTo(map);

var overlayMaps = {
    //"Selected Features":results_poly
}


if (typeof studyAreaBoundary != "undefined") {
    var groupedOverlays = {
        // Option to have reporting units in the upper right hand layer widget.
         "Reporting Units": {
         },
        "Base Maps": {
            'Light Gray Base': lightGray,
            'World Topo Map': worldTopo,
            'USA Topo Map': USATopo,
            'Street Map': streetMap,
            'Imagery': imagery,
            'Open Street Map': OpenStreetMap,
            'Oceans': oceans,
        },
        "": {

            "Study Area Boundary": study_area_boundary,
        },
        "Reference Layers": {
        }
    };
} else {
    var groupedOverlays = {
        "Base Maps": {
            'Light Gray Base': lightGray,
            'World Topo Map': worldTopo,
            'USA Topo Map': USATopo,
            'Street Map': streetMap,
            'Imagery': imagery,
            'Open Street Map': OpenStreetMap,
        },
        "Reference Layers": {
        }
    }
}

$.each(reportingUnitLayers, function(name, layer){

    if (typeof layer != "undefined") {
        groupedOverlays["Reporting Units"][name] = layer
    }

});

/**************************************  WMS Reference Layer functions  ***********************************************/

map.on('overlayadd', function (eventLayer) {
    var wms_legend_div_id = this._leaflet_id;
    // ADD the WMS Legend
    if (typeof wmsLayers != "undefined" && typeof wmsLayers[eventLayer.name] != "undefined") {
        var legend_url = static_url + 'Leaflet/my_leaflet/legends/' + wmsLayers[eventLayer.name][1];
        $('.info_wms').prepend("<div id ='" + wms_legend_div_id + "'><div id='legendHeader'>" + eventLayer.name + "</div><img class='wms_legend' src=" + legend_url + "><br><div class='wms_source'> <a target='_blank' href='" + wmsLayers[eventLayer.name][4] + "'>Click to View Source </a></div><hr></div>")
        $(".info_wms").show();
    }
});

map.on('overlayremove', function (eventLayer) {
    // Remove the WMS Legend
    var wms_legend_div_id = this._leaflet_id;
    if (typeof wmsLayers != "undefined" && typeof wmsLayers[eventLayer.name] != "undefined") {
        $("#" + wms_legend_div_id).remove()
        $(".info_wms").hide();
    }
});

// Add wms layers if they are defined in the config file.
if (typeof wmsLayers != "undefined") {
    //DYNAMIC LEGEND FOR WMS
        var dynamic_legend_wms = L.control({position: 'bottomright'});

    //Initialize Legend
        dynamic_legend_wms.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info_wms');
            div.innerHTML="";
            return div;
        };

    dynamic_legend_wms.addTo(map);

    $.each(wmsLayers, function (index, value) {
        var wmsLayer = L.tileLayer.wms(value[0], {
            layers: value[2],
            format: 'image/png',
            transparent: true,
        });
        wmsLayer.setOpacity(1);
        groupedOverlays["Reference Layers"][index] = wmsLayer;
        if (value[3] == "on"){
            initialWMSLayer = wmsLayer
        }
    });
}

/**************************************  END WMS Reference Layer functions  *******************************************/

// Adding the climate legend after adding the WMS legend makes it go above the WMS legend.
dynamic_legend.addTo(map);


/*
layerControl = L.control.layers(reportingUnitLayers, overlayMaps, {collapsed:false, position:'topleft', width:'300px'} ).addTo(map);
*/

//Layers icon in the upper right
var options = { exclusiveGroups: ["Reporting Units","Base Maps"], position:'topleft'};
L.control.groupedLayers(overlayMaps, groupedOverlays, options).addTo(map);

//Load the initial WMSLayer (apparently this needs to be down here after the line above)
if (typeof initialWMSLayer != "undefined") {
    initialWMSLayer.addTo(map);
}

map.on('overlayadd', function (event) {
    activeReportingUnits = event.layer;
    activeReportingUnitsName = event.layer.options.name;
    reporting_units = event.layer.options.dbtable;
    name_field = event.layer.options.dbnamefield;

    if (event.name == "User Defined (1km)" ) {
        reporting_units=reportingUnits["User Defined (1km)"][0]; //map.addLayer(study_area_boundary)
    }
    else if (event.name == "User Defined (4km)" ) {
        reporting_units=reportingUnits["User Defined (4km)"][0]; //map.addLayer(study_area_boundary)
    }
    // Reporting units using image overlays. Add study area boundary to allow for click to select
    else if (typeof event.layer.options.type != "undefined" && event.layer.options.type == "ImageOverlayType") {
         map.addLayer(study_area_boundary)
         reportingUnitLayers[reporting_unit_overlay].bringToBack()
         climate_PNG_overlay.bringToBack()
    }
    else {
        map.removeLayer(study_area_boundary)
    }
});

if (typeof ecosystemServicesParams == "undefined"){
    ecosystemServicesParams=[];
    ecosystemServicesParams["continuousTables"]="";
    ecosystemServicesParams["vtypeTables"]="";
}

// AJAX for posting
function create_post(newWKT) {

    startLoading();
    initialize=0;

   if (side_panel_status == "visible"){
    $("#side_tab").click();
   }

    var continuousTablesList=[];
    var vtypeTablesList=[];

    if (typeof ecosystemServicesParams[activeReportingUnitsName] != "undefined") {
        $.each(ecosystemServicesParams[activeReportingUnitsName]["continuousTables"], function (key, value) {
            continuousTablesList.push(value)
        });
        $.each(ecosystemServicesParams[activeReportingUnitsName]["vtypeTables"], function (key, value) {
            vtypeTablesList.push(value)
        });
    }

    $.ajax({
        url : "", // the endpoint (for a specific view configured in urls.conf /view_name/)
        //Webfactional
        //url : "/climate", // the endpoint
        type : "POST", // http method
        //data sent to django view with the post request
        //data : { the_post : $('#post-text').val() },
        data: {
            wktPOST: newWKT,
            reporting_units: reporting_units,
            name_field:name_field,
            ecosystem_services_continuous_tables:continuousTablesList,
            ecosystem_services_vtype_tables:vtypeTablesList
        },
        // handle a successful response
        success : function(json) {

            $("#results").show();

            $(".info2").show();
            timesRun=initialize+1;
            //json is what gets returned from the HTTP Response
            //console.log(json); // log the returned json to the console

            response=JSON.parse(json);
            resultsJSON=JSON.parse(response.resultsJSON);

            centroid=resultsJSON['centroid'];

            if (centroid != 0 && typeof centroid != 'undefined') {
                centerLat = centroid.split("(")[1].split(" ")[1].replace(")", "");
                centerLon = parseFloat(centroid.split("(")[1].split(" ")[0])+2.5;
                centerCoords = [];

                centerCoords.push(centerLat);
                centerCoords.push(centerLon);

                map.setView(centerCoords, 7);
            }
            else {

                    $("#map").css("width","")
                    $("#dataTableContainer").css("display","block")
                    $("#detailedView").css("display","none")
                    $("#about").css("display","none")
                    $("#tab_container").css("width","")
                    $("#dataTableDiv").css("width","")
                    $("#detailedView").css("width","")
                    $("#detailedView").css("float","")

            }

            //Update Utah with the new field code naming convention

            if (title == 'Utah/COP') {

                function findAndReplace(object) {
                    //console.log(Object.keys(object))
                    oldKeys = Object.keys(object)
                    for (i = 0; i < oldKeys.length; i++) {
                        //console.log(oldKeys[i])
                        newKey = oldKeys[i].replace('eeccfz1530', 'eecefzt1')
                        newKey = newKey.replace('eeccfz4560', 'eecefzt2')
                        newKey = newKey.replace('eepifz1530', 'eepifzt1')
                        newKey = newKey.replace('eepifz4560', 'eepifzt2')
                        newKey = newKey.replace('6899', 's0t0')
                        newKey = newKey.replace('1530', 's0t1')
                        newKey = newKey.replace('4560', 's0t2')
                        //newKey = newKey.replace('tmass0', 'tmaxs2')
                        //newKey=newKey.replace('tmis','tmins0')
                        resultsJSON[newKey] = object[oldKeys[i]]
                        //Don't delete old key...if a key isn't replaced, it will get deleted.
                    }
                }

                findAndReplace(resultsJSON)
            }

            updateQuickViewTable(document.getElementById("season_selection_form").value);

            initialize=response.initialize;

            if (typeof results_poly != 'undefined') {
                map.removeLayer(results_poly);
                //layerControl.removeLayer(results_poly)
            }

            last_poly = response.WKT_SelectedPolys;
            results_poly = omnivore.wkt.parse(last_poly);
            results_poly_centroid = results_poly.getBounds().getCenter();

            //Allows for clicking reporting units that are beneath the selected feature(s).
            results_poly.on('click',function(e){selectFeature(e) });
            results_poly.addTo(map);
            results_poly.setStyle({color:'#00FFFF', weight: 5, dashArray: 0, fillOpacity:0, opacity:1})
            results_poly.bringToFront();

            extract_raster_values(last_poly);

            //layerControl.addOverlay(results_poly, "Current Selection");

            refreshSelectedFeaturesTab();
            //createDynamicDataTable()

            //Populate the list of selected features in the bottom left hand corner.
            if (reporting_units != "onekm"){
                $('.info2').html("<b><span style='color:#5083B0'>Currently Selected: "+response['categoricalValues']+"</span>")
            }
            else {
                $('.info2').html("")
            }

            //column chart colors.
            columnChartColorsCSV=response['columnChartColors'];

            //create the charts.
            if (showChartOnMapSelect=="PointChart"){
                //if this is the first time we're creating a chart.
                if (typeof chart=='undefined') {
                    animateClickToMapInfoBox()
                    createChart(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
                }
                else {
                    updateData(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value);
                }
            }
            else if(showChartOnMapSelect=="BoxPlot"){
                createBoxPlot(document.getElementById("variable_selection_form").value,document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
            }
            else {
               createChart('tmax', 'avg', 's0')
            }
            createColumnChart();


            if (typeof first_query_complete == 'undefined' &&  typeof introJs == 'function') {

                addEventHandlerForModelChange();

                var cookie=getCookie("climateConsole");

                if (cookie==null || cookie=="") {
                   setCookie("climateConsole", "1",90);
                   //gettingStartedIntro.goToStepNumber(4).start()
                }

                $( ".select_form2" ).change(function() {
                      gettingStartedIntro.exit()
                });
            }

            first_query_complete = true;

            //Selected Features Header on View1

            $('.selectedFeaturesFullList').empty();
            $(".closeSelectedFeaturesFullList").hide();

            if (activeReportingUnitsName.indexOf('User Defined') >= 0){
                $(".selectedFeaturesShortList").show();
                $(".selectedFeaturesShortList").html(": User Defined Area");
                $(".additionalFeaturesCount").empty();
                $('.selectedFeaturesFullList').hide();
            }
            else if (featureCount==1) {
                $(".selectedFeaturesShortList").show();
                $(".selectedFeaturesShortList").html(response['categoricalValues']);
                $(".additionalFeaturesCount").empty();
                $('.selectedFeaturesFullList').hide();
            }
            else {
                additionalFeatures=featureCount-1;
                $(".selectedFeaturesShortList").html(response['categoricalValues'][0]);
                $(".additionalFeaturesCount").html("+ <a title='Click to view the full list of selected features'>" + additionalFeatures + " More</a>");
                $(".additionalFeaturesCount").show();

                $('.selectedFeaturesFullList').append('<br><div id="selectedFeaturesFullListTableContainer"></div>');

                $('.selectedFeaturesFullListTableContainer').append('<table class="selectedFeaturesFullListTable" id="selectedFeaturesTable"></table>');
                var selectedFeaturesTable=$('.selectedFeaturesFullListTableContainer').children();

                var count = 1;
                listOfSelectedFeatures = "";
                categoricalValuesArray = response['categoricalValues'];

                for (var i = 0, tot = categoricalValuesArray.length; i < tot; i++) {

                    listOfSelectedFeatures = listOfSelectedFeatures + "<div class='selectedFeaturesText' onmouseout='mouseOutTextChangeBack()' onmouseover='mouseOverTextChangeColor(\"" + categoricalValuesArray[i] + "\")' id='" + categoricalValuesArray[i] + "' >" + count + ". " + categoricalValuesArray[i] + "<span class='inner'></span></div>";

                    count = count + 1
                }
                selectedFeaturesTable.append("<tr><td>" + listOfSelectedFeatures + "</td></tr>")
            }

            /* Multi LCC Dashboard specific functions */
            if(document.getElementById("dynamicDataTable") !== null) {
                var infoFile = encodeURI(static_url + "config/html/mlcc/" + response['categoricalValues'] + ".html");
                $.get(infoFile).done(function () {
                    $('#AboutSelectedProtectedArea').load(infoFile, function () {
                    });
                }).fail(function () {
                    $('#AboutSelectedProtectedArea').html("No additional information is available for this protected area.")
                });
            }

            if (typeof response.tabularResultsJSON != 'undefined' && response.tabularResultsJSON != '')  {

                tabularResultsJSON = JSON.parse(response.tabularResultsJSON);
                if (typeof time_period_for_table == 'undefined') {
                    time_period_for_table = 1
                }
                if (typeof units_for_table == 'undefined') {
                    units_for_table = "english"
                }
                createDynamicDataTable(time_period_for_table,units_for_table)

            }

            if (typeof areaChart != 'undefined' && areaChart != false && vtypeTablesList.length > 0 && response['categoricalValues'].length == 1) {

                $(".no_climate_impacts_data").hide();

                // For dashboard, the call to createAreaChart happens in dashboard.js
                createAreaChart(document.getElementById("ecoServSelectionForm").value);

                if (typeof createSplineChart == "function") {
                    createSplineChart(document.getElementById("ecoServSelectionForm").value);
                }
            }
            else  {
                $(".no_climate_impacts_data").show()
            }


        },

        // handle a non-successful response
        error : function(xhr,errmsg,err) {
            alertify.alert('No features selected. Please make a new selection.')
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        },
        complete: function (jqXHR, status){
            endLoading();
        }

    });
}

function extract_raster_values(last_poly) {

    var macrogroup_code = $("#macrogroup_dropdown").val();
    var macrogroup_name = $("#macrogroup_dropdown").find('option:selected').text();

    $.ajax({
        url: "/extract_raster_values", // the endpoint (for a specific view configured in urls.conf /view_name/)
        //Webfactional
        //url : "/climate", // the endpoint
        type: "POST", // http method
        //data sent to django view with the post request
        //data : { the_post : $('#post-text').val() },
        data: {
            last_poly: last_poly,
            macrogroup_code: macrogroup_code,
            macrogroup_name: macrogroup_name,
        },
          success: function (response) {

               response_json = JSON.parse(response);
               results_json = response_json["selected_reporting_unit_results"];

               // <Data>, <table_id>, <chart subtitle>, <show in legend>
               create_charts(results_json["Climate"],"climate_table", false, true);
           },
           // handle a non-successful response
            error : function(xhr,errmsg,err) {
                alert('There was an error processing your request. Please try again');
                console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
           },
           complete: function (jqXHR, status){
                endLoadingDeparture();
           }

    })
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
     // Hack for  map.on('click',onClick) is also fired when zoombox #1884
     if (e.containerPoint.equals(mousedownPoint)) {
         user_wkt = "POINT(" + e.latlng.lng + " " + e.latlng.lat + ")";
         create_post(user_wkt)
     }
}

function highlightFeature(e) {
    $(".info2").show();
    var layer = e.target;
    layer.setStyle(hoverStyle);

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info2.update(layer.feature.properties);
}

function resetHighlight(e) {
    $(".info2").hide();
    var layer= e.target;
    layer.setStyle(defaultStyle);

    if (initialize==0 && reporting_units != "onekm" && typeof response != 'undefined') {
        $(".info2").show();
        $('.info2').html("<b><span style='color:#5083B0'>Currently Selected: "+response['categoricalValues']+"</span>")
    }
    else {
        info2.update('');
    }
    if (typeof results_poly != 'undefined' && map.hasLayer(results_poly)) {
        results_poly.bringToFront()
    }
}

function mouseOverTextChangeColor(hovername) {
    text_hover_layer=activeReportingUnits
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
// Takes user drawn shape and converts it to WKT format. This ships to the PostGIS database where it is used in the SBL.
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

    $(document).ajaxComplete(function(){
        endLoading();
        //Remove user-drawn shape after a successful post.
        if (map.hasLayer(layer)){
            map.removeLayer(layer)
        }
    });

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

    if (typeof base_data_PNG_overlay_url != 'undefined' && base_data_PNG_overlay_url != '') {
        base_data_PNG_overlay.setOpacity(fillOpacityLevel);
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
    position:'topleft'
}).addTo(map);

/*
var control = L.control.zoomBox({
    modal: false,  // If false (default), it deactivates after each use.
    // If true, zoomBox control stays active until you click on the control to deactivate.
    position: "topleft",
    // className: "customClass"  // Class to use to provide icon instead of Font Awesome
});

map.addControl(control);
*/

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
var info2 = L.control({position:'topleft'});

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

var geoSearch = L.control.geonames({
    username: 'cbi.test',  // Geonames account username.  Must be provided
    zoomLevel: 7,  // Max zoom level to zoom to for location.  If null, will use the map's max zoom level.
    maxresults: 10,  // Maximum number of results to display per search
    //className: 'fa fa-crosshairs',  // class for icon
    workingClass: 'fa-spin',  // class for search underway
    featureClasses: ['A', 'H', 'L', 'P', 'R', 'T', 'U', 'V'],  // feature classes to search against.  See: http://www.geonames.org/export/codes.html
    baseQuery: 'isNameRequired=true&country=US',  // The core query sent to GeoNames, later combined with other parameters above
    position: 'topleft',
});

map.addControl(geoSearch);


/********************************* END MAP CONTROLS -- Right Hand Side **********************************************/

/**************************************  Near-Term Forecast *********************************************************/


function activateMapForDefault(){

    // On return from other tabs, when the active reporting units is a PNG (e.g., watersheds), add the study area boundary
    if (typeof reporting_unit_overlay != "undefined" && reporting_unit_overlay == activeReportingUnitsName) {
        study_area_boundary.addTo(map)
    }

    // Else set the style back to the default (changes on Condition & Impacts tab)
    else{
        activeReportingUnits.eachLayer(function (layer) {
            layer.setStyle({
                color: '#737373',
                weight: 1,
                dashArray: 0,
                fillOpacity: 0,
                opacity: 1
            })
        });

    }

    defaultStyle = {
        color: '#737373',
        weight:2,
        dashArray: 0,
        fillOpacity:0,
        opacity:1
    };

    $("div.leaflet-top:nth-child(1)") .fadeTo(500, 1);
    $('div.leaflet-top:nth-child(1)').unbind('mouseover mouseout');
    $('div.leaflet-top:nth-child(1)').unbind('click');

    $(document).ajaxStart(function(){
        //show spinner
        //startLoading();
    });


    if  (typeof marker != 'undefined') {
        map.removeLayer(marker);
        map.removeLayer(markerInfo);
    }

    if (climate_PNG_overlay_url != ''){

        climate_PNG_overlay.addTo(map);
        climate_PNG_overlay.bringToBack();
        $('.ui-opacity').show();

    } else {

        $('.ui-opacity').hide();
    }

    showPrimaryControlsRecallPreviousSelection();

    $('.leaflet-draw').show();

    //map.addLayer(results_poly)
    //document.getElementsByClassName('info')[0].innerHTML='';
    map.removeLayer(climate_PNG_overlay);
    $(".info").hide();

}


function showPrimaryControlsRecallPreviousSelection() {

    $('.leaflet-control-layers').show();
    $('.toolTitle2').show();
    $('.leaflet-geonames-search').show();
    $('.toolTitle').html('<span class="introjs-helperNumberLayer">1</span>Select Reporting Units');

    map.removeLayer(near_term_climate_divisions);
    //This was preventing mouseover on features in chrome b/c the boundary was going on top.
    //map.addLayer(study_area_boundary)
    if (typeof activeReportingUnits == 'undefined') {
        map.addLayer(layer0)
    }
    else {
        map.addLayer(activeReportingUnits)
    }
    if (typeof results_poly != 'undefined' && results_poly != '') {
        map.addLayer(results_poly)
    }
}

// AJAX for posting
function create_post_downscale(lon,lat) {
    var newWKT="POINT(" + lon + " " +  lat + ")";
    initialize = 0;
    $.ajax({
        url: "downscale", // the endpoint (for a specific view configured in urls.conf /view_name/)
        //Webfactional
        //url : "/climate", // the endpoint
        type: "POST", // http method
        data: {input: newWKT},

        success: function (results) {
            response2=JSON.parse(results);
            dates=response2['dates'];
            tmax_data=response2['tmax_data'];
            precip_data=response2['precip_data'];
            createTimeSeries(dates,tmax_data,precip_data)
        }
    })
}

var near_term_climate_divisions= L.geoJson(null, {

    onEachFeature:passClimateDivisionID,

});

var near_term_climate_divisions_layer= omnivore.topojson(static_url+'Leaflet/myJSON/Climate_Divisions_USA.json', null, near_term_climate_divisions);


function passClimateDivisionID(feature, layer) {
    layer.on({
        //Added trigger to get the downscaled data.
        click: function (e) { generateNearTermClimateResults(selectedNearTermClimatePeriod, feature.properties.NAME); selectClimateDivision(e);
            if (enableDownscale) {
                create_post_downscale(e.latlng.lng,e.latlng.lat); onMapClick(e);
            }
        },
        mouseover: highlightClimateDivision,
        mouseout: resetClimateDivision
    });
}

function highlightClimateDivision(e) {
    var layer = e.target;
    climateDivisionHover = layer.feature.properties.NAME;
    document.getElementsByClassName('info2')[0].innerHTML='<span style="font-weight:bold; color: #5083B0;">Click to select Climate Division ' + climateDivisionHover+ '</span>'
}

function resetClimateDivision(e) {
    document.getElementsByClassName('info2')[0].innerHTML='<span style="font-weight:bold; color: #5083B0;">Currently Selected: Climate Division ' + selectedClimateDivision + '</span>'
}

function selectClimateDivision(e) {

    //set all polygon border back to the default.
    near_term_climate_divisions.setStyle({color:'#444444', weight:2});

    clickedPolygon = e.target;
    document.getElementsByClassName('info2')[0].innerHTML='<span style="font-weight:bold; color: #5083B0;">Currently Selected: Climate Division ' + selectedClimateDivision + '</span>'
    selectedClimateDivision=clickedPolygon.feature.properties.NAME

    clickedPolygon.setStyle({color :'#00FFFF', weight:5})

    if (!L.Browser.ie && !L.Browser.opera) {
        clickedPolygon.bringToFront();
    }
}

function activateMapForClimateForecast(){
    $(".info").show();
    // Get climate_division_polygon that contains the results_poly_centroid
    var layer = leafletPip.pointInLayer(results_poly_centroid, near_term_climate_divisions_layer, true);

    // Get the name of that climate division to select later on.
    if (layer.length) {
        selectedClimateDivision = layer[0].feature.properties.NAME;
    }

    $(document).ajaxStart(function(){
        //hide spinner on the weather-forecast tab
        endLoading();
    });

    $('#clickToMapInfo').hide();

    if (typeof defaultLatLng == 'undefined') {
        defaultLatLng = L.latLng([initialDownscaleMarkerLat, initialDownscaleMarkerLon])
    }

    if (typeof geo_marker != 'undefined'){
       map.removeLayer(geo_marker)
    }

    if (enableDownscale) {

        marker = new L.marker(defaultLatLng)
            .bindPopup("<div id='initialMarkerMessage' style='font-family: Lucida Grande,Lucida Sans Unicode,Arial,Helvetica,sans-serif'>Downscaled 3 Month Forecast at Marker Location <br>(" + defaultLatLng + ")</div><div id='time_series_popup'></div>")
            .addTo(map)

        marker.on("popupopen", onPopupOpen);

        map.on('click', function (e) {
            map.removeLayer(marker);
            var marker = new L.marker(e.latlng).addTo(map);
        });
    }

    if ( typeof fillOpacityLevel == 'undefined') {
        fillOpacityLevel=.85
    }

    $('.leaflet-control-layers').hide();
    $('.leaflet-draw').hide();
    $('.toolTitle2').hide();
    $('.leaflet-geonames-search').hide();
    $('.toolTitle').html('<span class="introjs-helperNumberLayer">1</span><span style="font-size:.9em">Select a Climate Division</span>');
    $('.leaflet-bottom').show();
    $('.ui-opacity').show();
    $('.leaflet-control-layers:nth-child(1)').show();

    //Currently this function is also called on document read in the general_js script.
    //Noaa chart becomes unsynced without calling twice.
    generateNearTermClimateResults(selectedNearTermClimatePeriod,selectedClimateDivision)

    //Loop through the array of all layers and remove them
    allLayers.forEach( function (arrayItem) {
        map.removeLayer(arrayItem)
    });

    //Also remove any climate overlays and the results_poly
    map.removeLayer(climate_PNG_overlay);
    map.removeLayer(results_poly);
    // Remove any image overlay reporting units
    if (typeof reporting_unit_overlay != "undefined") {
        map.removeLayer(reportingUnitLayers[reporting_unit_overlay]);
    }

    near_term_climate_divisions.addTo(map);
    near_term_climate_divisions.bringToFront();

    updateNearTermForecastLegend();
    updateClimateDivisionSymbology();

    document.getElementsByClassName('info2')[0].innerHTML='<span style="font-weight:bold; color: #5083B0;">Currently Selected: Climate Division ' + selectedClimateDivision + '</span>'

    if (typeof marker != 'undefined') {
        markerInfo = L.popup()
            .setLatLng([defaultLatLng.lat + 1, defaultLatLng.lng])
            .setContent("<div style='font-family: Lucida Grande,Lucida Sans Unicode,Arial,Helvetica,sans-serif'><span style='left:-20px;font-style:italic' class='introjs-helperNumberLayer'>i</span>The charts on the right show the three month weather forecast for the climate division outlined in blue (climate division #" + selectedClimateDivision + "). Click on the blue marker below to view the downscaled three month forecast at the marker location. <p> Click anywhere in the map to select a new climate division and marker location. Downscaled data is only available for the Western United States.</div>")
            .addTo(map);
    }
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
       //color_0='#4575B5'
       color_0='#BEB0FF'
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
       // color_0='#A56629'
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


function updateClimateDivisionSymbology(){

    selectedNearTermVariableToMap = $('input[name=nearTermMapVariable]:checked').val();

    map.removeLayer(near_term_climate_divisions)

    near_term_climate_divisions= L.geoJson(null, {
        style: function(feature) {

            if (feature.properties.NAME == selectedClimateDivision){
                if (selectedNearTermVariableToMap == 'temp'){
                    return { fillColor: getNearTermColor(allTempDeltaDict[feature.properties.NAME][selectedNearTermClimatePeriod-1]), weight:5, color: '#00FFFF',  dashArray: 0, fillOpacity:fillOpacityLevel}
                }
                else if (selectedNearTermVariableToMap == 'precip') {
                    return { fillColor: getNearTermColor(allPrecipDeltaDict[feature.properties.NAME][selectedNearTermClimatePeriod-1]), weight:5, color: '#00FFFF',  dashArray: 0, fillOpacity:fillOpacityLevel}
                }
            } else{
                if (selectedNearTermVariableToMap == 'temp'){
                    return { fillColor: getNearTermColor(allTempDeltaDict[feature.properties.NAME][selectedNearTermClimatePeriod-1]), weight:2, color: '#444444', dashArray: 0, fillOpacity:fillOpacityLevel}
                }
                else if (selectedNearTermVariableToMap == 'precip') {
                    return { fillColor: getNearTermColor(allPrecipDeltaDict[feature.properties.NAME][selectedNearTermClimatePeriod-1]), weight:2, color: '#444444', dashArray: 0, fillOpacity:fillOpacityLevel}
                }
            }
        },
        onEachFeature:passClimateDivisionID,

    });


    near_term_climate_divisions_layer= omnivore.topojson(static_url+'Leaflet/myJSON/Climate_Divisions_USA.json', null, near_term_climate_divisions)
    map.addLayer(near_term_climate_divisions)

}

function getNearTermColor(d) {

    return d > 1  ? color_6 :
        d > 0.75  ? color_5 :
        d > 0.5   ? color_4 :
        d > 0.25  ? color_3 :
        d > 0     ? color_2 :
        d == 0    ? color_1 :
                    color_0;
}

// Script for adding marker on map click
function onMapClick(e) {

    map.removeLayer(markerInfo)

    //This maintains the last position of the marker if the user goes back to the charts view and then returns to the weather forecast view.
    defaultLatLng=e.latlng

    if  (typeof marker != 'undefined') {
        map.removeLayer(marker);
    }

    var geojsonFeature = {
        "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [e.latlng.lat, e.latlng.lng]
        }
    }

    if (e.latlng.lng <= -103){

        L.geoJson(geojsonFeature, {
            pointToLayer: function(feature, latlng){

                marker = L.marker(e.latlng, {

                    title: "Click to view 4km downscaled data at this location",
                    alt: "Click to view 4km downscaled data at this location",
                    riseOnHover: true,
                    draggable: true,

               // }).bindPopup("<input type='button' value='Delete this marker' class='marker-delete-button'/><div id='time_series'></div>");
                }).bindPopup("<div style='font-family: Lucida Grande,Lucida Sans Unicode,Arial,Helvetica,sans-serif'>Downscaled 3 Month Forecast at Marker Location <br>(" + e.latlng + ")</div><div id='time_series_popup'></div>");

                marker.on("popupopen", onPopupOpen);

                return marker;
            }
        }).addTo(map);
    }
}
// Function to handle delete as well as other events on marker popup open
function onPopupOpen() {

    map.removeLayer(markerInfo)

    createTimeSeries(dates,tmax_data,precip_data)

    tempMarker = this;

    //var tempMarkerGeoJSON = this.toGeoJSON();
    //var lID = tempMarker._leaflet_id; // Getting Leaflet ID of this marker
    // To remove marker on click of delete
    $(".marker-delete-button:visible").click(function () {
        map.removeLayer(tempMarker);
    });
}

// getting all the markers at once
function getAllMarkers() {

    var allMarkersObjArray = [];//new Array();
    var allMarkersGeoJsonArray = [];//new Array();

    $.each(map._layers, function (ml) {
        //console.log(map._layers)
        if (map._layers[ml].feature) {

            allMarkersObjArray.push(this)
                                    allMarkersGeoJsonArray.push(JSON.stringify(this.toGeoJSON()))
        }
    })

    console.log(allMarkersObjArray);
    alert("total Markers : " + allMarkersGeoJsonArray.length + "\n\n" + allMarkersGeoJsonArray + "\n\n Also see your console for object view of this array" );
}

$(".get-markers").on("click", getAllMarkers);


//************************************ End Near-Term Forecast ********************************************************//

//**************************************** Ecosystem Services ********************************************************//

function activateMapForEcosystemServices(){

    swapImageOverlay("single_transparent_pixel");

    map.removeLayer(near_term_climate_divisions);
    document.getElementsByClassName('info legend leaflet-control')[0].innerHTML='';

    $("div.leaflet-draw").hide();

    if (typeof pngCloverYear !=  "undefined"){
        swapImageOverlay("vtype_agg_" + actualModelName + "__" + pngCloverYear, "EcosystemServices")
    }
    else {
        swapImageOverlay("vtype_agg_" + "ccsm4" + "__" + "58804", "EcosystemServices")
    }

    showPrimaryControlsRecallPreviousSelection();

    $(document).ajaxStart(function(){
        //show spinner
        startLoading();
    });

}

//*********************************** Append a help icon for WMS services  ********************************************//

$.each($("#leaflet-control-layers-group-2").find("label"), function(index,value){

    var wmsLayerName = $(this).text().trim();
    if (typeof wmsLayers !=  "undefined" && wmsLayers[wmsLayerName][5] != "undefined"){
            $(this).append(" <img class='reference_layer_help_icon' title='" + wmsLayers[wmsLayerName][5] + "' src='" + static_url + "img/help2.png'>")
        }

});


//************************************ Climate Distribution Charts ****************************************************//


function create_charts(results_json_group, table_name, sub_title, show_in_legend, legend_position = "top") {

    all_departure_hadgem2_es = [];
    all_departure_canesm2 = [];

    // results_json_group = results_json["CNS"] or results_json["Climate"]

    $("#"+ table_name).empty();
    $("#"+ table_name).append("<tr></tr>");

    // Create the table to hold the charts
    $.each(results_json_group, function (key, object) {
        $("#" + table_name + " tr").append("<td class='chart_table' id='" + key + "'></td>");

    });

    $.each(results_json_group, function (key, object) {

        var chart_title = object[0]["title"];
        var chart_type = object[0]["chart_type"];
        var data_type = object[0]["data_type"];
        var bins;
        if (typeof object[0]["bins"] != "undefined") {
            bins = object[0]["bins"];
        }
        else{
            bins = ''
        }
        var color_by_point;
        var labels;
        if (typeof object[0]["labels"] != "undefined") {
            labels = object[0]["labels"];
            color_by_point = true;
        }
        else{
            labels = ''
            color_by_point = false;
        }
        // Create the chart
        create_histogram(key, chart_title, sub_title, data_type, labels, chart_type);

        var chart = $("#" + key).highcharts();

        count = 1;

        // Calculate Climate Departure
        var historical_mean = object[0]["stats"]["mean"];
        var hadgem2_es_mean = object[1]["stats"]["mean"];
        var canesm2_mean = object[2]["stats"]["mean"];

        var historical_sd = object[0]["stats"]["sd"];

        var departure_hadgem2_es = ((hadgem2_es_mean - historical_mean) / historical_sd);
        var departure_canesm2 = ((canesm2_mean - historical_mean) / historical_sd);

        var departure_hadgem2_es_text = classify_departure(departure_hadgem2_es);
        var departure_canesm2_text = classify_departure(departure_canesm2);

        all_departure_hadgem2_es.push(departure_hadgem2_es);
        all_departure_canesm2.push(departure_canesm2);

        function classify_departure(departure) {

            departure_abs = Math.abs(departure);
            departure_text  = "";

            if (departure_abs <= .5) {  departure_text = "Very Low" }
            else if (departure_abs <= 1.5) { departure_text = "Low"}
            else if (departure_abs <= 2.5) { departure_text = "Moderate"}
            else if (departure_abs <= 3.5) { departure_text = "High"}
            else (departure_text = "Very High") ;

            return departure_text;

        }

        var subtitle = "<div class='histogram_subtitle'><span id='hadgem2_departure_label'><img class='climate_exposure_icon' src='" + static_url + "img/hadgem2_es_departure_icon.png'></span> Bioclimatic Departure is <b>" + departure_hadgem2_es_text + "</b> (Z="  + departure_hadgem2_es.toFixed(1)  + ")" + "<br><span id='canesm2_departure_label' ><img class='climate_exposure_icon' src='" + static_url + "img/canesm2_departure_icon.png'></span> Bioclimatic Departure is <b>" + departure_canesm2_text + " </b>(Z=" + departure_canesm2.toFixed(1) + ")</div>";
        chart.setTitle(null, { text: subtitle});

        var layer_id;
        var legend_container_id = key + "_legend_container";
        $("#" + key).append("<div id='" + legend_container_id + "' class='legend_container'><div>");

        $.each(object, function(index, object) {

            if (typeof object["color"] != "undefined") {
                series_color = object["color"]
            }

            if (typeof object["series_opacity"] != "undefined") {
                series_opacity = object["series_opacity"]
            }

            var map_icon_id = layer_id;

            var raw_data = object["raw_data"];
            var min = object["stats"]["min"];
            var max = object["stats"]["max"];
            var mean = object["stats"]["mean"];

            if (typeof object["binned_data"] != "undefined") {
                binnedData = object["binned_data"];
            }

            else{
                // The data are continuous, so bin them accordingly.
                binnedData = binData(raw_data, min, max, bins);
                cell_count = object["raw_data"].length

                // Have to handle these two differently because the binnedData array structure is different from the categorical (which uses x:, y:, color:).
                $.each(binnedData, function(index, array){
                    percent_area = parseFloat((binnedData[index][1]/cell_count * 100).toFixed(1));
                    binnedData[index][1] = percent_area;
                })
            }

            if (typeof series_color == "undefined"){
                series_color = Highcharts.getOptions().colors[count]
            }

            if (typeof series_opacity == "undefined"){
                series_opacity = .3
            }

            var max_legend_char = 47;
            var char_count = object["series"].length
            var truncated_series_name = object["series"].substring(0, max_legend_char);

            if (char_count > max_legend_char) {
                truncated_series_name += "..."
            }

            chart.addSeries({
                name: truncated_series_name,
                type: chart_type,
                connectNulls: true,
                min:0,
                lineWidth:2,
                colorByPoint:color_by_point,
                data: binnedData,
                fillOpacity:series_opacity,
                borderColor: '#666666',
                color: series_color ,
                marker: {
                    enabled: false
                },
                showInLegend: show_in_legend,
            });

            count += 1;

            // Set the starting tic for the xAxis equal to the minimum data value (preventing -1's in the Resilience class chart).
            var min_val = chart.xAxis[0].getExtremes().dataMin;
            chart.xAxis[0].update({min:min_val});

            /*
            if (typeof xAxis_categories != "undefined") {
                chart.xAxis[0].setCategories(xAxis_categories);
            }
            */

            if (sub_title) {
                // Only really works if there is 1 series per chart.
                var subtitle = "<div id='histogram_subtitle'>Mean:" + mean + "<br>Min:" + min + "<br>Max:" + max + "</div>";
                chart.setTitle(null, { text: subtitle});
            }

        });
    });

    //var mean_departure_hadgem2_es = calc_mean(all_departure_hadgem2_es);
    //var mean_departure_canesm2 = calc_mean(all_departure_canesm2);

    var combined_all_departure = all_departure_canesm2.concat(all_departure_hadgem2_es);
    var mean_departure_combined = calc_mean(combined_all_departure);

    function calc_mean(all_departure_values) {
        var sum = 0;
        for (var i = 0; i < all_departure_values.length; i++) {
            sum += Math.abs(all_departure_values[i]); //don't forget to add the base
        }
        var avg = sum/all_departure_values.length;
        return avg
    }

    $("#mean_departure_table td:nth-child(2)").hide();

    show_mean_departure(mean_departure_combined);

    function show_mean_departure(departure) {

            if (departure <= .5) { $("#very_low_departure").show()}
            else if (departure <= 1.5) {$("#low_departure").show() }
            else if (departure <= 2.5) { $("#moderate_departure").show()}
            else if (departure <= 3.5) { $("#high_departure").show()}
            else (departure_text = $("#very_high_departure").show()) ;

            return departure_text;
    }

}

function binData(data,min,max,bins) {

    var hData = new Array(), //the output array
        size = data.length //how many data points
    if (bins == '') {
        bins = 20; //determine how many bins we need
        //bins = Math.round(Math.sqrt(size)); //determine how many bins we need
        bins = bins > 50 ? 50 : bins; //adjust if more than 50 cells
    }
    //var //max = Math.max.apply(null, data), //lowest data value
    //min = Math.min.apply(null, data), //highest data value
    var range = max - min, //total range of the data
        width = range / bins, //size of the bins
        bin_bottom, //place holders for the bounds of each bin
        bin_top;

    //loop through the number of cells
    for (var i = 0; i < bins; i++) {

        //set the upper and lower limits of the current cell
        bin_bottom = min + (i * width);
        bin_top = bin_bottom + width;

        //check for and set the x value of the bin
        if (!hData[i]) {
            hData[i] = new Array();
            hData[i][0] = bin_bottom + (width / 2);
        }

        //loop through the data to see if it fits in this bin
        for (var j = 0; j < size; j++) {
            var x = data[j];

            //adjust if it's the first pass
            i == 0 && j == 0 ? bin_bottom -= 1 : bin_bottom = bin_bottom;

            //if it fits in the bin, add it
            if (x > bin_bottom && x <= bin_top) {
                !hData[i][1] ? hData[i][1] = 1 : hData[i][1]++;
            }
        }
    }
    $.each(hData, function (i, point) {
        if (typeof point[1] == 'undefined') {
            hData[i][1] = null;
        }
    });
    return hData;

}

function startLoading(){
    $(".loading").css("display", "block");
    $(".loading_contents").css("opacity", .5);
}

function endLoading(){
    $(".loading:not(#loading_departure)").css("display", "none");
    $(".loading_contents:not(#loading_contents_departure)").css("opacity", 1);
}

function startLoadingDeparture(){
    $("#loading_departure").css("display", "block");
    $("#loading_contents_departure").css("opacity", .5);
}

function endLoadingDeparture(){
    $("#loading_departure").css("display", "none");
    $("#loading_contents_departure").css("opacity", 1);
}


// Nudge the currently selected div over when the reporting units selection control is open.
$(".leaflet-control-layers").hover(function() {
    $(".info2").css("left", "167px");
}, function() {
        $(".info2").css("left", "45");
    }
);

