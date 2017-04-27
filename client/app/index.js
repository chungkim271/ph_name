var app = document.getElementById('app')

/* 

  Views 

*/

var Views = { 

    candidateList: {

        setup: function() {
            console.log("set up for candidate list!")
        }
    
    }



}



// When the user clicks on the button, 
// toggle between hiding and showing the dropdown content 
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// map candidate's name to id
function mapping(name) {
  mapping = {
    "Hillary Clinton" : "P00003392",
    "Donald Trump" : "P80001571",
    "Berny Sanders" : "P60007168",
    "Ted Cruz" : "P60006111"
  }
  return(mapping[name])
}


/*

  Request US map data from the server

  note: each request needs to have a unique name

*/

var requestStateData = new XMLHttpRequest()
requestStateData.open('GET', 'http://localhost:2000/us_map')
requestStateData.onreadystatechange = generateMap

function generateMap() {
    if ( requestStateData.readyState === 4 && requestStateData.status === 200 ) {
      var data = JSON.parse( requestStateData.response )
      
      console.log(data)
      console.log("success!")

      //Width and height of map
      var width = 960;
      var height = 500;

      // D3 Projection
      var projection = d3.geo.albersUsa()
                 .translate([width/2, height/2])    // translate to center of screen
                 .scale([1000]);          // scale things down so see entire US
        
      // Define path generator
      var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
               .projection(projection);  // tell path generator to use albersUsa projection

    
// Define linear scale for output
var color = d3.scale.linear()
        .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];

        //Create SVG element and append map to the SVG
        var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height);
        
        // Append Div for tooltip to SVG
        var div = d3.select("body")
                .append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);



// // Load in my states data!
// d3.csv("stateslived.csv", function(data) {
// color.domain([0,1,2,3]); // setting the range of the input data

// do not need this part
// Load GeoJSON data and merge with states data
// d3.json("us-states.json", function(json) {

// Loop through each state data value in the .csv file
// for (var i = 0; i < data.length; i++) {

  // // Grab State Name
  // var dataState = data[i].state;

  // // Grab data value 
  // var dataValue = data[i].visited;

  // Find the corresponding state inside the GeoJSON
  // for (var j = 0; j < json.features.length; j++)  {
  //   var jsonState = json.features[j].properties.name;

  //   if (dataState == jsonState) {

  //   // Copy the data value into the JSON
  //   json.features[j].properties.visited = dataValue; 

  //   // Stop looking through the JSON
  //   break;
    // }
//   }
// }
    
// Bind the data to the SVG and create one path per GeoJSON feature
svg.selectAll("path")
  .data(data.features)
  .enter()
  .append("path")
  .attr("d", path)
  .style("stroke", "#fff")
  .style("stroke-width", "1")
//   .style("fill", function(d) {

//   // Get data value
//   //var value = d.properties.visited;

//   if (value) {
//   //If value exists…
//   return color(value);
//   } else {
//   //If value is undefined…
//   return "rgb(213,222,217)";
//   }
// });

     
// Map the cities I have lived in!
// d3.csv("cities-lived.csv", function(data) {

// svg.selectAll("circle")
//   .data(data)
//   .enter()
//   .append("circle")
//   .attr("cx", function(d) {
//     return projection([d.lon, d.lat])[0];
//   })
//   .attr("cy", function(d) {
//     return projection([d.lon, d.lat])[1];
//   })
//   .attr("r", function(d) {
//     return Math.sqrt(d.years) * 4;
//   })
//     .style("fill", "rgb(217,91,67)")  
//     .style("opacity", 0.85) 

//   // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
//   // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
//   .on("mouseover", function(d) {      
//       div.transition()        
//            .duration(200)      
//            .style("opacity", .9);      
//            div.text(d.place)
//            .style("left", (d3.event.pageX) + "px")     
//            .style("top", (d3.event.pageY - 28) + "px");    
//   })   

//     // fade out tooltip on mouse out               
//     .on("mouseout", function(d) {       
//         div.transition()        
//            .duration(500)      
//            .style("opacity", 0);   
//     });
// });  
        
// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
// var legend = d3.select("body").append("svg")
//             .attr("class", "legend")
//           .attr("width", 140)
//           .attr("height", 200)
//           .selectAll("g")
//           .data(color.domain().slice().reverse())
//           .enter()
//           .append("g")
//           .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

//     legend.append("rect")
//         .attr("width", 18)
//         .attr("height", 18)
//         .style("fill", color);

//     legend.append("text")
//         .data(legendText)
//           .attr("x", 24)
//           .attr("y", 9)
//           .attr("dy", ".35em")
//           .text(function(d) { return d; });
//   });

// });





    }
} 
requestStateData.send()




/* 

  Make API call to ProPublica

*/



apiKey = '8mrww6WdlDoAwNbewqjRQBKIAfVxXsib2uK64OUf'
endPoint = 'https://api.open.fec.gov/v1/schedules/schedule_a/by_state/by_candidate/?per_page=100&page=1&api_key=' + 
  apiKey +
  '&candidate_id=P00003392&cycle=2016&election_full=true'

var request = new XMLHttpRequest()
request.open('GET', endPoint)
request.onreadystatechange = function() {
    if ( request.readyState === 4 && request.status === 200 ) {
      var response = JSON.parse( request.response )
      
      var states = response.results

      var stateNames = []
      for (i=0; i < states.length; i ++) {
        stateNames.push(states[i].state)
      }
    }

    console.log(stateNames)

}
request.send()



// Close the dropdown menu if the user clicks outside of it
// ???? why does this have to be the last code in index.js?
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}








