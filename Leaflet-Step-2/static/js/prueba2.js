// var queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    console.log("All features",data.features);
    // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map
    console.log("One feature",data.features[0]);
    //createMap(earthquake)
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // popup for each marker
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}</h3> <hr> <h3> Location: ${feature.properties.place}</h3>`);
    }

    // get radius from magnitude
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }

    // set different color for magnitude
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
        case magnitude >1:
            return "#d4ee00";
        default:
            return "#98ee00";
        }
    }
    
    // GeoJSON layer
    var earthquakes = L.geoJSON(earthquakeData, {
        // Make circles
        pointToLayer: function(earthquakeData, latlng) {
            return L.circleMarker(latlng, {
                opacity: 1,
                fillOpacity: 1,
                fillColor: getColor(earthquakeData.properties.mag),
                color: "#000000",
                radius: getRadius(earthquakeData.properties.mag),
                stroke: true,
                weight: 0.5
            });
        },
        onEachFeature: onEachFeature
    });

    createMap(earthquakes);
}



function createMap(earthquakes) {
    // Define streetmap, grayscale and outdoors layers
    var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/satellite-v9',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY
    });
    
    var grayscale= L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/light-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY
    });
    
    var outdoors= L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/outdoors-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY
    });

    // Create plates layer
    var plates = L.layergroup();

    
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };
      
    var overlayMaps = {
        Earthquakes: earthquakes,
        "Fault Lines": plates
    };
      
    // Create a new map
    var myMap = L.map("map", {
        center: [
            37.7749, -122.4194
        ],
        zoom: 5,
        layers: [satellite, earthquakes, plates]
    });
      
    // Create a layer control containing our baseMaps
    // Be sure to add an overlay Layer containing the earthquake GeoJSON
    L.control.layers(baseMaps, overlayMaps, { 
        collapsed: false
    }).addTo(myMap);

    // Retrieve tectonic plates data
    var tectonicplates = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json";

    // Create the fault lines and add the to the plates layer
    d3.json(tectonicplates, function(data) {
        L.geoJSON(data, {
            style: function() {
                return {color: "orange", fillOpacity: 0}
            }
        }).addTo(plates)
    })
    
}



