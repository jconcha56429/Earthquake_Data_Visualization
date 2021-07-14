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
function color_matcher(depth){
    var color_scale = chroma.scale(['yellow','red']);
    if (depth>600){
        return(`rgb(${color_scale(1).rgb()})`)
    }
    else if (depth>540){
        return(`rgb(${color_scale(.9).rgb()})`)
    }
    else if (depth>480){
        return(`rgb(${color_scale(.8).rgb()})`)
    }
    else if (depth>420){
        return(`rgb(${color_scale(.7).rgb()})`)
    }
    else if (depth>360){
        return(`rgb(${color_scale(.6).rgb()})`)
    }
    else if (depth>300){
        return(`rgb(${color_scale(.5).rgb()})`)
    }
    else if (depth>240){
        return(`rgb(${color_scale(.4).rgb()})`)
    }
    else if (depth>180){
        return(`rgb(${color_scale(.3).rgb()})`)
    }
    else if (depth>120){
        return(`rgb(${color_scale(.2).rgb()})`)
    }
    else if (depth>60){
        return(`rgb(${color_scale(.1).rgb()})`)
    }
    else {
        return(`rgb(${color_scale(.0).rgb()})`)
    }
}
function create_markers(data){

    for(i=0;i<data.length;i++){
        // console.log(data[i])
        lon = data[i]["geometry"]["coordinates"][0]
        lat = data[i]["geometry"]["coordinates"][1]
        depth = data[i]["geometry"]["coordinates"][2]
        L.circle([lat,lon],{
            radius:depth*500,
            color: color_matcher(depth)
        }).addTo(map)
        // if (depth > 100){
        //     console.log("gazoonga!")
        // }
        // else if(depth<100){
        //     console.log("grazinga!")
        // }
    }
}
d3.json(url).then(function(data){
    features = data.features
    // console.log(features[0]["geometry"]
    // console.log(data)
    create_markers(data.features)
    var color_scale = chroma.scale(['yellow','red']);
    // d3.select("#test").append("text").text("caca").style("color",`rgb(${color_scale(.0).rgb()})`)
    console.log(`rgb(${color_scale(1).rgb()})`)
    
})