title="Utah/COP"
subTitle="Climate Projections for the state of Utah/COP"
studyAreaBoundary="UTAH_COP_Study_Area_Boundary_20150219_GCS_For_JSON_0_simp.json"
initialLat=39.4
initialLon=-112
zoomLevel=7

reportingUnits={
    // "Reporting Units Label":["database_table_name","name_field","json_file"]
    "BLM Admin Units":["utah_cop_reporting_units_blm_admin_units_1_5_simplify", "name", "UTAH_COP_Reporting_Units_BLM_Admin_Units_GCS_For_JSON_simp_1.5.json"],
    "DWR Admin Boundaries": ["utah_cop_reporting_units_dwr_admin_boundaries_no_simplify", "name", "Utah_COP_Reporting_Units_DWR_Admin_Boundaries_for_JSON_no_Simplify.json"],
    "Ecoregions (EPA LIII)": ["utah_cop_reporting_units_epa_leveliii_ecoregions_no_simplify", "name", "Utah_COP_Reporting_Units_EPA_LIII_Ecoregions_eliminate_slivers.json"],
    "User Defined (1km)": ["utah_cop_ru_1km_poly_postgis_v3", "",""],
}

climateParams = {
    timePeriods:2,
    timePeriodLabels:['Historical <br>(1968-1999)', '2015-2030', '2045-2060'],
    models:{
        // "MODEL Name(No underscores)": ["field_code_abbreviation", "point_chart_color"]
        "PRISM":["pm","black"],
        "CCSM4":["c4","#717573"],
        "GFDL_CM3":["g3","#717573"],
        "MRI_CGCM3":["m3","#C6D2DF"],
        "CESM1":["c5","#808000"],
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
    imageOverlayDIR:"utahPNG",
    overlayBounds: [[36.063956623094, -114.67500000413504], [42.433333325985004, -106.76059608289738]],
    boxPlot:false
}

EEMSParams={
    models: {
        // "Field Code" ["Legend Label", "Legend File Name (without png)"]
        "ti_union": ["Terrestrial Intactness", "Terrestrial Intactness","Intactness", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "9f74997a05584071b745b06d12f8266d,5858e720e53144828ba00bd6a58055cb", "This dataset provides an estimate of current terrestrial intactness (i.e. condition) based on the extent to which human impacts such as agriculture, urban development, natural resource extraction, and invasive species have disrupted the landscape across the State of Utah. Terrestrial intactness values will be high in areas where these impacts are low.  <p><br> This 1 km2 resolution dataset (v13F) was created for the Colorado Plateau REA stepdown analysis using the open-source logic modeling framework Environmental Evaluation Modeling System (EEMS). Spatially-explicit logic modeling hierarchically integrates numerous and diverse datasets into composite layers, quantifying information in a continuous rather than binary fashion. This technique yields accessible decision-support products that state and federal agencies can use to craft scientifically-rigorous management strategies.  <div class='modelDiagram' style='height:70%'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness_Utah/Slide1.PNG'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness_Utah/Slide2.PNG'><div class='bottom_spacing'><p></div></div>"],
        "ai_100m": ["Aquatic Intactness", "Aquatic Intactness","Intactness", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "2e6d671d25414d47b2e21072665eefb1","This dataset provides an estimate of current aquatic intactness (i.e. condition) based on the extent to which human impacts such as water demand, agriculture, urban development, natural resource extraction, dams, diversions, and alterations have disrupted the hydrology, water quality, and habitat quality of aquatic systems across the state of Utah and the Colorado Plateau. Aquatic intactness values will be high in areas where these impacts are low.This HUC6 (12-Digit NHD Hydrologic Unit Code) resolution dataset was created for the Colorado Plateau REA stepdown analysis using the open-source logic modeling framework Environmental Evaluation Modeling System (EEMS). Spatially-explicit logic modeling hierarchically integrates numerous and diverse datasets into composite layers, quantifying information in a continuous rather than binary fashion. This technique yields accessible decision-support products that state and federal agencies can use to craft scientifically-rigorous management strategies.  <div class='modelDiagram' style='height:70%'><img src='" + static_url + "img/modelDiagrams/Aquatic_Intactness_Utah/Slide1.PNG'><img src='" + static_url + "img/modelDiagrams/Aquatic_Intactness_Utah/Slide2.PNG'><div class='bottom_spacing'><p></div></div>"],
        "hisensfz": ["Site Sensitivity","Site Sensitivity","EEMS_Climate_2", "110px",["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "554332c922224764bbdd849d9d01527f", "<a target='_blank' href=http://databasin.org/datasets/" + "554332c922224764bbdd849d9d01527f" + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p> The Site Sensitivity Model evaluates the study area for factors that make the landscape sensitive to climate change. These factors fall into two main branches of the model: soil sensitivity and water retention potential. As a final step in the model, we defined barren areas as having the lowest possible sensitivity since many of these areas will not be further degraded by climate change.<p>The value shown in the column chart represents the average sensitivity value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/SiteSensitivity.png'><div class='bottom_spacing'><p></div></div>"],
        "eecefzt1": ["Climate Exposure<br>2015-2030<br>(Ensemble)","Climate Exposure t1", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "4e0beeb6125d47679cf4d8ffa567330a", "<a target='_blank' href=http://databasin.org/datasets/" + "4e0beeb6125d47679cf4d8ffa567330a" + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2015-2030) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1968-1999. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past. <p>The value shown in the column chart represents the average climate exposure value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsembleUtah.png'><div class='bottom_spacing'><p></div>"],
        "eecefzt2": ["Climate Exposure<br>2045-2060<br>(Ensemble)","Climate Exposure t2", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "98d92619a0cd41f4b53180ec827c9147", "<a target='_blank' href=http://databasin.org/datasets/" + "98d92619a0cd41f4b53180ec827c9147" + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2045-2060) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1968-1999. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past.<p>The value shown in the column chart represents the average climate exposure value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsembleUtah.png'><div class='bottom_spacing'><p></div>"],
        "eepifzt1": ["Potential Impact<br>2015-2030<br>(Ensemble)","Potential Impact t1", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "7f0df914e6c74c6ebd453844d9ebe308", "<a target='_blank' href=http://databasin.org/datasets/" + "7f0df914e6c74c6ebd453844d9ebe308" + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2015-2030) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p><p>The value shown in the column chart represents the average potential climate impact value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div class='bottom_spacing'><p></div>"],
        "eepifzt2": ["Potential Impact<br>2045-2060<br>(Ensemble)","Potential Impact t2", "EEMS_Climate_2", "110px", ["Very High", "High", "Moderately High", "Moderately Low", "Low", "Very Low"], "dc39954394db48f5a8589a8f0d720042", "<a target='_blank' href=http://databasin.org/datasets/" + "dc39954394db48f5a8589a8f0d720042" + "><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2045-2060) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p>The value shown in the column chart represents the average potential climate impact value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div class='bottom_spacing'><p></div>"],
    },
     overlayBounds:[[36.5628357240001, -114.052860], [42.0017065100001, -107.265658528]]
};

