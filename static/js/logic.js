var map = L.map("map", {
    center: [40.73, -74.0059],
    zoom: 2,
  });
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
    }).addTo(map);

function color_matcher(depth,depth_array){
    var color_scale = chroma.scale(['blue','red']);
    var depth_scale = d3.scaleLinear()
        .domain([d3.min(depth_array),d3.max(depth_array)])
        .range([0,1]);
    scaled_depth = depth_scale(depth)
    rgb_values = color_scale(scaled_depth).rgb()
    return(`rgb(${rgb_values})`)
}
function legend_maker(depth_array){
    var legend = L.control({ position: "bottomright" });
    nums = [0,1,2,3,4,5,6,7,8,9];
    min = d3.min(depth_array);
    max = d3.max(depth_array);
    num_scale = d3.scaleLinear()
        .domain([d3.min(nums),d3.max(nums)])
        .range([d3.min(depth_array),d3.max(depth_array)])
    legend_info = "<h1>Earthquake Depth Scale</h1>"
    var labels = []
    for(i=0;i<10;i++){
        labels.push(`<li style="background-color: ${color_matcher(i,nums)}">${parseFloat(num_scale(i)).toFixed(2)}</li>`)
    }
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend info");
        div.innerHTML = legend_info
        div.innerHTML += `<ul>${labels.join("")}</ul>`
        return div 
    }
    legend.addTo(map)
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
        }).addTo(layer_group1)
        place = data[i]["properties"]["place"]   
        depth = data[i]["geometry"]["coordinates"][2]
        time = new Date(data[i]["properties"]["time"])
        mag = data[i]["properties"]["mag"]
        circle.bindPopup(`<strong>${place}</strong> <p> <strong> Date/Time:</strong> ${time}<br> <strong>Magnitude:</strong> ${mag}<br> <strong> Depth:</strong> ${depth}</p>`)
    }
    layer_group1.addTo(map)
    true_layers = {"Earthquaks":layer_group1}
    L.control.layers(null,true_layers,{collapsed:false}).addTo(map)
    legend_maker(depth_array)
}

url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"
d3.json(url).then(function(data){
    create_markers(data.features)
})