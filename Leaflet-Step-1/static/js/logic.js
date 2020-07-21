
var myMap = L.map('map', {
  center: [37.7749, -122.4194],
  zoom: 5
});

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/light-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
}).addTo(myMap);


// Store our API endpoint
// var queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
  
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  console.log("All features",data.features);
  // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map
  console.log("One feature",data.features[0]);
  function styleInfo(feature) {
    return{
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }
  // set different color from magnitude
    function getColor(magnitude) {
      switch (true) {
      case magnitude > 5:
        return "#ea2c2c";
      case magnitude > 4:
        return "#ea822c";
      case magnitude > 3:
        return "#ee9c00";
      case magnitude > 2:
        return "#eecc00";
      case magnitude > 1:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }
  // set radius from magnitude
    function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }
    // GeoJSON layer
    L.geoJson(data, {
      // Make circles
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
      },
      // circle style
      style: styleInfo,
      // popup for each marker
      onEachFeature: function(feature, layer) {
        layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}</h3> <hr> <h3> Location: ${feature.properties.place}</h3>`);
      }
    }).addTo(myMap);
    
    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
   
      var mags = [0, 1, 2, 3, 4, 5];
      var colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
      ];
  
      // Looping
      for (var i = 0; i < mags.length; i++) {
        div.innerHTML +=
          "<i style='background: " + colors[i] + "'></i> " +
          mags[i] + (mags[i + 1] ? "&ndash;" + mags[i + 1] + "<br>" : "+");
      }
      return div;
    };
  
    // Adding legend to the map
    legend.addTo(myMap);
  });
