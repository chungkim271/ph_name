var app = document.getElementById('app') // this is all the space in <main>

// relly helpful stackoverflow post about promises
// http://stackoverflow.com/questions/30008114/how-do-i-promisify-native-xhr
function makeRequest (method, url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
}



/* 

  Views 

*/

var Views = { 

    candidateList: {

        setup: function() {
            console.log("set up for candidate list!")

            // listen for a click
            // then render template-mapViz and Views.mapViz.setup()!

            var candidateNames = document.querySelectorAll('.js-candidate')
            console.log(candidateNames )

            for (i=0; i < candidateNames.length; i++) {
                
                console.log(name)

                candidateNames[i].addEventListener('click', function( e ) {
                    e.preventDefault()

                    // I can't use candidateNames[i].children...
                    // when this function runs i is the last index
                    // so it will only grab the last element of candidateNames.

                    var name = e.target.innerText

                    // find the candidate object using name 
                    console.log('name is' + name)
                    var obj = candidateData.candidate.filter(function ( obj ) {
                        return obj.name === name
                    })[0]

                    // add to the candidate object a list of other candidates
                    var others = candidateData.candidate.filter(function ( obj ) {
                        return obj.name !== name
                    })
                    console.log(others)
                    obj.otherCandidates = []
                    for (i=0; i < others.length; i++) {
                        obj.otherCandidates.push(others[i].name)
                    }

                    // obj passed into render() follows handlebar's format
                    app.innerHTML = Views.mapViz.render( { "candidate":[obj] } ) //+ 
                        //Views.comments.render(obj.candidate_id)
                    Views.mapViz.setup(obj)
                    Views.comments.setup(obj)


                })
            }
        }
    
    },

    comments: {
        setup: function(obj) {
            console.log(obj.candidate_id)
            makeRequest('GET', 'http://localhost:2000/schedules/schedule_a/by_state/by_candidate')
            .then( function(res) {

                console.log('res type:' + typeof res)
                console.log(res)

                comments = JSON.parse( res )

                app.innerHTML = app.innerHTML + Views.comments.render( {"comments":comments} )
            
            })
        }
    },

    mapViz: { 

        setup: function(obj) {
            console.log("set up for map view!")
            console.log(obj)

            Views.candidateList.setup()

            // the following function is more suited for 
            // when API calls must be chained-- i.e. a call is dependent upon
            // the success of the proceeding one.
            // in my case, I just need to make sure both mapData and campiData are
            // defined when I create the map. 

            // define mapData here first.
            // first promise will assign the json object 
            // the second promise will look for it in that functon's environment
            // not find it, and find it setup()'s environment
            var mapData 
            makeRequest('GET', 'http://localhost:2000/us_map')
                .then( function(res) {
                    mapData = JSON.parse( res )

                    // make the api call for the chosen candidate
                    candidateId = obj.candidate_id
                    apiKey = '8mrww6WdlDoAwNbewqjRQBKIAfVxXsib2uK64OUf'
                    endPoint = 'https://api.open.fec.gov/v1/schedules/schedule_a/by_state/by_candidate/?per_page=100&page=1&api_key=' + 
                        apiKey +
                        '&candidate_id=' + 
                        candidateId + 
                        '&cycle=2016&election_full=true'

                    return(makeRequest('GET', endPoint))
                })
                .then( function(res) {
                    var cfData = JSON.parse(res).results // this is an array
                    Views.mapViz.generateMap(mapData, cfData, obj)
                })
                .catch(function(err) {
                    console.error('Augh, there was an error!', err.statusText)
                })

        },

        generateMap: function(mapData, cfData, obj) {
                  
            // console.log(mapData)
            // console.log(cfData)
            // console.log("success!")

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
            var svg = d3.select("map-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height);
            
            // Append Div for tooltip to SVG
            var div = d3.select("body")
                    .append("div")   
                    .attr("class", "tooltip")               
                    .style("opacity", 0);


            // create categorical variable based on donation amounts
            // and assign to a key in cfData
            // http://learnjsdata.com/ has super helpful tutorials

            // I need to delete territories other than the 50 states
            // Seems like if the state object doesn't have 'state_full', then it's not a U.S. state
            console.log(cfData)
            console.log(mapData)

            // define contain method that checks if the element is in an array
            Array.prototype.contains = function(element) {
                return this.indexOf(element) > -1;
            }

            nonUsStates = [null, "American Samoa", "Guam", "Northern Mariana Islands", "Puerto Rico", "Virgin Islands"]

            for (i=0; i < cfData.length; i++) {
                //console.log(cfData[i])
                if (nonUsStates.contains(cfData[i].state_full)) {
                    cfData.splice(i, 1)
                }
            }

            // the following objects have stete_full = null, but won't get filtered!
            // why?
            // splice them out manually
            // cfData.splice(0, 1)
            // cfData.splice(5, 1)
            // cfData.splice(41, 1)

            var totals = cfData.map(function(d) { return d.total })
            var min = d3.min(cfData, function(d) { return d.total })
            var max = d3.max(cfData, function(d) { return d.total })

            // console.log(min)
            // console.log(max)

            if (obj.party==="D") {
                var colorScheme = d3.schemeBlues[9]
            } else if (obj.party==="R") {
                var colorScheme = d3.schemeReds[9]
            }

            var color = d3.scaleQuantile()
                .domain([min, max])
                .range(colorScheme);

            // add total to mapData
            for (var i = 0; i < cfData.length; i++) {

            // Grab State Name
                var cfDataState = cfData[i].state_full;

                // Grab data value 
                var cfDataValue = cfData[i].total;

              //Find the corresponding state inside the GeoJSON
                for (var j = 0; j < mapData.features.length; j++)  {
                    var mapDataState = mapData.features[j].properties.name;

                    if (cfDataState == mapDataState) {

                        // Copy the data value into the JSON
                        mapData.features[j].properties.total = cfDataValue; 

                        // Stop looking through the JSON
                        break;
                    }
                }
            }
                
            // Bind the data to the SVG and create one path per GeoJSON feature
            svg.selectAll("path")
                .data(mapData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("stroke", "#fff")
                .style("stroke-width", "1")
                .style("fill", function(d) {

                    // Get data value
                    var value = d.properties.total;

                    if (value) {
                        //If value exists…
                         return color(value);
                    } else {
                      //If value is undefined…
                        return "rgb(213,222,217)";
                    }
                })
                .on("mouseover", function(d) {      
                    div.transition()        
                        .duration(200)      
                        .style("opacity", .9);      
                    div.text('$ ' + d.properties.total)
                        .style("left", (d3.event.pageX) + "px")     
                        .style("top", (d3.event.pageY - 28) + "px");    
                })   
                // fade out tooltip on mouse out               
                .on("mouseout", function(d) {       
                    div.transition()        
                       .duration(500)      
                       .style("opacity", 0);   
                })

        }
    } 
}





/* 

  Make API call to ProPublica

*/



// apiKey = '8mrww6WdlDoAwNbewqjRQBKIAfVxXsib2uK64OUf'
// endPoint = 'https://api.open.fec.gov/v1/schedules/schedule_a/by_state/by_candidate/?per_page=100&page=1&api_key=' + 
//   apiKey +
//   '&candidate_id=P00003392&cycle=2016&election_full=true'

// var request = new XMLHttpRequest()
// request.open('GET', endPoint)
// request.onreadystatechange = function() {
//     if ( request.readyState === 4 && request.status === 200 ) {
//       var response = JSON.parse( request.response )
      
//       var states = response.results

//       var stateNames = []
//       for (i=0; i < states.length; i ++) {
//         stateNames.push(states[i].state)
//       }
//     }

//     console.log(stateNames)

// }
// request.send()



candidateData = {
    "candidate" : [
        {
            "name" : "Hillary Clinton",
            "candidate_id" : "P00003392",
            "party" : "D"
        },
        {
            "name" : "Donald Trump",
            "candidate_id" : "P80001571",
            "party" : "R"
        },
        {
            "name" : "Bernie Sanders",
            "candidate_id" : "P60007168",
            "party" : "D"
        },
        {
            "name" : "Ted Cruz",
            "candidate_id" : "P60006111",
            "party" : "R"
        }

    ]
}

setup = function() {

    var templateSources = document.querySelectorAll("[id^='template-']")

    // for each of them, compile handlebar and save it as Views.render
    for (var i = 0; i < templateSources.length; i++) {
        Views[ templateSources[i].id.substring(9) ].render =  Handlebars.compile( templateSources[i].innerHTML )
    }

    // the first view is just the list of candidates
    app.innerHTML = Views.candidateList.render(candidateData)

    // set up event listeners
    Views.candidateList.setup()

}

setup()