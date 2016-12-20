title="Landscape";
subTitle="Climate Projections for Federally and Tribally Protected Lands of the West";
initialLat=39;
initialLon=-116;
initialDownscaleMarkerLat=35.28;
initialDownscaleMarkerLon=-116.54;
selectedClimateDivision='94';
zoomLevel=5;
modules=[''];

reportingUnits={
     // "Reporting Units Label":["database_table_name","name_field","json_file"]
    "LCC Boundaries": ["multi_lcc_reporting_units_llc_boundaries_1_simplify","name","Multi_LCC_Reporting_Units_LLC_Boundaries_2_simplify.json"],
    //"BLM Field Offices": ["multi_lcc_reporting_units_blm_field_office_2_simplify","name","Multi_LCC_Reporting_Units_BLM_Field_Office_for_JSON_2_simplify.json"],
    //"DOD Boundaries": ["multi_lcc_reporting_units_dod_lcc_5_simplify","name","Multi_LCC_Reporting_Units_DOD_LCC_5_simplify_delete_name_eq_military_land.json"],
    //"USFS National Forests": ["multi_lcc_reporting_units_usfs_2_simplify","name","Multi_LCC_Reporting_Units_USFS_2_simplify.json"],
};

climateParams = {
    timePeriods:2,
    timePeriodLabels:['Historical <br>(1971-2000)', '2016-2045', '2046-2075'],
    models:{
        // "MODEL Name(No underscores)": ["field_code_abbreviation", "point_chart_color", "Data Basin Layer Index"]
        "PRISM":["pm","black","0"],
        "BCC":["bm", "#FF00FF","0"],
        "CanESM2":["c2","#DEB78B","1"],
        "CCSM4":["c4","#717573","2"],
        "CSIRO":["c0","#808000","3"],
        "HadGEM2CC":["hc","#FF8A09","5"],
        "HadGEM2ES":["hs","#8080C0","6"],
        "IPSL":["ir","#8080C0","7"],
        "MIROC5":["m5","#C6D2DF","8"],
        "NorESM1":["nm","#C6D2DF","9"],
        "Ensemble":["ee","red","4"]},
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
    imageOverlayDIR:"multilccPNG",
    overlayBounds:[[24.05929043149538, -125.00416666645106], [49.50416665670897, -101.33984457416027]],
    boxPlot:false
};

modelInfoText='The time series climate data used to represent the historical period (1971-2000) were obtained from the LT71m PRISM 30 arc-second spatial climate dataset for the Conterminous United States (Daly et al., 2008). We selected ten of the 34 CMIP5 General Circulation Models (GCMs) that have been shown to reproduce several observed climate metrics and that captured the full range of projected change for both annual average temperature and annual precipitation under the representative concentration pathway 8.5 (RCP8.5; Meinshausen et al., 2011; van Vuuren et al., 2011). We then obtained downscaled time series climate projections for the selected GCMs from the NASA Earth Exchange (NEX) U.S. Downscaled Climate Projections (NEX US-DCP30) dataset (Thrasher et al., 2013) for the entire spatial extent of the study area and for the period 2016-2075 time. The multi-model ensemble mean of the 10 downscaled climate models was calculated for each of the climate variables.'

EEMSParams={
    defaultRenderer:'stretched',
    hasSubNodeImageOverlays:true,
    models: {
        // "Field Code" ["Legend Label", "Legend File Name (without png), "Legend Labels", "Data Basin ID", "EEMS Command File", "Top Node", "Description for Popup"]
        //"intactness": ["Terrestrial Intactness", "Terrestrial Intactness", "Intactness", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "958719f2359e40b99ca683d1a473ba8d", "CA_intactness.eem","HiTerrestIntactnessFz","Terrestrial intactness is an estimate of current condition based on the extent to which human impacts such as agriculture, urban development, natural resource extraction, and invasive species have disrupted the landscape across the DRECP study area. Terrestrial intactness values will be high in areas where these impacts are low. <p>The value shown in the column chart represents the average terrestrial intactness value within the selected area. Terrestrial intactness values are calculated using an <a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> fuzzy logic model that integrates multiple measures of landscape development and vegetation intactness (See EEMS model diagram below). <p>  This model integrates agriculture development (from LANDFIRE EVT v1.1), urban development (from LANDFIRE EVT v1.1 and NLCD Impervious Surfaces), linear development (from Tiger 2012 Roads, utility lines, and pipelines), OHV recreation areas, energy and mining development (from state mine and USGS national mines datasets as well as geothermal wells, oil/gas wells, wind turbines, and power plant footprints), vegetation departure (from LANDFIRE VDEP), invasive vegetation (multiple sources combined for invasives analyses), and measures of natural vegetation fragmentation calculated using FRAGSTATS. In this version, Maxent modeled Sahara Mustard was included in the Invasive's branch as well as in the Fragstats model run. <div class='modelDiagram' style='height:70%'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide1.PNG'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide2.PNG'><div class='bottom_spacing'><p></div></div>"],

        "hisens_vl": ["Very Low","Very <br>Low","EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "d9631479be4f4464a266036b55d40c01", "CA_Site_Sensitivity.eem","HighSiteSensitivityFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p> The Site Sensitivity Model evaluates the study area for factors that make the landscape sensitive to climate change. These factors fall into two main branches of the model: soil sensitivity and water retention potential. As a final step in the model, we defined barren areas as having the lowest possible sensitivity since many of these areas will not be further degraded by climate change.<p>The value shown in the column chart represents the average sensitivity value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/SiteSensitivity.png'><div class='bottom_spacing'><p></div></div>"],
        "hisens_l": ["Low","Low","EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","CA_Climate_Exposure_t1.eem","HighDirectClimateExposureFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2016-2045) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past. <p>The value shown in the column chart represents the average climate exposure value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "hisens_ml": ["Moderately Low","Medium <br> Low", "EEMS_Climate_2","110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","CA_Climate_Exposure_t2.eem","HighDirectClimateExposureFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2046-2075) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past.<p>The value shown in the column chart represents the average climate exposure value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "hisens_mh": ["Moderately High","Medium <br> High", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","CA_Potential_Impact_t1.eem","HiPotImpactFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2016-2045) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p><p>The value shown in the column chart represents the average potential climate impact value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div width='100%' style='margin-left:auto;margin-right:auto;text-align:center'><i>The inputs to this model are the outputs from the Site Sensitivity & Climate Exposure (2016-2045) models</i></div><div class='bottom_spacing'><p></div>"],
        "hisens_h": ["High","High", "High", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","CA_Potential_Impact_t2.eem","HiPotImpactFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2046-2075) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p>The value shown in the column chart represents the average potential climate impact value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div width='100%' style='margin-left:auto;margin-right:auto;text-align:center'><i>The inputs to this model are the outputs from the Site Sensitivity & Climate Exposure (2046-2075) models</i></div><div class='bottom_spacing'><p></div>"],
        "hisens_vh": ["Very High","Very <br>High", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","CA_Potential_Impact_t2.eem","HiPotImpactFz2","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2046-2075) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p>The value shown in the column chart represents the average potential climate impact value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div width='100%' style='margin-left:auto;margin-right:auto;text-align:center'><i>The inputs to this model are the outputs from the Site Sensitivity & Climate Exposure (2046-2075) models</i></div><div class='bottom_spacing'><p></div>"],
    },
    "overlayBounds":[[32.534715526793306, -124.40416822955052], [42.01249803975221, -114.12309789053886]],
};

ecosystemServicesParams={
    "LCC Boundaries": {
        "continuousTables": {
        },
        "vtypeTables": {
            "ccsm4": "multi_lcc_reporting_units_pa_es_decadal_vtype_ccsm4",
            "cnrm": "multi_lcc_reporting_units_pa_es_decadal_vtype_cnrm_cm5",
            "canesm2": "multi_lcc_reporting_units_pa_es_decadal_vtype_canesm2",
            "hadgem2es": "multi_lcc_reporting_units_pa_es_decadal_vtype_hadgem2_es"
        },
        "overlayBounds":[[28.801987047618255, -124.73749542236328], [49.104166030883796, -101.99673917748265]]
    }
};

