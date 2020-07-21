// var queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";


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
    case magnitude > 1:
        return "#d4ee00";
    default:
        return "#98ee00";
    }
} // END of getColor


// Perform a Get request to the query URL

d3.json(queryUrl, function(data) {
    console.log("All features",data.features);
    console.log("One feature",data.features[0]);
    // Read the features function
    createFeatures(data.features);
});

function createFeatures(ed) {
    // funtction for style info
    function styleInfo(feature) {
        return{
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: getColor(feature.properties.mag),
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5    
        };
    } // END of styleInfo


    //set radius from magnitude
    function getRadius(magnitude) {
        if(magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    } // END of getRadius

    // GeoJSON layer
    let earthquake = L.geoJson(ed, {
        // Make circles
        pointToLayer: function(feature,latlng) {
            return L.circleMarker(latlng);
        },
        // Circle style
        style: styleInfo,
        // popup for each marker
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}</h3> <hr> <h3> Location: ${feature.properties.place}</h3>`);
        },
    }); // END of GeoJSON
    // Send the earthquake layer to the createMap function
    createMap(earthquake);
} // END od createFeatures function

function createMap(earthquake) {
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

    var plates = new L.LayerGroup();

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };
      
    var overlayMaps = {
        Earthquakes: earthquake,
        FaultLines: plates
    };

    // Create a new map
    var myMap = L.map("map", {
        center: [
            37.7749, -122.4194
        ],
        zoom: 5,
        layers: [satellite, earthquake, plates]
    });

    // Create a layer control containing our baseMaps
    // Be sure to add an overlay Layer containing the earthquake GeoJSON
    L.control.layers(baseMaps, overlayMaps, { 
        collapsed: false
    }).addTo(myMap);

    // Retrieve tectonic plates data
    var platesUrl= "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

    // Create the faultlines and add them to plates layer
    d3.json(platesUrl, function(data) {
        L.geoJson(data, {
            style: function() {
                return {
                    color: "orange", 
                    fillOpacity: 0}
            }
        }).addTo(plates)
    })
    //create the legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
    
        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [0, 1, 2, 3, 4, 5];
    
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' + 
        + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
        }
    
        return div;
    };
    
    legend.addTo(myMap);
}