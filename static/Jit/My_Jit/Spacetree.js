var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    //this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
    this.elem.style.left = 0 + 'px';
    this.elem.style.top = 0 + 'px';
    this.elem.style.verticalAlign = 'top';
  }
};

function defineJSONtree(){

    if (modelForTree=='intactness') {
        /*
        $.getScript( static_url + "Jit/My_Jit/Jit_Models/terrestrial_intactness.json", function( data, textStatus, jqxhr ) {
          console.log( textStatus ); // Success
          console.log( jqxhr.status ); // 200
          console.log( "Load was performed." );
          json=data;
          console.log(json); // Data returned
        });
        */
        json={
id: 'HiTerrestIntactnessFz',
name: 'Terrestrial Intactness'  + "<div class='EEMS_Tree_Value'>" + resultsJSON['eetmins1t1_avg'] + "</div>",
data:  {'raw_operation': 'SELECTEDUNION', 'raw_arguments': ['-1', '2'], 'operation': 'Selected Union'} ,
children: [
{
id: 'LoVegStateImpactsFz',
name: 'Low Veg State Impacts' + "<div class='EEMS_Tree_Value'>" + resultsJSON['eetmins1t2_avg'] + "</div>",
data:  {'raw_operation': 'CVTTOFUZZY', 'raw_arguments': ['100', '0'], 'operation': 'Convert to Fuzzy'} ,
children: [
{
id: 'VegStateImpactsSum',
name: 'Veg State Impacts Sum',
data:  {'raw_operation': 'WTDSUM', 'raw_arguments': ['0.2', '0.4', '0.2', '0.3', '0.5'], 'operation': 'Weighted Sum'} ,
children: [
{
id: 'Invasives_Density',
name: 'Invasives_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
{
id: 'Grazing_Density',
name: 'Grazing_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
{
id: 'Intensive_Agriculture_Density',
name: 'Intensive_Agriculture_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
{
id: 'BLM_OHV_Density',
name: 'BLM_OHV_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
{
id: 'VegDeparture_selective_reclass',
name: 'VegDeparture_selective_reclass',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
]},
]},
{
id: 'LoPermanentDevelopmentFz',
name: 'Low Permanent Development' + "<div class='EEMS_Tree_Value'>" + resultsJSON['eetmins4t2_avg'] + "</div>",
data:  {'raw_operation': 'ORNEG', 'operation': 'Negative Or'} ,
children: [
{
id: 'LoUrbanLoLinearFz',
name: 'LoUrbanLoLinearFz',
data:  {'raw_operation': 'WTDUNION', 'raw_arguments': ['40', '60'], 'operation': 'Weighted Union'} ,
children: [
{
id: 'LoLinDensFz',
name: 'LoLinDensFz',
data:  {'raw_operation': 'CVTTOFUZZY', 'raw_arguments': ['2.5', '0'], 'operation': 'Convert to Fuzzy'} ,
children: [
{
id: 'LinDevSum',
name: 'LinDevSum',
data:  {'raw_operation': 'SUM', 'operation': 'Sum'} ,
children: [
{
id: 'Pipelines_Density',
name: 'Pipelines_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
{
id: 'Utility_Line_Density',
name: 'Utility_Line_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
{
id: 'GTLF_Density',
name: 'GTLF_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
]},
]},
{
id: 'LoUrbanDevFz',
name: 'LoUrbanDevFz',
data:  {'raw_operation': 'CVTTOFUZZY', 'raw_arguments': ['20', '0'], 'operation': 'Convert to Fuzzy'} ,
children: [
{
id: 'Urban_Development_Density',
name: 'Urban_Development_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
]},
]},
{
id: 'LoEnergyDevFz',
name: 'LoEnergyDevFz',
data:  {'raw_operation': 'ORNEG', 'operation': 'Negative Or'} ,
children: [
{
id: 'LoPowerPlantDensityFz',
name: 'LoPowerPlantDensityFz',
data:  {'raw_operation': 'CVTTOFUZZY', 'raw_arguments': ['10', '0'], 'operation': 'Convert to Fuzzy'} ,
children: [
{
id: 'Power_Plants_Density',
name: 'Power_Plants_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
]},
{
id: 'LoMinPtDens',
name: 'LoMinPtDens',
data:  {'raw_operation': 'CVTTOFUZZY', 'raw_arguments': ['10', '0'], 'operation': 'Convert to Fuzzy'} ,
children: [
{
id: 'MinPtsSum',
name: 'MinPtsSum',
data:  {'raw_operation': 'SUM', 'operation': 'Sum'} ,
children: [
{
id: 'Wind_Turbines_Density',
name: 'Wind_Turbines_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
{
id: 'Oil_and_Gas_Wells_Density',
name: 'Oil_and_Gas_Wells_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
{
id: 'Mines_Density',
name: 'Mines_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
{
id: 'Geothermal_Wells_Density',
name: 'Geothermal_Wells_Density',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
]},
]},
]},
]},
{
id: 'LoFragmentationFz',
name: 'Low Fragmentation' + "<div class='EEMS_Tree_Value'>" + resultsJSON['eetmins2t2_avg'] + "</div>",
data:  {'raw_operation': 'ORNEG', 'operation': 'Negative Or'} ,
children: [
{
id: 'HiCoreIntegrityFz',
name: 'HiCoreIntegrityFz',
data:  {'raw_operation': 'ORNEG', 'operation': 'Negative Or'} ,
children: [
{
id: 'HiCoreAreaFz',
name: 'HiCoreAreaFz',
data:  {'raw_operation': 'CVTTOFUZZY', 'raw_arguments': ['20', '9999'], 'operation': 'Convert to Fuzzy'} ,
children: [
{
id: 'DRECP_AT_C_FragCorePct_AV_1KM_poly_MEAN',
name: 'DRECP_AT_C_FragCorePct_AV_1KM_poly_MEAN',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
]},
{
id: 'LoNearestNeighborFz',
name: 'LoNearestNeighborFz',
data:  {'raw_operation': 'CVTTOFUZZY', 'raw_arguments': ['180', '59'], 'operation': 'Convert to Fuzzy'} ,
children: [
{
id: 'DRECP_AT_C_FragNN_AV_1KM_poly_MEAN',
name: 'DRECP_AT_C_FragNN_AV_1KM_poly_MEAN',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
]},
]},
{
id: 'LoNaturalPatchesFz',
name: 'LoNaturalPatchesFz',
data:  {'raw_operation': 'CVTTOFUZZY', 'raw_arguments': ['68.805', '1'], 'operation': 'Convert to Fuzzy'} ,
children: [
{
id: 'DRECP_AT_C_FragNP_AV_1KM_poly_MEAN',
name: 'DRECP_AT_C_FragNP_AV_1KM_poly_MEAN',
data:  {'operation': 'Read', 'raw_operation': 'READ'} ,
},
]},
]},
]}
        //alert(json)
    }
    else if (modelForTree=='hisensfz') {

        json = {
            id: "node1",
            name: "Hi Sensitivity:<br>" + resultsJSON['eetmins1t1_avg'],
            //: {"$color":'red'},
            children: [
                {
                    id: "node11",
                    name: "Not Barren<br>" + resultsJSON['eetmins2t1_avg'],
                    //: {"$color":'#00C600'},
                    children: [
                        {
                            id: "node111",
                            name: "Not Barren<br>" + resultsJSON['eetmins2t1_avg'],
                            //: {"$color":'#00C600'},
                        },
                        {
                            id: "node112",
                            name: "Not Barren<br>" + resultsJSON['eetmins2t1_avg'],
                            //: {"$color":'#00C600'},
                        },
                    ]
                },
                {
                    id: "node12",
                    name: "Hi Potential Site Sensitivity<br>" + resultsJSON['eetmins2t1_avg'],
                    //: {"$color":'#00C600'},
                },
                {
                    id: "node13",
                    name: "Hi Potential Site Sensitivity<br>" + resultsJSON['eetmins2t1_avg'],
                    //: {"$color":'#00C600'},
                }
            ]
        }
    }
    else {
        //load the appropriate json files on window.load (in general_js)
        //json must be well-formed (e.g., keys must be quoted), otherwise no-worky.
        //getting the JSON file through Ajax creates an infinate loop because these functions are called in general_json on AJAX complete:
            //defineJSONtree()
            //st.loadJSON(json)
            //st.refresh()
        json=ecological_values_json
    }
}

function init(){
   JitInitializationComplete=true
    //init data
   //defineJSONtree()
    //end
    //init Spacetree
    //Create a new ST instance
    st = new $jit.ST({
        //id of viz container element
        injectInto: 'infovis',
        orientation:"top",
        offsetY:350,
        //set duration for the animation
        duration: 800,
        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
        levelDistance: 50,
        //enable panning
        Navigation: {
          enable:true,
          panning:true
        },
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: {
            height: 70,
            width: 130,
            type: 'rectangle',
            color: '#aaa',
            overridable: true,
            //align:'center',
            alpha:1

        },
        
        Edge: {
            type: 'bezier',
            overridable: true
        },
        
        onBeforeCompute: function(node){
            Log.write("Loading " + node.name.replace('<br>',' ').replace('<br>',' '));
        },
        
        onAfterCompute: function(){
            Log.write("Click any node to view inputs");
        },
                onPlaceLabel: function(label, node, controllers){
            //override label styles
            var style = label.style;

            if (node.selected) {
              //style.color = '';
              //style.fontWeight= 'bold';
            }
            else {
              //style.fontWeight= 'normal';
              //style.color = '#fff';
            }
            // show the label and let the canvas clip it
            //This is what prevents the text from disappearing when a node goes off the canvas
            style.display = '';
        },
        
        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function(label, node){
            label.id = node.id;            
            label.innerHTML = node.name +"<br>"+"<div class='EEMS_Tree_Operation'> (" + node.data.operation + ")</div>";
            label.onclick = function(){
            	if(normal.checked) {
            	  st.onClick(node.id);
                      //swapImageOverlay('intactness','EEMSmodel')
                      //swapLegend(intactness, intactness, 'EEMSmodel')
            	} else {
                st.setRoot(node.id, 'animate');
            	}
            };
            //set label styles
            //Width + Padding should equal the node width to prevent formatting issues.
            var style = label.style;
            style.width = 124 + 'px';
            style.height = 65 + 'px';
            style.cursor = 'pointer';
            style.color = '#444444';
            style.fontWeight = 'bold';
            style.fontSize = '0.88em';
            style.textAlign= 'center';
            style.paddingTop = '5px';
            style.paddingLeft= '3px';
            style.paddingRight= '3px';
            style.overflow= 'hidden';
            style.boxShadow= '0px 0px 15px rgba(0, 0, 0, 0.2)';
        },
        
        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
        onBeforePlotNode: function(node){
            //add some color to the nodes in the path between the
            //root node and the selected node.
            if (node.selected) {
                node.data.$color = "#A6C8A6";
            }
            else {
                delete node.data.$color;
                //if the node belongs to the last plotted level
                if(!node.anySubnode("exist")) {
                    //count children number
                    var count = 0;
                    node.eachSubnode(function(n) { count++; });
                    //assign a node color based on
                    //how many children it has
                    node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
                    /*
                    if (count == 0){
                        node.data.$color = '#aaa';
                    }
                    else{
                        node.data.$color = '#baa';
                    }
                    */
                }
            }
        },
        
        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
        onBeforePlotLine: function(adj){
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                adj.data.$color = "#eed";
                adj.data.$lineWidth = 3;
            }
            else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }
    });
    //load json data
    st.loadJSON(json);
    //compute node positions and layout
    st.compute();
    //optional: make a translation of the tree
    st.geom.translate(new $jit.Complex(-200, 0), "current");
    //emulate a click on the root node.
    st.onClick(st.root);
    //end
    //Add event handlers to switch spacetree orientation.
    var top = $jit.id('r-top'), 
        left = $jit.id('r-left'), 
        bottom = $jit.id('r-bottom'), 
        right = $jit.id('r-right'),
        normal = $jit.id('s-normal');
        
    
    function changeHandler() {
        if(this.checked) {
            top.disabled = bottom.disabled = right.disabled = left.disabled = true;
            st.switchPosition(this.value, "animate", {
                onComplete: function(){
                    top.disabled = bottom.disabled = right.disabled = left.disabled = false;
                }
            });
        }
    };
    
    //top.onchange = left.onchange = bottom.onchange = right.onchange = changeHandler;
    //end

}


