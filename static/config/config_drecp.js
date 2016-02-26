title="DRECP"
subTitle="Desert Renewable Energy Conservation Plan"
studyAreaBoundary="DRECP_Bdy_20110128.json"
initialLat=34.8
initialLon=-116.7
initialDownscaleMarkerLat=35.28
initialDownscaleMarkerLon=-116.54
selectedClimateDivision='94'
zoomLevel=8

reportingUnits={
    // "Reporting Units Label":["database_table_name","name_field","json_file"]
    "Counties": ["drecp_reporting_units_county_boundaries_no_simplify","name_pcase","DRECP_Reporting_Units_County_Boundaries_JSON.json"],
    "Ecoregion Subareas": ["drecp_reporting_units_ecoregion_subareas_no_simplify","sa_name","DRECP_Reporting_Units_Ecoregion_Subareas_JSON.json"],
    "BLM Field Offices":["drecp_reporting_units_blm_field_offices_no_simplify", "fo_name", "DRECP_Reporting_Units_BLM_Field_Offices_no_simplify.json"],
    "HUC5 Watersheds": ["drecp_reporting_units_huc5_watersheds_1_5_simplify", "Name", "DRECP_Reporting_Units_HUC5_Watersheds_1_5_simplify.json"],
    "DETO Recovery Units": ["drecp_reporting_units_deto_recovery_units_no_simplify", "unit_name", "DRECP_Reporting_Units_DETO_Recovery_Units_no_simplify.json"],
    "User Defined (1km)": ["drecp_reporting_units_1km_poly_v2", "",""],

}

climateParams={
    timePeriods:2,
    timePeriodLabels:['Historical <br>(1971-2000)', '2016-2045', '2046-2075'],
    models:{
        // "MODEL Name(No underscores)": ["field_code_abbreviation", "point_chart_color"]
        "PRISM":["pm","black"],
        "CanESM2":["c2","#DEB78B"],
        "CCSM4":["c4","#717573"],
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
        "pred":["mm/year","mm/year"]
    },
    legendHeight:"",
    legendLabels:["","","","","",""],
    imageOverlayDIR:"drecpPNG",
    overlayBounds:[[32.52468802685505, -118.77083333561102], [37.53750228881834, -114.00019713887225]],
    boxPlot:true

}

EEMSParams={
    defaultRenderer:'stretched',
    hasSubNodeImageOverlays:true,
    models: {
         // "Field Code" ["Legend Label", "Label", "Legend File Name (without png), "Legend Height", "Legend Labels", "Data Basin ID", "EEMS Command File", "Top Node", "Description for Popup", overlay Bounds To Use]
        //The PNGs that come out of clover are not clipped to the data perfectly. So for those PNGs that come from the Automated ArcMap Script, a different extent is needed (Overlay Bounds 2).
        "intactness": ["Terrestrial Intactness", "Terrestrial Intactness", "Intactness", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "958719f2359e40b99ca683d1a473ba8d", "DRECP_intactness.eem","HiTerrestIntactnessFz","Terrestrial intactness is an estimate of current condition based on the extent to which human impacts such as agriculture, urban development, natural resource extraction, and invasive species have disrupted the landscape across the DRECP study area. Terrestrial intactness values will be high in areas where these impacts are low. <p><br>The value shown in the column chart represents the average terrestrial intactness value within the selected area. Terrestrial intactness values are calculated using an <a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> fuzzy logic model that integrates multiple measures of landscape development and vegetation intactness (See EEMS model diagram below). <p>  This model integrates agriculture development (from LANDFIRE EVT v1.1), urban development (from LANDFIRE EVT v1.1 and NLCD Impervious Surfaces), linear development (from Tiger 2012 Roads, utility lines, and pipelines), OHV recreation areas, energy and mining development (from state mine and USGS national mines datasets as well as geothermal wells, oil/gas wells, wind turbines, and power plant footprints), vegetation departure (from LANDFIRE VDEP), invasive vegetation (multiple sources combined for invasives analyses), and measures of natural vegetation fragmentation calculated using FRAGSTATS. In this version, Maxent modeled Sahara Mustard was included in the Invasive's branch as well as in the Fragstats model run. <div class='modelDiagram' style='height:70%'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide1.PNG'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide2.PNG'><div class='bottom_spacing'><p></div></div>",'2'],
        "hisensfz": ["Site Sensitivity","Site Sensitivity","EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "7478dab889544d66a3e0fe3d7644f1ad", "DRECP_Site_Sensitivity.eem","HighSiteSensitivityFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p> The Site Sensitivity Model evaluates the study area for factors that make the landscape sensitive to climate change. These factors fall into two main branches of the model: soil sensitivity and water retention potential. As a final step in the model, we defined barren areas as having the lowest possible sensitivity since many of these areas will not be further degraded by climate change.<p>The value shown in the column chart represents the average sensitivity value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/SiteSensitivity.png'><div class='bottom_spacing'><p></div></div>"],
        "eecefzt1": ["Climate Exposure<br>2016-2045<br>(Ensemble)","Climate Exposure (2016-2045)","EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"c55b0a726487406bba0e17f4fe1b2cbb","DRECP_Climate_Exposure_t1.eem","HighDirectClimateExposureFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2016-2045) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past. <p>The value shown in the column chart represents the average climate exposure value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "eecefzt2": ["Climate Exposure<br>2046-2075<br>(Ensemble)","Climate Exposure (2046-2075)", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"d0e9905271294cd293160cff7115ce8f","DRECP_Climate_Exposure_t2.eem","HighDirectClimateExposureFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2046-2075) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past.<p>The value shown in the column chart represents the average climate exposure value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "eepifzt1": ["Potential Impact<br>2016-2045<br>(Ensemble)","Potential Impact (2016-2045)", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"238aad251e784e4386620a4c51ef272a","DRECP_Potential_Impact_t1.eem","HiPotentialClimateImpactFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2016-2045) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p><p>The value shown in the column chart represents the average potential climate impact value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "eepifzt2": ["Potential Impact<br>2046-2075<br>(Ensemble)","Potential Impact (2046-2075)", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"022ab9e3565a4b11a08b94a3f69695b5","DRECP_Potential_Impact_t2.eem","HiPotentialClimateImpactFz","<a target='_blank' href=http://databasin.org/datasets/" + this.dataBasinID + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2046-2075) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p>The value shown in the column chart represents the average potential climate impact value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "inputs": ["","", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"],"","","",""]

    },
    "overlayBounds":[[32.52468802685504, -118.77083333561102], [37.53750228881834, -114.00019713887222]],
    //"overlayBounds2":[[32.6339585982195,-118.643362495493], [37.302775947927, -114.130781641769 ]],
    "overlayBounds2":[[32.59664729738168, -118.69700425230552], [37.3006362915039, -114.01118088741202]],
};


