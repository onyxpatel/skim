let map;
let surfSpots = [{
        title: 'Cocoa Beach',
        location: {
            lat: 28.3200,
            lng: -80.6076
        },
        id: "350"
    },
    {
        title: 'Daytona',
        location: {
            lat: 29.2108,
            lng: -81.0228
        },
        id: "670"
    },
    {
        title: 'Saint Pete Beach',
        location: {
            lat: 27.7428,
            lng: -82.7505
        },
        id: "1216"
    },
    {
        title: 'Indian Rocks',
        location: {
            lat: 27.8960,
            lng: -82.8466
        },
        id: "1212"
    },
    {
        title: 'Lido Beach',
        location: {
            lat: 27.3121,
            lng: -82.5761
        },
        id: "4620"
    },
    {
        title: 'Venice Beach',
        location: {
            lat: 27.1001,
            lng: -82.4576
        },
        id: "58"
    },
    {
        title: 'Sebastian Inlet',
        location: {
            lat: 27.8603,
            lng: -80.4473
        },
        id: "352"
    },
    {
        title: 'Del Ray Beach',
        location: {
            lat: 26.4615,
            lng: -80.0728
        },
        id: "4199"
    },
    {
        title: 'Melbourne Beach',
        location: {
            lat: 28.0683,
            lng: -80.5603
        },
        id: "351"
    },
    {
        title: 'Vero Beach',
        location: {
            lat: 27.6386,
            lng: -80.3973
        },
        id: "727"
    }
]
let mSWurl = 'http://magicseaweed.com/api/c601eb5d859031e96bd33e9f0ea25b26/forecast/?spot_id=';

function initMap() {
    //Constructor creates a new map - only center and zoom are required
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 27.6648,
            lng: -81.5158
        },
        zoom: 7,
        styles: [{
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#fffec4"
                }]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [{
                    "visibility": "on"
                }]
            },
            {
                "featureType": "landscape.natural.terrain",
                "elementType": "geometry.fill",
                "stylers": [{
                        "color": "#65a75e"
                    },
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#a75808"
                }]
            },

            {
                "featureType": "road.local",
                "elementType": "labels",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#247212"
                }]
            },
            {
                "featureType": "transit",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#32e8ff"
                }]
            },
            {
                "featureType": "water",
                "elementType": "labels.text",
                "stylers": [{
                    "color": "#a305ff"
                }]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "color": "#fcff00"
                }]
            }
        ],
        mapTypeControl: false
    });
    ko.applyBindings(new ViewModel())
}

let surfSpot = function(data) {
    self = this;

    this.name = data.title;
    this.spotID = data.id;
    this.url = mSWurl + this.spotID;
    this.swellHeight = null;
    this.swellDirection = null;
    this.swellPeriod = null;
    // TO DO: Add Images
    // this.imgSrc = ko.observableArray(data.imgSrc)
    // this.nickName = ko.observableArray(data.nickName)
    this.position = data.location;
    this.display = ko.observable(true);
    // Style the markers a bit. This will be our listing marker icon.
    let defaultIcon = makeMarkerIcon('80ff00');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    let highlightedIcon = makeMarkerIcon('e80000');
    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.name,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
    });

    magicSeaweedAjax(self.url, this)();

    let largeInfowindow = new google.maps.InfoWindow();

    this.marker.addListener('click', (function(markerCopy) {
        return function() {
            populateInfoWindow(this, largeInfowindow, markerCopy);
            animateMarker(this, markerCopy)
        }
    })(self));
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.

    this.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });

    this.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });
    // display marker once its made
    this.marker.setMap(map)
}

let ViewModel = function() {
    let self = this;

    this.showSpots = ko.observable('Show Spots!  | ');
    this.hideSpots = ko.observable('Hide Spots!');
    this.filter = ko.observable('');

    this.spotList = ko.observableArray([]);

    surfSpots.forEach(function(spot) {
        self.spotList.push(new surfSpot(spot));
    })

    this.showSpot = function(clickedSpot) {
        clickedSpot.marker.setMap(map);
        map.setZoom(14);
        map.panTo(clickedSpot.position);
        clickedSpot.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            clickedSpot.marker.setAnimation(null);
        }, 1500);
    }
    // This function will loop through the markers array and display them all.
    this.showListings = function() {
        let bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        self.spotList().forEach(function(spot) {
            spot.marker.setMap(map);
            bounds.extend(spot.position);
        })
        map.fitBounds(bounds);
    }
    // This function will loop through the listings and hide them all.
    this.hideListings = function() {
        self.spotList().forEach(function(spot) {
            spot.marker.setMap(null);
        })
    }

    this.filteredItems = ko.computed(function() {
        let filter2 = self.filter().toLowerCase();

        if (!filter2) {
            return self.spotList();
        } else {
            return ko.utils.arrayFilter(self.spotList(), function(spot) {
                if (spot.name.toLowerCase().indexOf(filter2) >= 0) {
                    spot.marker.setMap(map)
                    return true;
                } else {
                    spot.marker.setMap(null)
                    return false;
                }
            })
        }
    })
}
// populates info window whem marker is clicked.
function populateInfoWindow(marker, infowindow, self) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + self.name + '</div>' +
            '<div> Wave height: ' + self.swellHeight + '</div>' +
            '<div> Swell Angle: ' + self.swellDirection + '</div>' +
            '<div> Swell Period: ' + self.swellPeriod + '</div>' +
            '<div> Swell data provided by magicseaweed.com   </div>');
        infowindow.open(map, marker);
        // clear marker property if info window closed
        infowindow.addListener('closeclick', function() {
            infowindow.setMarker = null;
        });
    }
    infowindow.open(map, marker);
}
// Marker bounces twice when clicked on
function animateMarker(marker, self) {
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        self.marker.setAnimation(null);
    }, 1500);
}
// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    let markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

function magicSeaweedAjax(urlcopy, spotCopy) {
    return function() {
        let f = spotCopy;
        $.ajax({
            url: urlcopy,
            dataType: 'jsonp',
            success: function(data) {
                f.swellHeight = data[0].swell.components.primary.height
                f.swellDirection = data[0].swell.components.primary.direction
                f.swellPeriod = data[0].swell.components.primary.period
            }
        }).fail(function() {
            alert('Magic SeaWeed API cold not be loaded')
        });
    }
}

function googleError() {
    alert("Google was unable to load the Google Maps API. Try reloading the page.")
}
