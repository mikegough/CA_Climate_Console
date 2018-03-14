function load_story_map(url){
    $(".dropdown").addClass("active");
    $("#story_maps").html('<iframe width="100%" height="100%" src="' + url + '" frameborder="0" scrolling="yes"></iframe>')
}

$( document ).ready(function() {

    // On the first click of the side tab arrow, slide the panel to the left.
    $("#side_tab").one("click", slideLeft);

    // Navigation menu functions.
    $("li a").click(function() {

        // Remove active class from other tabs.
        $("#nav a").removeClass('active');

        // Add active class to the current tab.
        $(this).addClass('active');

        // Hide other divs
         $('.navdiv').each(function(){
            $(this).hide();
         });

        // Show the clicked div
       var div_to_show =  $(this).attr('show');
       $("#" + div_to_show ).show();

    });

});

function deactivate_dropdown(){
    $(".dropdown").removeClass("active");
}

$(window).load(function(){

    //stratum_layer_from_topo_json.addTo(map).bringToFront();

});

var speed = 500;
var side_panel_status = "visible";

function slideLeft() {
    $('#intro').animate({'left': '-400px'}, 500);
    $("#side_tab").animate({"left": "0px"}, speed);
    $("#map").animate({"left": "0px"}, speed);
    $("#about").animate({"left": "0px"}, speed);
    $("#side_tab_arrow").addClass("rotate_neg_90");
    $("#side_tab_arrow").removeClass("rotate_90");
    $(this).one("click", slideRight);
    side_panel_status = "hidden"
}
function slideRight() {
    $('#intro').animate({'left': '0px'}, speed)
    $("#side_tab").animate({"left": "400px"}, speed);
    $("#map").animate({"left": "400px"}, speed);
    $("#side_tab_arrow").addClass("rotate_90");
    $("#side_tab_arrow").removeClass("rotate_neg_90");
    $(this).one("click", slideLeft);
    side_panel_status = "visible"
}

// Collapse div on header click
$(document).on("click", ".header", function () {

        // Get this collapsible div
        var this_collapsible_div = $(this).siblings(".collapsible_div");

        /*
        // If a library has been loaded, collapse other divs on header click.
        if (typeof library_selected != "undefined" && library_selected == true){
            collapseOtherDivs(this)
        }
        */

        // Toggle the border radius
        $(this).toggleClass("full_border_radius");
        var this_collapse_icon =$(this).children(".collapse_icon");

        // Toggle the collapse icon
        toggleIcon(this_collapse_icon);

        // Slide toggle this div.
        this_collapsible_div.slideToggle(400, function () {
        });

        // Scroll to the bottom of the results div.
        $("#results").animate({ scrollTop: $("#results")[0].scrollHeight }, 1000);


});

function toggleIcon(collapse_icon){

    // Rotate the arrow icon.
    if (collapse_icon.hasClass("rotate90")){
        $(collapse_icon).removeClass("rotate90");
    }
    else {
        $(collapse_icon).addClass("rotate90");
    }
}


