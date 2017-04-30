var express = require('express')
var bodyParser = require('body-parser')
var d3 = require('d3')
var cors = require('cors')

var data = require('./public/us-states.json')
//var mongoose = require('mongoose')

//mongoose.connect('mongodb://localhost:27017/todo-spa-solution')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }) )
app.use(cors())
app.use(express.static('public'));

app.get('/us_map', function( req, res ) {

	res.send( data )

})

app.get('/schedules/schedule_a/by_state/by_candidate', function( req, res ) {

	comments = [{

			"candidate_id": "P00003392",
			"author": "chung",
			"comment": "hmm" 
		}]


	console.log("recieved the request!")
	console.log(comments)
	res.send(comments)

  	// Post.findById( req.params.id, function( err, post ) {

   //  	res.render( 'show', { post: post } )

  	// })

})

app.listen(2000, function() {
  console.log('listening on port 2000')
})
