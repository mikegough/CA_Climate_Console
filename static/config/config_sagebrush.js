title="Sagebrush"
subTitle="Climate Projections for the Western United States"
studyAreaBoundary="Sagebrush_Study_Area_Boundary.json"
initialLat=40
initialLon=-113
initialDownscaleMarkerLat=40
initialDownscaleMarkerLon=-111
selectedClimateDivision='49'
zoomLevel=5
areaChart=false

reportingUnits={
     // "Reporting Units Label":["database_table_name","name_field","json_file"]
    "Counties": ["sagebrush_reporting_units_county_boundaries_2_simplify","name","Sagebrush_Reporting_Units_Counties_2_Simplify.json"],
    "Ecoregions":["sagebrush_reporting_units_epa_liii_ecoregions_1_simplify","us_l3name","Sagebrush_Reporting_Units_EPA_LIII_Ecoregions_1_simplify.json"],
    //"HUC5 Watersheds": ["sagebrush_reporting_units_huc5_watersheds_no_simplify", "name", "Sagebrush_Reporting_Units_HUC5_Watersheds_.2_Simplify.json"],
    /*
     "BLM Field Offices":["ca_reporting_units_blm_field_offices_7_simplify", "name", "CA_Reporting_Units_BLM_Field_Offices_7_simplify.json"],
    "National Forests": ["ca_reporting_units_usfs_national_forests_15_simplify","name","CA_Reporting_Units_USFS_National_Forests_15_simplify.json"],
    "User Defined (1km)": ["ca_reporting_units_1km_poly_join_eems","",""],
    */
}

// Optional image overlay for reporting units where the JSON file would be too large for display in Leaflet.
reportingUnitsImageOverlays={
    // "Reporting Units Label":["database_table_name","name_field","PNG file", PNG bounding coordinates]
    "HUC5 Watersheds" : ["sagebrush_reporting_units_huc5_watersheds_no_simplify", "name", "Leaflet/myPNG/reporting_units/sagebrush_huc5_watersheds.png",  [[28.9114643715872, -124.81250000044], [49.2118646821555, -101.342451577466]]]
}

wmsLayers={
        // "Layer Title":["wms service url", "legend name", "wms layer name", "on or off on page load", "source"]
        "USGS NLCD 2011" : ["http://raster.nationalmap.gov/arcgis/services/LandCover/USGS_EROS_LandCover_NLCD/MapServer/WMSServer?","usgs_nlcd.png", "33", "off", "https://www.sciencebase.gov/catalog/item/54419279e4b0b0a643c73e9b"],
        "Sagebrush Landscape Cover" : ["https://www.sciencebase.gov/catalogMaps/mapping/ows/57321b4fe4b0dae0d5dc1ec3?service=wms","sagebrush_cover.png", "Sagebrush_MW5k", "on", "https://www.sciencebase.gov/catalog/item/57321b4fe4b0dae0d5dc1ec3"],
        "Historic Greater Sage-Grouse Range" : ["https://www.sciencebase.gov/catalogMaps/mapping/ows/52e17ac3e4b0d0c3df9a3968?service=wms","science_base_generic.png", "sb:Historic_GSG_Range", "off", "https://www.sciencebase.gov/catalog/item/52e17ac3e4b0d0c3df9a3968"],
        "Great Basin Sage-Grouse Concentration Areas" : ["https://www.sciencebase.gov/catalogMaps/mapping/ows/56a7ba52e4b0b28f1184d966?service=wms","science_base_generic.png", "sb:footprint", "off", "https://www.sciencebase.gov/catalog/item/56a7ba52e4b0b28f1184d966"],
        "Resilience and Resistance" : ["https://www.sciencebase.gov/arcgis/services/Catalog/55229c34e4b027f0aee3cfa5/MapServer/WMSServer?","r_and_r.png", "0", "off", "https://www.sciencebase.gov/catalog/item/55229c34e4b027f0aee3cfa5", "This layer depicts a simplified index of relative ecosystem resilience to disturbance and resistance to cheatgrass(\"R&R\"), providing a tool for rapid risk assessment across the range of sage-grouse. Potential ecosystem R&R depends in part on the biophysical conditions an area is capable of supporting and soil temperature and moisture regimes can be used to depict this gradient at large scales. Soils data were derived from two primary sources: 1) completed and interim soil surveys available through the Soil Survey Geographic Database (SSURGO), and 2) the State Soils Geographic Database (STATSGO2) to fill gaps where SSURGO data were not available. Using best available information and expert input, each soil temperature and moisture regime/moisture subclass was placed into one of three categories of relative R&R: high, moderate, and low. Soils with high water tables, wetlands, or frequent ponding that would not typically support sagebrush were not rated."],
}

climateParams = {
    timePeriods:2,
    timePeriodLabels:['Historical <br>(1971-2000)', '2016-2045', '2046-2075'],
    models:{
        // "MODEL Name(No underscores)": ["field_code_abbreviation", "point_chart_color", "Data Basin Layer Index", "initial visibility", "point symbol size", "point symbol shape"]
        "PRISM":["pm","black","0",true],
        "CanESM2":["c2","#DEB78B","6",true],
        "CCSM4":["c4","#717573","2",true],
        "CNRM":["c5","#800040","5",true],
        "HadGEM2ES":["hs","#8080C0","9",true],
        "Ensemble":["ee","red","0",true]},
    labels:{
        "tmax":["Degrees (°C)","°C"],
        "tmad":["Degrees (°C)","°C"],
        "tmaa":["Degrees (°C)","°C"],
        "tmin":["Degrees (°C)","°C"],
        "tmid":["Degrees (°C)","°C"],
        "tmia":["Degrees (°C)","°C"],
        "prec":["mm","mm"],
        "ppt":["mm","mm"],
        "pet":["mm","mm"],
        "arid":["Percent Change","%"],
        "pred":["Percent Change","%"]
    },
    legendHeight:"",
    legendLabels:["","","","","",""],
    imageOverlayDIR:"sagebrushPNG",
    overlayBounds:[[24.059825151287345, -125.00416666645106], [49.50416665670897, -101.3421483544936]],
    boxPlot:false
}

modelInfoText='The time series climate data used to represent the historical period (1971-2000) were obtained from the LT71m PRISM 30 arc-second spatial climate dataset for the Conterminous United States (Daly et al., 2008). We selected ten of the 34 CMIP5 General Circulation Models (GCMs) that have been shown to reproduce several observed climate metrics and that captured the full range of projected change for both annual average temperature and annual precipitation under the representative concentration pathway 8.5 (RCP8.5; Meinshausen et al., 2011; van Vuuren et al., 2011). We then obtained downscaled time series climate projections for the selected GCMs from the NASA Earth Exchange (NEX) U.S. Downscaled Climate Projections (NEX US-DCP30) dataset (Thrasher et al., 2013) for the entire spatial extent of the study area and for the period 2016-2075 time. The multi-model ensemble mean of the 10 downscaled climate models was calculated for each of the climate variables.'

EEMSParams={
    defaultRenderer:'stretched',
    hasSubNodeImageOverlays:true,
    models: {
        // "Field Code" ["Legend Label", "Legend File Name (without png), "Legend Labels", "Data Basin ID", "EEMS Command File", "Top Node", "Description for Popup"]
        //"intactness": ["Terrestrial Intactness", "Terrestrial Intactness", "Intactness", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "958719f2359e40b99ca683d1a473ba8d", "CA_intactness.eem","HiTerrestIntactnessFz","Terrestrial intactness is an estimate of current condition based on the extent to which human impacts such as agriculture, urban development, natural resource extraction, and invasive species have disrupted the landscape across the DRECP study area. Terrestrial intactness values will be high in areas where these impacts are low. <p>The value shown in the column chart represents the average terrestrial intactness value within the selected area. Terrestrial intactness values are calculated using an <a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> fuzzy logic model that integrates multiple measures of landscape development and vegetation intactness (See EEMS model diagram below). <p>  This model integrates agriculture development (from LANDFIRE EVT v1.1), urban development (from LANDFIRE EVT v1.1 and NLCD Impervious Surfaces), linear development (from Tiger 2012 Roads, utility lines, and pipelines), OHV recreation areas, energy and mining development (from state mine and USGS national mines datasets as well as geothermal wells, oil/gas wells, wind turbines, and power plant footprints), vegetation departure (from LANDFIRE VDEP), invasive vegetation (multiple sources combined for invasives analyses), and measures of natural vegetation fragmentation calculated using FRAGSTATS. In this version, Maxent modeled Sahara Mustard was included in the Invasive's branch as well as in the Fragstats model run. <div class='modelDiagram' style='height:70%'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide1.PNG'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide2.PNG'><div class='bottom_spacing'><p></div></div>"],
        "hisensfz": ["Site Sensitivity","Site Sensitivity","EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "", "WU_Site_Sensitivity.eem","HighSiteSensitivityFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p> The Site Sensitivity Model evaluates the study area for factors that make the landscape sensitive to climate change. These factors fall into two main branches of the model: soil sensitivity and water retention potential. As a final step in the model, we defined barren areas as having the lowest possible sensitivity since many of these areas will not be further degraded by climate change.<p>The value shown in the column chart represents the average sensitivity value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/SiteSensitivity.png'><div class='bottom_spacing'><p></div></div>"],
        "eecefzt1": ["Climate Exposure<br>2016-2045<br>(Ensemble)","Climate Exposure (2016-2045)","EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","WUSClimateExposure_t1.eem","HighDirectClimateExposureFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2016-2045) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past. <p>The value shown in the column chart represents the average climate exposure value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>",3],
        "eecefzt2": ["Climate Exposure<br>2046-2075<br>(Ensemble)","Climate Exposure (2046-2075)", "EEMS_Climate_2","110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","WUSClimateExposure_t2.eem","HighDirectClimateExposureFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2046-2075) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past.<p>The value shown in the column chart represents the average climate exposure value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>",3],
        "eepifzt1": ["Potential Impact<br>2016-2045<br>(Ensemble)","Potential Impact (2016-2045)", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","WUSPotentialImpacts_t1.eem","HiPotImpactFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2016-2045) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p><p>The value shown in the column chart represents the average potential climate impact value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div width='100%' style='margin-left:auto;margin-right:auto;text-align:center'><i>The inputs to this model are the outputs from the Site Sensitivity & Climate Exposure (2016-2045) models</i></div><div class='bottom_spacing'><p></div>",3],
        "eepifzt2": ["Potential Impact<br>2046-2075<br>(Ensemble)","Potential Impact (2046-2075)", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","WUSPotentialImpacts_t2.eem","HiPotImpactFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2046-2075) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p>The value shown in the column chart represents the average potential climate impact value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div width='100%' style='margin-left:auto;margin-right:auto;text-align:center'><i>The inputs to this model are the outputs from the Site Sensitivity & Climate Exposure (2046-2075) models</i></div><div class='bottom_spacing'><p></div>",3],
        "theobald_i": ["Human <br>Modifications","Human Modification","theobald_human_modifications", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "", "WU_Theobald_Intactness.eem","Degree_of_Human_Modification_Fz","<div> The human modification model measures the degree of anthropogenic change present on the landscape. It is calculated from stressors such as land use, land cover, and presence, use, and distance from roads (Theobald 2014). Click <a href='" + static_url + "docs/Theobald_2013.pdf' target='_blank'>here</a> to download the full research article. <p><p><b>Post Processing: </b>The original values ranged from 0 to 1. A linear transformation (y=2x-1) was applied in order to stretch the range of values from -1 to +1 (the range of fuzzy values defined by the Environmental Evaluation Modeling System and used in the Condition & Impacts chart).</div>",2],
        "inputs": ["","", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","","",""]
    },
    "overlayBounds":[[24.54503211003055, -124.73750154301554], [49.38749760016799, -101.35215619724352]],
    /* used the extent from the vector clipping mask */
    "overlayBounds2":[[28.9713024690001, -124.763583911], [49.0031387380001, -101.345043443]],
    "overlayBounds3":[[31.30479955912671, -124.73750686645512], [49.02916526794433, -102.02248116866267]],

};


