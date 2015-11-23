title="California"
subTitle="Climate Projections for the State of California"
studyAreaBoundary="CA_Boundary_5_simplify.json"
initialLat=37.2
initialLon=-121.5
initialDownscaleMarkerLat=35.28
initialDownscaleMarkerLon=-116.54
zoomLevel=7

reportingUnits={
     // "Reporting Units Label":["database_table_name","name_field","json_file"]
    "Counties": ["ca_reporting_units_county_boundaries_5_simplify","name","ca_reporting_units_county_boundaries_5_simplify.json"],
    "Jepson Ecoregions":["ca_jepson_ecoregions_2_simplify","name","CA_Reporting_Units_Jepson_Ecoregions_2_simplify.json"],
    "BLM Field Offices":["ca_reporting_units_blm_field_offices_7_simplify", "name", "CA_Reporting_Units_BLM_Field_Offices_7_simplify.json"],
    "HUC5 Watersheds": ["ca_reporting_units_huc5_watersheds_5_simplify", "name", "CA_Reporting_Units_HUC5_Watersheds_5_simplify.json"],
    "National Forests": ["ca_reporting_units_usfs_national_forests_15_simplify","name","CA_Reporting_Units_USFS_National_Forests_15_simplify.json"],
    //"National Forests": ["ca_reporting_units_usfs_national_forests_15_simplify","Name","Multi_LCC_USFS_5_Simplify.json"],
    "User Defined (1km)": ["drecp_reporting_units_1km_poly_v2","",""],

}

climateParams = {
    timePeriods:2,
    timePeriodLabels:['Historical <br>(1971-2000)', '2016-2045', '2046-2075'],
    models:{
        // "MODEL Name(No underscores)": ["field_code_abbreviation", "point_chart_color"]
        "PRISM":["pm","black"],
        "ACCESS":["a0", "#FF00FF"],
        "CanESM2":["c2","#DEB78B"],
        "CCSM4":["c4","#717573"],
        "CESM1":["cc","#808000"],
        "CMCC":["cm","#1EED1E"],
        "CNRM":["c5","#800040"],
        "GFDL":["g3","#1B6186"],
        "HadGEM2CC":["hc","#FF8A09"],
        "HadGEM2ES":["hs","#8080C0"],
        "MIROC5":["m5","#C6D2DF"],
        "Ensemble":["ee","red"]},
    labels:{
        "tmax":["Degrees (°C)","°C"],
        "tmad":["Degrees (°C)","°C"],
        "tmaa":["Degrees (°C)","°C"],
        "tmin":["Degrees (°C)","°C"],
        "tmid":["Degrees (°C)","°C"],
        "tmia":["Degrees (°C)","°C"],
        "prec":["mm/year","mm/year"],
        "ppt":["mm/year","mm/year"],
        "pet":["mm/year","mm/year"],
        "arid":["Percent Change","%"],
        "pred":["Percent Change","%"]
    },
    legendHeight:"",
    legendLabels:["","","","","",""],
    imageOverlayDIR:"TrimmedPNG",
    overlayBounds:[[32.52777441016329, -124.41250000002108], [42.02083587646484, -114.1214454281304]],
    boxPlot:false
}

EEMSParams={
    models: {
        // "Field Code" ["Legend Label", "Legend File Name (without png), "Legend Labels", "Data Basin ID", "Description for Popup"]
        "intactness": ["Terrestrial Intactness", "Terrestrial Intactness", "Intactness", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "958719f2359e40b99ca683d1a473ba8d", "Terrestrial intactness is an estimate of current condition based on the extent to which human impacts such as agriculture, urban development, natural resource extraction, and invasive species have disrupted the landscape across the DRECP study area. Terrestrial intactness values will be high in areas where these impacts are low. <p>The value shown in the column chart represents the average terrestrial intactness value within the selected area. Terrestrial intactness values are calculated using an <a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> fuzzy logic model that integrates multiple measures of landscape development and vegetation intactness (See EEMS model diagram below). <p>  This model integrates agriculture development (from LANDFIRE EVT v1.1), urban development (from LANDFIRE EVT v1.1 and NLCD Impervious Surfaces), linear development (from Tiger 2012 Roads, utility lines, and pipelines), OHV recreation areas, energy and mining development (from state mine and USGS national mines datasets as well as geothermal wells, oil/gas wells, wind turbines, and power plant footprints), vegetation departure (from LANDFIRE VDEP), invasive vegetation (multiple sources combined for invasives analyses), and measures of natural vegetation fragmentation calculated using FRAGSTATS. In this version, Maxent modeled Sahara Mustard was included in the Invasive's branch as well as in the Fragstats model run. <div class='modelDiagram' style='height:70%'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide1.PNG'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide2.PNG'><div class='bottom_spacing'><p></div></div>"],
        "hisensfz": ["Site Sensitivity","Site Sensitivity","EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "958719f2359e40b99ca683d1a473ba8d", "<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p> The Site Sensitivity Model evaluates the study area for factors that make the landscape sensitive to climate change. These factors fall into two main branches of the model: soil sensitivity and water retention potential. As a final step in the model, we defined barren areas as having the lowest possible sensitivity since many of these areas will not be further degraded by climate change.<p>The value shown in the column chart represents the average sensitivity value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/SiteSensitivity.png'><div class='bottom_spacing'><p></div></div>"],
        "eecefzt1": ["Climate Exposure<br>2016-2045<br>(Ensemble)","Climate Exposure t1","EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "958719f2359e40b99ca683d1a473ba8d", "<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2016-2045) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past. <p>The value shown in the column chart represents the average climate exposure value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "eecefzt2": ["Climate Exposure<br>2046-2075<br>(Ensemble)","Climate Exposure t2", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "958719f2359e40b99ca683d1a473ba8d", "<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2046-2075) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past.<p>The value shown in the column chart represents the average climate exposure value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "eepifzt1": ["Potential Impact<br>2016-2045<br>(Ensemble)","Potential Impact t1", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "958719f2359e40b99ca683d1a473ba8d", "<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2016-2045) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p><p>The value shown in the column chart represents the average potential climate impact value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "eepifzt2": ["Potential Impact<br>2046-2075<br>(Ensemble)","Potential Impact t2", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "958719f2359e40b99ca683d1a473ba8d", "<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2046-2075) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p>The value shown in the column chart represents the average potential climate impact value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div class='bottom_spacing'><p></div>"],
    },
    "overlayBounds":"",
};



