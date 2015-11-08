/* Model Data */
var locations = [
  {
    name: "Antonios Pizzeria & Restaurant",
    latlong: {lat: 40.3224001, lng: -74.470454300},
    marker: null,
    address: "337 Applegarth Rd",
    city: "Monroe Township",
    state: "NJ",
    zip: "08831"
  },
  {
    name: "TomatoPies Italian Kitchen",
    latlong: {lat:40.3152725, lng:-74.4739551},
    marker: null,
    address: "4 Research Way",
    city: "Monroe Township",
    state: "NJ",
    zip: "08831"
  },
  {
    name: "Dunkin Donuts",
    latlong: {lat:40.3171458, lng:-74.47251489},
    marker: null,
    address: "316 Applegarth Rd",
    city: "Monroe Township",
    state: "NJ",
    zip: "08831"
  },
  {
    name: "La Villa Italian Restaurant",
    latlong: {lat:40.3249303, lng:-74.46989669},
    marker: null,
    address: "355 Applegarth Rd",
    city: "Monroe Township",
    state: "NJ",
    zip: "08831"
  },
  {
    name: "Tap Room Cafe",
    latlong: {lat:40.323056, lng:-74.444947},
    marker: null,
    address: "100 Whittingham Dr",
    city: "Monroe Township",
    state: "NJ",
    zip: "08831"
  },
  {
    name: "D & T Pizza Restaurant",
    latlong: {lat:40.3156954, lng:-74.4393888},
    marker: null,
    address: "1600 Perrineville Rd",
    city: "Monroe Township",
    state: "NJ",
    zip: "08831"
  },
  {
    name: "Spiro & Angies",
    latlong: {lat:40.3043821, lng:-74.45595659},
    marker: null,
    address: "100 Overlook Dr",
    city: "Monroe Township",
    state: "NJ",
    zip: "08831"
  },
  {
    name: "United Restaurant",
    latlong: {lat:40.3242392, lng:-74.419537499},
    marker: null,
    address: "10 Mimi Dr",
    city: "Monroe Township",
    state: "NJ",
    zip: "08831"
  }
];
var map;
var bounds;
var infoWindow;
/* ViewModel */
var ViewModel = function(){
  var self = this;
  self.search = ko.observable("");
  self.places = ko.observableArray(locations);

  // list and marker change when you type in search bar
  self.displayList = ko.computed(function () {
    return ko.utils.arrayFilter(self.places(), function (item) {
      var showItem = item.name.toLowerCase().indexOf(self.search().toLowerCase()) >= 0;
      if (item.marker) {
        if (showItem) {
          item.marker.setMap(map);
        }
        else {
          item.marker.setMap(null);
        }
      }
      return showItem; // Display on View
    });
  });

  self.animateMarker = function (item) {
    item.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
      item.marker.setAnimation(null);
    }, 1400);
    getYelpInfo(item, map);
      var newLatLng = new google.maps.LatLng(item.marker.position.lat(),
      item.marker.position.lng());
      map.setCenter(newLatLng);
  };



}; //End of ViewModel

/* Yelp Review function
Source: http://forums.asp.net/t/1801674.aspx?how+to+create+API+URL+using+some+
credentials
*/
function getYelpInfo(item, map) {
  var auth = {
    consumerKey: "jA4QtI5CFiMe-URUqSSqaw",
    consumerSecret: "QGqpqO3SYczU0AaXJfXpPQTc3sM",
    accessToken: "iXa45v5K5tSoQ7XGiLrfaaUubfD8OIxu",
    /*
    This example is a proof of concept,
    for how to use the Yelp v2 API with javascript.
    You wouldn't actually want to expose your access token secret like this
    in a real application.
    */
    accessTokenSecret: "VIVWpbxbzo6I0nhya8KTd9EPdL0",
    serviceProvider: {
      signatureMethod: "HMAC-SHA1"
    }
  };
  var terms = item.name;
  var near = item.city;
  var accessor = {
    consumerSecret: auth.consumerSecret,
    tokenSecret: auth.accessTokenSecret
  };
  parameters = [];
  parameters.push(['term', terms]);
  parameters.push(['location', near]);
  parameters.push(['callback', 'cb']);
  parameters.push(['oauth_consumer_key', auth.consumerKey]);
  parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
  parameters.push(['oauth_token', auth.accessToken]);
  parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
  var message = {
    'action': 'http://api.yelp.com/v2/search',
    'method': 'GET',
    'parameters': parameters
  };
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var parameterMap = OAuth.getParameterMap(message.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
  var output = '<div id="content">' +
                    '<div class="mhinfo">' + item.name + '</div>';

  $.ajax({
    'url': message.action,
    'data': parameterMap,
    'cache': true,
    'async': true,
    'dataType': 'jsonp',
    'callback': 'cb',
    'success': function(data) {
      if(data.businesses.length > 0){
        output = output +
                    '<div class="minfo"> Rating: <img src="' +
                    data.businesses[0].rating_img_url + '"</div>' +
                    '<br><div class="minfo"> Address: ' +
                    data.businesses[0].location.display_address + '</div>' +
                    '</div>';
      }
      else{
        output = output + 'No Yelp rating found';
      }
      infoWindow.setContent(output);
      infoWindow.open(map, item.marker);
    },
    'error': function (jqXHR, textStatus, errorThrown) {
      console.log("Error");
      console.log(errorThrown);
      if(textStatus ==="timeout") {
        output = output + 'Error!! Connection timed out!!!!!!';
      }
      else {
        output = output + 'Error!! Connecting Yelp. No information received...';
      }
      infoWindow.setContent(output);
      infoWindow.open(map, item.marker);
    }
  });

} //End of getYelpinfo

function initMap() {
  map = new google.maps.Map(document.getElementById('map-canvas'),
    {center: {lat: 40.318529, lng: -74.437595},
    zoom: 14});
  bounds = new google.maps.LatLngBounds();

  for(var i = 0; i < locations.length; i++){
    var myLatLng = new google.maps.LatLng(locations[i].latlong.lat,
      locations[i].latlong.lng);
    var marker = new google.maps.Marker({
      map: map,
      position: myLatLng,
      title: locations[i].name,
      animation: google.maps.Animation.DROP,
      icon: "images/restaurant.png",
      content: "..."
    });
    locations[i].marker = marker;
//    marker.setMap(map);
    bounds.extend(myLatLng);
  }

  map.fitBounds(bounds);

  // create pop-up Window for each marker on the map
  infoWindow = new google.maps.InfoWindow({
    content: "..."
  });

  //Adds onClick listener for each marker.
  locations.forEach(function (item) {
    google.maps.event.addListener(item.marker, 'click', function () {
      //bounces the marker when clicked on.
      item.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function () {
        item.marker.setAnimation(null);
      }, 1400);
      // Display pop-up window with place name and address
      getYelpInfo(item, map);
      var newLatLng = new google.maps.LatLng(item.marker.position.lat(),
      item.marker.position.lng());
      map.setCenter(newLatLng);
      infoWindow.open(map, item.marker);
    });
  });
  self.animateMarker = function (item) {
    item.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
      item.marker.setAnimation(null);
    }, 1400);
    getYelpInfo(item, map);
  };

} //End of initMap function


ko.applyBindings(new ViewModel());

/*Yelp API v2.0
Consumer Key  jA4QtI5CFiMe-URUqSSqaw
Consumer Secret QGqpqO3SYczU0AaXJfXpPQTc3sM
Token iXa45v5K5tSoQ7XGiLrfaaUubfD8OIxu
Token Secret  VIVWpbxbzo6I0nhya8KTd9EPdL0
*/