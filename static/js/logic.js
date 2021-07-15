var map = L.map("map", {
    center: [40.73, -74.0059],
    zoom: 5,
  });
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
    }).addTo(map);
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"
function color_matcher(depth,depth_array){
    var color_scale = chroma.scale(['yellow','red']);
    var depth_scale = d3.scaleLinear()
        .domain([d3.min(depth_array),d3.max(depth_array)])
        .range([0,1]);
    scaled_depth = depth_scale(depth)
    rgb_values = color_scale(scaled_depth).rgb()
    return(`rgb(${rgb_values})`)
}
function create_markers(data){
    depth_array = data.map(d => d.geometry.coordinates[2]);    
    layer_group1 = L.layerGroup()
    for(i=0;i<data.length;i++){
        lon = data[i]["geometry"]["coordinates"][0]
        lat = data[i]["geometry"]["coordinates"][1]
        depth = data[i]["geometry"]["coordinates"][2]
        var circle = L.circle([lat,lon],{
            radius:depth*500,
            color: color_matcher(depth,depth_array)
        }).addTo(layer_group1)//.addTo(map)
        console.log(data[i]["properties"])
        place = data[i]["properties"]["place"]   
        time = new Date(data[i]["properties"]["time"])
        mag = data[i]["properties"]["mag"]
        circle.bindPopup(`<strong>${place} </strong> <p> <strong> Date/Time:</strong> ${time}<br> <strong>Magnitude:</strong> ${mag}</p>`)
    }
    layer_group1.addTo(map)
    true_layers = {"Earthquaks":layer_group1}
    L.control.layers(null,true_layers,{collapsed:false}).addTo(map)
}
d3.json(url).then(function(data){
    create_markers(data.features)
})