var d3 = require('d3')

console.log(__dirname)
console.log(__filename)
d3.json("us-states.json", function(json) {
	//json = JSON.parse(json )
  	console.log(json)
  	
  })