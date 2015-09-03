//Legend Label, Legend Name
legendParams={
    "intactness":["Terrestrial Intactness","Intactness"],
    "hisensfz":["Site Sensitivity","EEMS_Climate_2"],
    "eecefzt1":["Climate Exposure<br>2016-2045<br>(Ensemble)","EEMS_Climate_2"],
    "eecefzt2":["Climate Exposure<br>2046-2075<br>(Ensemble)","EEMS_Climate_2"],
    "eepifzt1":["Potential Impact<br>2016-2045<br>(Ensemble)","EEMS_Climate_2"],
    "eepifzt2":["Potential Impact<br>2046-2075<br>(Ensemble)","EEMS_Climate_2"]
};

//Legend properties
intactnessParams = {
    legendTitle:"Terrestrial Intactness",
    legendPNG:"intactness",
    legendHeight:"110px",
    legendLabels:["Very High","High","Moderately High","Moderately Low", "Low", "Very Low"],
    dataBasinID:"958719f2359e40b99ca683d1a473ba8d",
    description:"Terrestrial intactness is an estimate of current condition based on the extent to which human impacts such as agriculture, urban development, natural resource extraction, and invasive species have disrupted the landscape across the DRECP study area. Terrestrial intactness values will be high in areas where these impacts are low. <p>The value shown in the column chart represents the average terrestrial intactness value within the selected area. Terrestrial intactness values are calculated using an <a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> fuzzy logic model that integrates multiple measures of landscape development and vegetation intactness (See EEMS model diagram below). <p>  This model integrates agriculture development (from LANDFIRE EVT v1.1), urban development (from LANDFIRE EVT v1.1 and NLCD Impervious Surfaces), linear development (from Tiger 2012 Roads, utility lines, and pipelines), OHV recreation areas, energy and mining development (from state mine and USGS national mines datasets as well as geothermal wells, oil/gas wells, wind turbines, and power plant footprints), vegetation departure (from LANDFIRE VDEP), invasive vegetation (multiple sources combined for invasives analyses), and measures of natural vegetation fragmentation calculated using FRAGSTATS. In this version, Maxent modeled Sahara Mustard was included in the Invasive's branch as well as in the Fragstats model run. <div class='modelDiagram' style='height:70%'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide1.PNG'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide2.PNG'><div class='bottom_spacing'><p></div></div>",
};

hisensfzParams = {
    legendTitle:"Site Sensitivity",
    legendPNG:"EEMS_Climate_2",
    legendHeight:"110px",
    legendLabels:["Very High","High","Moderately High","Moderately Low", "Low", "Very Low"],
    dataBasinID:"958719f2359e40b99ca683d1a473ba8d",
    description:"<a target='_blank' href=http://databasin.org/datasets/"+ this.dataBasinID+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p> The Site Sensitivity Model evaluates the study area for factors that make the landscape sensitive to climate change. These factors fall into two main branches of the model: soil sensitivity and water retention potential. As a final step in the model, we defined barren areas as having the lowest possible sensitivity since many of these areas will not be further degraded by climate change.<p>The value shown in the column chart represents the average sensitivity value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/SiteSensitivity.png'><div class='bottom_spacing'><p></div></div>",
};

eecefzt1Params = {
    legendTitle:"Climate Exposure<br>2016-2045<br>(Ensemble)",
    legendPNG:"EEMS_Climate_2",
    legendHeight:"110px",
    legendLabels:["Very High","High","Moderately High","Moderately Low", "Low", "Very Low"],
    dataBasinID:"958719f2359e40b99ca683d1a473ba8d",
    description:"<a target='_blank' href=http://databasin.org/datasets/"+this.dataBasinID+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2016-2045) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past. <p>The value shown in the column chart represents the average climate exposure value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>",
};

eecefzt2Params = {
    legendTitle:"Climate Exposure<br>2046-2075<br>(Ensemble)",
    legendPNG:"EEMS_Climate_2",
    legendHeight:"110px",
    legendLabels:["Very High","High","Moderately High","Moderately Low", "Low", "Very Low"],
    dataBasinID:"958719f2359e40b99ca683d1a473ba8d",
    description:"<a target='_blank' href=http://databasin.org/datasets/"+this.dataBasinID+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2046-2075) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past.<p>The value shown in the column chart represents the average climate exposure value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'><div class='bottom_spacing'><p></div>",
};

eepifzt1Params = {
    legendTitle:"Potential Impact<br>2016-2045<br>(Ensemble)",
    legendPNG:"EEMS_Climate_2",
    legendHeight:"110px",
    legendLabels:["Very High","High","Moderately High","Moderately Low", "Low", "Very Low"],
    dataBasinID:"958719f2359e40b99ca683d1a473ba8d",
    description:"<a target='_blank' href=http://databasin.org/datasets/"+this.dataBasinID+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2016-2045) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p><p>The value shown in the column chart represents the average potential climate impact value within the selected area. <div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div class='bottom_spacing'><p></div>",
};

eepifzt2Params = {
    legendTitle:"Potential Impact<br>2046-2075<br>(Ensemble)",
    legendPNG:"EEMS_Climate_2",
    legendHeight:"110px",
    legendLabels:["Very High","High","Moderately High","Moderately Low", "Low", "Very Low"],
    dataBasinID:"958719f2359e40b99ca683d1a473ba8d",
    desription:"<a target='_blank' href=http://databasin.org/datasets/"+this.dataBasinID+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p><a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2046-2075) generated using data from STATSGO soils data and climate model results. Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p>The value shown in the column chart represents the average potential climate impact value within the selected area.<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'><div class='bottom_spacing'><p></div>"
};

climateParams = {
    //first array item is the model code used in the field name.
    // Second array item is the color to use in the point chart.
    models:{"PRISM":["pm","black"], "ACCESS":["a0", "#FF00FF"], "CanESM2":["c2","#DEB78B"],"CCSM4":["c4","#717573"],"MIROC5":["m5","#C6D2DF"],"Ensemble":["ee","red"]},
    timePeriods:2,
    labels:{
        "tmax":["Degrees (°C)","°C"],
        "tmad":["Degrees (°C)","°C"],
        "tmaa":["Degrees (°C)","°C"],
        "tmin":["Degrees (°C)","°C"],
        "tmid":["Degrees (°C)","°C"],
        "tmia":["Degrees (°C)","°C"],
        "prec":["mm/year","mm/year"],
        "ppt":["mm/year","mm/year"],
        "pred":["mm/year","mm/year"],
        "pet":["mm/year","mm/year"],
        "arid":["Percent Change","%"]
    },
    legendHeight:"176px",
    legendLabels:["","","","","",""],
}

