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
            Log.write("Loading " + node.name.replace('<br>',' ').replace('<br>',' ') +"...");
        },
        
        onAfterCompute: function(){
            Log.write("Click any node to view inputs");
            //$(".EEMS_Tree_Value").remove()
            //$("#" + top_node).append("<div class='EEMS_Tree_Value'>"  + resultsJSON['c5tmids1t1_avg'] + "</div>")
            if (typeof resultsJSON[modelForTree+"_avg"] != 'undefined') {
                $(".EEMS_Tree_Value").remove()
                $("#" + top_node).append("<div class='EEMS_Tree_Value'>" + resultsJSON[modelForTree+"_avg"] + "</div>")
            }
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
            if (typeof(node.data.short_desc) != 'undefined') {
                label.innerHTML = node.name + "<br>" + "<div class='EEMS_Tree_Operation' title='" + node.data.short_desc + "'> (" + node.data.operation + ")</div>";
            } else {
                label.innerHTML = node.name +"<br>"+"<div class='EEMS_Tree_Operation' title='This is the operation used to create this node'> (" + node.data.operation + ")</div>";
            }
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
            style.textAlign = 'center';
            style.paddingTop = '5px';
            style.paddingLeft = '3px';
            style.paddingRight = '3px';
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


