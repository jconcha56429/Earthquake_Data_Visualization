var map = L.map("map", {
    center: [0, 0],
    zoom: 2,
    maxZoom:10
  });

var dark_map = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY,
    }).addTo(map);

var light_map = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
    })
    
map.setMaxBounds(map.getBounds());

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
    legend_info = "<h1>Earthquake Depth Scale (m)</h1>"
    var labels = []
    for(i=0;i<10;i++){
        labels.push(`<li style="background-color: ${color_matcher(i,nums)}">${parseFloat(num_scale(i)).toFixed(2)}</li>`)
    }
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend_info");
        div.innerHTML = legend_info
        div.innerHTML += `<ul>${labels.join("")}</ul>`
        return div 
    }
    legend.addTo(map)
}

function create_markers(data,plates){
    depth_array = data.map(d => d.geometry.coordinates[2]);    
    layer_group1 = L.layerGroup()
    for(i=0;i<data.length;i++){
        mag = data[i]["properties"]["mag"]
        lon = data[i]["geometry"]["coordinates"][0]
        lat = data[i]["geometry"]["coordinates"][1]
        depth = data[i]["geometry"]["coordinates"][2]
        map.createPane("markers")
        map.getPane("markers").style.zIndex = 997;
        map.createPane("popup")
        map.getPane("popup").style.zIndex = 999;
        var circle = L.circle([lat,lon],{
            pane:"markers",
            radius:mag*1550,
            color: color_matcher(depth,depth_array)
        }).addTo(layer_group1)
        place = data[i]["properties"]["place"]   
        depth = data[i]["geometry"]["coordinates"][2]
        time = new Date(data[i]["properties"]["time"])
        mag = data[i]["properties"]["mag"]
        circle.bindPopup(`<strong>${place}</strong> <p> <strong> Date/Time:</strong> ${time}<br> <strong>Magnitude:</strong> ${mag}<br> <strong> Depth:</strong> ${depth}</p>`,{pane:"popup"})
    }
    layer_group1.addTo(map)
    true_layers = {"Earthquakes":layer_group1,"Tectonic Plates":plates}
    tile_layer = {"Dark Map":dark_map, "Light Map":light_map}
    L.control.layers(tile_layer,true_layers,{collapsed:false}).addTo(map)
    legend_maker(depth_array)
}

url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"
url_2 = "static/js/PB2002_plates.json"

d3.json(url_2).then(function(plate_data){
    var features = L.geoJSON(plate_data.features)
    features.setStyle({'className': 'map-path'})
    d3.json(url).then(function(data){
        true_data = data.features
        create_markers(true_data,features)

})
})