// variable to mange the google map
let map;
let bounds;
let urlIconBlue = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
let urlIconRed = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';


// hard-coded location
let data = ['california usa',
    'baja california mexico',
    'new york usa',
    'guanajuato mexico',
    'puebla mexico',
    'chihuahua mexico'
];

let viewModel = {

    //data
    locations: ko.observableArray([]),
    locationToAdd: ko.observable( "" ),

    //behavior
    init: function(){
        // add each hard-coded location
        for(let i=0; i< data.length; i++){
            this.locationToAdd(data[i].toLowerCase());
            this.addLocation();
        }
    },
    addLocation: function() {
        // verify new location string not empty
        if( this.locationToAdd() === '' ) {
            window.alert('You must enter an address');
        } else {

            let self = this;

            // new address to be added
            let address = this.locationToAdd();

            let geocoder = new google.maps.Geocoder();

            geocoder.geocode( {address: address}, function(result, status) {

                    if(status !== google.maps.GeocoderStatus.OK) {
                        window.alert('We couldnt find that location');
                    } else {

                        // lat-lng of the new address
                        let position = result[0].geometry.location;

                        // build  newLocation object to push to observableArray
                        let newLocation = {
                            name: address,
                            position: position,
                            marker: new google.maps.Marker({position: position, title: address, map: map, icon: urlIconBlue, animation: google.maps.Animation.DROP}),
                            infowindow: new google.maps.InfoWindow(),
                            data: {wiki: null, foursquare: null, streetview: null},
                            isVisible: ko.observable(true)
                        };

                        // Add this newLocation to location and update map
                        self.locations.push( newLocation );

                        self.locationToAdd("");

                        bounds.extend(position);
                        map.setCenter(position);
                        map.fitBounds(bounds);


                        // Set click event for the marker
                        newLocation.marker.addListener('click', function() {

                            // not the best way ... set all icon marker to blue and close its infowindow
                            for(let i=0; i< self.locations().length; i++) {
                                self.locations()[i].marker.setIcon(urlIconBlue);
                                self.locations()[i].infowindow.close();
                            }

                            // the selected marker, change icon marker to red and open its infowindow
                            newLocation.marker.setIcon(urlIconRed);
                            newLocation.infowindow.setContent( viewModel._getContent( newLocation) );
                            newLocation.infowindow.open(map, newLocation.marker);
                        });

                        // get information using ajax for this new location
                        self._fillInfoWindow( newLocation );

                    } //end else OK
            }); //end callback
        } //end else geocoder
    },

    //helpers
    _getContent: function( location ) {
        let infoContent = `<h1>${location.name}</h1>`;

        infoContent += (location.data.streetview===null) ? '<p>Loading streetview...</p>' : location.data.streetview;

        infoContent += (location.data.wiki===null) ? '<p>Loading wiki...</p>' : location.data.wiki;

        infoContent += (location.data.foursquare===null) ? '<p>Loading foursquare...</p>' : location.data.foursquare;

        return infoContent;

    },
    _fillInfoWindow: function( location ) {

        // ---------Set StreetView Image.---------- //
        let src = `https://maps.googleapis.com/maps/api/streetview?size=200x100&location=${location.name}&key=AIzaSyCHHKS6PAaL6JZ5b9GDZ0CLtl_dhKl-Jwk`;
        location.data.streetview = `<img src="${src}">`;


        // ---------Set Wikipedia First Article.---------- //
        let urlWiki = 'https://en.wikipedia.org/w/api.php';
        urlWiki += '?' +  $.param({
            'action': "opensearch",
            'search': location.name,
            'format': "json",
            'calback': "wikiCallback"
        });

        $.ajax(urlWiki, {
            dataType: "jsonp",
            success: function(data) {

                if (data[1].length > 0)
                    location.data.wiki = `<p>Wiki: <a target="_blank" href="$\{data[3][0]}">${data[1][0]}</a></p>`;
                else
                    location.data.wiki = `<p>Wiki: ${data[0]}</p>`;
            },
            error: function() {
                location.data.wiki = `<p>Wiki: NO MATCH FOUND</p>`;
            }
        });


        // --------- Set Foursaqure First Venue ---------- //
        let urlFourSquare = "https://api.foursquare.com/v2/venues/search";
        urlFourSquare += '?' + $.param({
            'v': '20161016',
            'll': `${location.position.lat()},${location.position.lng()}`,
            'limit': 3,
            'client_id': 'QESUPNU5A0PLGKEX3OQLSJCGGM0TYCMTBML1MF0UC4URJ2MB',
            'client_secret':'UHQPW20T1V0MKI5BJTZCW3YZI1XFFK1IJYK1O05Z40OHHJBZ',
            'query': 'restaurant'
        });

        $.ajax(urlFourSquare, {
            dataType: "json",
            success: function(data) {

                if (data.response.venues[0].url === undefined) {
                    location.data.foursquare = `<p>Foursquare: ${data.response.venues[0].name}</p>`;
                } else {
                    location.data.foursquare = `<p>Foursquare: <a target="_blank" href="${data.response.venues[0].url}">${data.response.venues[0].name}</a></p>`;
                }
            },
            error: function() {
                location.data.foursquare = `<p>Foursquare: NO MATCH FOUND</p>`;
            }
        });

    }

}; // end viewModel



function initMap() {
    //load the map
    map = new google.maps.Map($("#map")[0], {center: {lat: 0, lng: 0}, zoom: 2});

    //create the bounds array to keep track of the window
    bounds = new google.maps.LatLngBounds();

    viewModel.init();
}


// This is required by w3.css
$('#my-content-open').on('click',function () {
    $('#my-sidebar').css({"display":"block"});
});

$('#my-sidebar-close').on('click',function () {
    $('#my-sidebar').css({"display":"none"});
});

//add hard-coded location to the map