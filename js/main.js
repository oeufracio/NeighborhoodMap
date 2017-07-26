var map;
var bounds;

function initMap() {
    map = new google.maps.Map($("#map")[0], {center: {lat: 0, lng: 0}, zoom: 2});

    bounds = new google.maps.LatLngBounds();
}


// This is required by w3.css
$('#my-content-open').on('click',function () {
    $('#my-sidebar').css({"display":"block"});
});

$('#my-sidebar-close').on('click',function () {
    $('#my-sidebar').css({"display":"none"});
});