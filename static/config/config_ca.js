title="California";
subTitle="Climate Projections for the State of California";
studyAreaBoundary="CA_Boundary_5_simplify.json";
initialLat=37.2;
initialLon=-121.5;
initialDownscaleMarkerLat=35.28;
initialDownscaleMarkerLon=-116.54;
selectedClimateDivision='94';
zoomLevel=7;
areaChart=true;
hasEcosystemServices=true;
initialBaseMap="worldTopo";

headerLinks={
    // Row 1
    "California Climate Console": "/ca",
    "CONUS Climate Console": "/conus",
    // Row 2
    "DRECP Climate Console": "/drecp",
    "Landscape Climate Dashboard": "/multi-lcc",
    "Climate Commons": "http://climate.calcommons.org/",
    // Row 3
    "Sagebrush Climate Console": "/sagebrush",
    "CBI Climate Center": "http://climate.databasin.org/",
    "Cal-Adapt": "http://climate.databasin.org",
};

reportingUnits={
     // "Reporting Units Label":["database_table_name","name_field","json_file"]
    "Counties": ["ca_reporting_units_county_boundaries_5_simplify","name","CA_Reporting_Units_County_Boundaries_5_simplify.json"],
    "Jepson Ecoregions":["ca_jepson_ecoregions_2_simplify","name","CA_Reporting_Units_Jepson_Ecoregions_2_simplify.json"],
    "USDA Ecoregions":["ca_reporting_units_bailey_ecoregions_pre_simplify","name","CA_Reporting_Units_Bailey_Ecoregions_2_simplify.json"],
    "BLM Field Offices":["ca_reporting_units_blm_field_offices_7_simplify", "name", "CA_Reporting_Units_BLM_Field_Offices_7_simplify.json"],
    "HUC5 Watersheds": ["ca_reporting_units_huc5_watersheds_5_simplify", "name", "CA_Reporting_Units_HUC5_Watersheds_5_simplify.json"],
    "National Forests": ["ca_reporting_units_usfs_national_forests_15_simplify","name","CA_Reporting_Units_USFS_National_Forests_15_simplify.json"],
    "User Defined (1km)": ["ca_reporting_units_1km_poly_join_eems_ti","",""],
};

climateParams={
    timePeriods:2,
    timePeriodLabels:['Historical <br>(1971-2000)', '2016-2045', '2046-2075'],
    models: {
        // "MODEL Name(No underscores)": ["field_code_abbreviation", "point_chart_color", "Data Basin Layer Index", "initial visibility", "point symbol size", "point symbol shape"]
        "PRISM": ["pm", "black", "0", true, 4, "circle"],
        "Ensemble": ["ee", "#C0C2C2", "0", true, 4, "circle"],
        "CNRM(Warm/Wet)": ["c5", "#C0C2C2", "5", true, 4, "circle"],
        "CCSM4(Warm/Dry)": ["c4", "#C0C2C2", "2", true, 4, "circle"],
        "CanESM2(Hot/Wet)": ["c2", "#C0C2C2", "6", true, 4, "circle"],
        "HadGEM2ES(Hot/Dry)": ["hs", "#C0C2C2", "9", true, 4, "circle"],
        "ACCESS": ["a0", "#C0C2C2", "1", true, 4, "circle"],
        "CESM1": ["cc", "#C0C2C2", "3", true, 4, "circle"],
        "CMCC": ["cm", "#C0C2C2", "4", true, 4, "circle"],
        "GFDL": ["g3", "#C0C2C2", "7", true, 4, "circle"],
        "HadGEM2CC": ["hc", "#C0C2C2", "8", true, 4, "circle"],
        "MIROC5": ["m5", "#C0C2C2", "10", true, 4, "circle"],
    },
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
    imageOverlayDIR:"TrimmedPNG",
    overlayBounds:[[32.52777441016329, -124.41250000002108], [42.02083587646484, -114.1214454281304]],
    boxPlot:false
};

modelInfoText='The time series climate data used to represent the historical period (1971-2000) were obtained from the LT71m PRISM 30 arc-second spatial climate dataset for the Conterminous United States (Daly et al., 2008). We selected ten of the 34 CMIP5 General Circulation Models (GCMs) that have been shown to reproduce several observed climate metrics and that captured the full range of projected change for both annual average temperature and annual precipitation under the representative concentration pathway 8.5 (RCP8.5; Meinshausen et al., 2011; van Vuuren et al., 2011). We then obtained downscaled time series climate projections for the selected GCMs from the NASA Earth Exchange (NEX) U.S. Downscaled Climate Projections (NEX US-DCP30) dataset (Thrasher et al., 2013) for the entire spatial extent of the study area and for the period 2016-2075 time. The multi-model ensemble mean of the 10 downscaled climate models was calculated for each of the climate variables.'

EEMSParams={
    defaultRenderer:'stretched',
    hasSubNodeImageOverlays:true,
    models: {
        // "Field Code" ["Legend Label", "Legend File Name (without png), "Legend Labels", "Data Basin ID", "EEMS Command File", "Top Node", "Description for Popup", "Bounds to Use"]
        //"intactness": ["Terrestrial Intactness", "Terrestrial Intactness", "Intactness", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "958719f2359e40b99ca683d1a473ba8d", "CA_intactness.eem","HiTerrestIntactnessFz","Terrestrial intactness is an estimate of current condition based on the extent to which human impacts such as agriculture, urban development, natural resource extraction, and invasive species have disrupted the landscape across the DRECP study area. Terrestrial intactness values will be high in areas where these impacts are low. <p>The value shown in the column chart represents the average terrestrial intactness value within the selected area. Terrestrial intactness values are calculated using an <a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> fuzzy logic model that integrates multiple measures of landscape development and vegetation intactness (See EEMS model diagram below). <p>  This model integrates agriculture development (from LANDFIRE EVT v1.1), urban development (from LANDFIRE EVT v1.1 and NLCD Impervious Surfaces), linear development (from Tiger 2012 Roads, utility lines, and pipelines), OHV recreation areas, energy and mining development (from state mine and USGS national mines datasets as well as geothermal wells, oil/gas wells, wind turbines, and power plant footprints), vegetation departure (from LANDFIRE VDEP), invasive vegetation (multiple sources combined for invasives analyses), and measures of natural vegetation fragmentation calculated using FRAGSTATS. In this version, Maxent modeled Sahara Mustard was included in the Invasive's branch as well as in the Fragstats model run. <div class='modelDiagram' style='height:70%'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide1.PNG'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide2.PNG'><div class='bottom_spacing'><p></div></div>"],
        "hisensfz": ["Site Sensitivity","Site Sensitivity","EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "d1aba81719dc465594ed9a8d64e6b2a7&visibleLayers=6", "CA_Site_Sensitivity.eem","HighSiteSensitivityFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p> The Site Sensitivity Model evaluates the study area for factors that make the landscape sensitive to climate change. These factors fall into two main branches of the model: soil sensitivity and water retention potential. As a final step in the model, we defined barren areas as having the lowest possible sensitivity since many of these areas will not be further degraded by climate change.<p>The value shown in the column chart represents the average sensitivity value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/SiteSensitivity.png'><div class='bottom_spacing'><p></div></div>"],
        "eecefzt1": ["Climate Exposure<br>2016-2045<br>(Ensemble)","Climate Exposure (2016-2045)","EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"15e8a1a8ad604c2681590dc68d4ec1cf&visibleLayers=1","CA_Climate_Exposure_t1.eem","HighDirectClimateExposureFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2016-2045) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past. <p>The value shown in the column chart represents the average climate exposure value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "eecefzt2": ["Climate Exposure<br>2046-2075<br>(Ensemble)","Climate Exposure (2046-2075)", "EEMS_Climate_2","110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"50afa5e1a75a419eb90bada030326558&visibleLayers=1","CA_Climate_Exposure_t2.eem","HighDirectClimateExposureFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2046-2075) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past.<p>The value shown in the column chart represents the average climate exposure value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>"],
        /*
        "eepifzt1": ["Potential Impact<br>2016-2045<br>(Ensemble)","Potential Impact (2016-2045)", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"5f66253161de4550b720da7b16bbd46b&visibleLayers=0","CA_Potential_Impact_t1.eem","HiPotImpactFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2016-2045) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p><p>The value shown in the column chart represents the average potential climate impact value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div width='100%' style='margin-left:auto;margin-right:auto;text-align:center'><i>The inputs to this model are the outputs from the Site Sensitivity & Climate Exposure (2016-2045) models</i></div><div class='bottom_spacing'><p></div>"],
        "eepifzt2": ["Potential Impact<br>2046-2075<br>(Ensemble)","Potential Impact (2046-2075)", "EEMS_Climate_2", "", [""],"958719f2359e40b99ca683d1a473ba8d","CA_Potential_Impact_t2.eem","HiPotImpactFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2046-2075) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p>The value shown in the column chart represents the average potential climate impact value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div class='bottom_spacing'><p></div>"],
        */
        "intactness": ["Terrestrial Intactness","Terrestrial Intactness", "intactness", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"e3ee00e8d94a4de58082fdbc91248a65","CA_TI_EEMS2_1KM_Draft_UpdateFRAGSTATS_v30_Edited.eem","Terrestrial_Landscape_Intactness_Updated_Frag_Fz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of Terrestrial Intactness. This dataset provides an estimate of terrestrial intactness, (i.e. condition), based on the extent to which human impacts such as agriculture, urban development, natural resource extraction, and invasive species have disrupted the landscape across the State of California. Terrestrial intactness values are high in areas where these impacts are low. The value shown in the column chart represents the average terrestrial intactness value within the selected area. <p> This dataset, updated December 2016, is the most recent version (v30) created for the California Energy Commission using the open-source logic modeling framework Environmental Evaluation Modeling System (EEMS). Spatially-explicit logic modeling hierarchically integrates numerous and diverse datasets into composite layers, quantifying information in a continuous rather than binary fashion. This technique yields accessible decision-support products that state and federal agencies can use to craft scientifically-rigorous management strategies. The analysis was carried out at 1 sq. km resolution.  <p> Input data used to create this version range in currency from 2011-2015; the majority of data portray the more recent condition of the landscape.  <p> This model integrates agriculture development (from FRAP Vegetation, and CDL Cropscape), urban development (from LANDFIRE EVT and NLCD Impervious Surfaces), polluted areas (from NHD treatment ponds and EPA Superfund and Brownfield sites), linear development (OHV routes from owlsheadgps.com, roads from TIGER (broken down by type), utility lines, railroads, and pipelines from various state and BLM sources), point development (communication towers from the FCC), energy and mining development (from the state’s Office of Mine Reclamation mine dataset, larger mine footprints, state geothermal wells, USGS wind turbines, solar footprints, renewable projects in development, oil refineries and state oil/gas wells), clear cuts from Statewide Timber Harvest Plans, invasive vegetation (compiled from multiple sources including LANDFIRE EVT, NatureServe Landcover, and NISIMS BLM database), and measures of natural vegetation fragmentation calculated using FRAGSTATS (percent natural core area, number of patches, and nearest neighbor). Results are dependent on the quality of available input data for a given area.  <p> This most recent version of the model (v30) addresses over-estimation of fragmentation impacts seen in previous versions (e.g. v24), which stemmed from invasive vegetation and fire effects in FRAGSTATS calculations. New fragmentation metrics shift focus to anthropogenic development. Invasive vegetation is now compartmentalized within the logic model and influences the overall impact/condition score to a lesser extent. Additional model refinements stratify road impacts by TIGER class, e.g. different weighting for interstates vs. local roads.  <p> Results apply to terrestrial areas only. (Water bodies are omitted from the final dataset.) <p> The input data, intermediate layers, and final results of this analysis can be explored via the EEMS Explorer of Data Basin (http://databasin.org/), where they are accessible as online interactive maps showing the signature of human impact across the landscape.  <p> Caution is warranted in interpreting this dataset because it provides a single estimate of terrestrial intactness based on available data. It does not directly address ecological value; the “Conservation Values” model does. The degree of terrestrial intactness likely varies for a particular species or conservation element, and may depend on additional factors or thresholds not included in this model. This model should be taken as a general measure of intactness that can serve as a template for evaluating across many species at the ecoregion scale, and provides a framework within which species-specific parameters can be incorporated for more detailed analyses.  <p> <div class='bottom_spacing'><p></div>",2],
        "inputs": ["","", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","","",""]
    },
    "overlayBounds":[[32.534715526793306, -124.40416822955052], [42.01249803975221, -114.12309789053886]],
    "overlayBounds2":[[32.420555929602216, -124.51195936708041], [42.07280829794549, -113.50767147181855]]
};

ecosystemServicesParams= {
    "overlayBounds": [[32.39381129279525, -124.5041656494141], [42.104166030883796, -113.98885110354271]],
    "vtypeLookup" : {
            'value_0': ['undefined', 'gray'],
            'value_1': ['Taiga/Tundra', '#CCCCFF'],
            'value_2': ['Conifer Forest', '#006633'],
            'value_3': ['Mixed Forest', '#7FBF7B'],
            'value_4': ['Broadleaf Forest', '#48F748'],
            'value_5': ['Shrubland/Woodland/Savanna', '#996633'],
            'value_6': ['Grassland', '#FFFF00'],
            'value_7': ['Arid Land', '#FF0000'],
            'value_8': ['Annual Agriculture', '#FFBF71'],
            'value_9': ['Perennial Agriculture', '#FF8C00'],
            'value_10': ['Developed/Mined', '#2D2D2D'],
    },
    "Counties": {
        "continuousTables": {
            "ccsm4": "ca_reporting_units_counties_es_decadal_ccsm4",
            "cnrm": "ca_reporting_units_counties_es_decadal_cnrm_cm5",
            "canesm2": "ca_reporting_units_counties_es_decadal_canesm2",
            "hadgem2es": "ca_reporting_units_counties_es_decadal_hadgem2_es"
        },
        "vtypeTables": {
            "ccsm4": 'ca_reporting_units_counties_es_decadal_vtype_ccsm4',
            "cnrm": 'ca_reporting_units_counties_es_decadal_vtype_cnrm_cm5',
            "canesm2": 'ca_reporting_units_counties_es_decadal_vtype_canesm2',
            "hadgem2es": 'ca_reporting_units_counties_es_decadal_vtype_hadgem2_es'
        },
    },
    "Jepson Ecoregions": {
        "continuousTables": {
            "ccsm4": "ca_reporting_units_jepson_ecoregions_es_decadal_ccsm4",
            "cnrm": "ca_reporting_units_jepson_ecoregions_es_decadal_cnrm_cm5",
            "canesm2": "ca_reporting_units_jepson_ecoregions_es_decadal_canesm2",
            "hadgem2es": "ca_reporting_units_jepson_ecoregions_es_decadal_hadgem2_es"
        },
        "vtypeTables": {
            "ccsm4": 'ca_reporting_units_jepson_ecoregions_es_decadal_vtype_ccsm4',
            "cnrm": 'ca_reporting_units_jepson_ecoregions_es_decadal_vtype_cnrm_cm5',
            "canesm2": 'ca_reporting_units_jepson_ecoregions_es_decadal_vtype_canesm2',
            "hadgem2es": 'ca_reporting_units_jepson_ecoregions_es_decadal_vtype_hg2_es'
        },
    },
    "USDA Ecoregions": {
        "continuousTables": {
            "ccsm4": "ca_reporting_units_usda_ecoregions_es_decadal_ccsm4",
            "cnrm": "ca_reporting_units_usda_ecoregions_es_decadal_cnrm_cm5",
            "canesm2": "ca_reporting_units_usda_ecoregions_es_decadal_canesm2",
            "hadgem2es": "ca_reporting_units_usda_ecoregions_es_decadal_hadgem2_es"
        },
        "vtypeTables": {
            "ccsm4": 'ca_reporting_units_usda_ecoregions_es_decadal_vtype_ccsm4',
            "cnrm": 'ca_reporting_units_usda_ecoregions_es_decadal_vtype_cnrm_cm5',
            "canesm2": 'ca_reporting_units_usda_ecoregions_es_decadal_vtype_canesm2',
            "hadgem2es": 'ca_reporting_units_usda_ecoregions_es_decadal_vtype_hadgem2_es'
        },
    },
    "BLM Field Offices": {
        "continuousTables": {
            "ccsm4": "ca_reporting_units_blm_field_offices_es_decadal_ccsm4",
            "cnrm": "ca_reporting_units_blm_field_offices_es_decadal_cnrm_cm5",
            "canesm2": "ca_reporting_units_blm_field_offices_es_decadal_canesm2",
            "hadgem2es": "ca_reporting_units_blm_field_offices_es_decadal_hadgem2_es"
        },
        "vtypeTables": {
            "ccsm4": 'ca_reporting_units_blm_field_offices_es_decadal_vtype_ccsm4',
            "cnrm": 'ca_reporting_units_blm_field_offices_es_decadal_vtype_cnrm_cm5',
            "canesm2": 'ca_reporting_units_blm_field_offices_es_decadal_vtype_canesm2',
            "hadgem2es": 'ca_reporting_units_blm_field_offices_es_decadal_vtype_hg2_es'
        },
    },
    "HUC5 Watersheds": {
        "continuousTables": {
            "ccsm4": "ca_reporting_units_huc5_watersheds_es_decadal_ccsm4",
            "cnrm": "ca_reporting_units_huc5_watersheds_es_decadal_cnrm",
            "canesm2": "ca_reporting_units_huc5_watersheds_es_decadal_canesm2",
            "hadgem2es": "ca_reporting_units_huc5_watersheds_es_decadal_hadgem2es"
        }
        ,
        "vtypeTables": {
            "ccsm4": 'ca_reporting_units_huc5_watersheds_es_decadal_vtype_ccsm4',
            "cnrm": 'ca_reporting_units_huc5_watersheds_es_decadal_vtype_cnrm',
            "canesm2": 'ca_reporting_units_huc5_watersheds_es_decadal_vtype_canesm2',
            "hadgem2es": 'ca_reporting_units_huc5_watersheds_es_decadal_vtype_hadgem2es'
        },
    },
    "National Forests": {
        "continuousTables": {
            "ccsm4": "ca_reporting_units_usfs_national_forests_es_decadal_ccsm4",
            "cnrm": "ca_reporting_units_usfs_national_forests_es_decadal_cnrm_cm5",
            "canesm2": "ca_reporting_units_usfs_national_forests_es_decadal_canesm2",
            "hadgem2es": "ca_reporting_units_usfs_national_forests_es_decadal_hadgem2_es"
        },
        "vtypeTables": {
            "ccsm4": 'ca_reporting_units_usfs_es_decadal_vtype_ccsm4',
            "cnrm": 'ca_reporting_units_usfs_es_decadal_vtype_cnrm_cm5',
            "canesm2": 'ca_reporting_units_usfs_es_decadal_vtype_canesm2',
            "hadgem2es": 'ca_reporting_units_usfs_es_decadal_vtype_hadgem2_es'
        },
    },
};



