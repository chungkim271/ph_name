var express = require('express')
var bodyParser = require('body-parser')
var d3 = require('d3')
var cors = require('cors')
var Comment = require('./models/comment.js')

var data = require('./public/us-states.json')
var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/cf-data-viz-app-comments')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }) )
app.use(cors())
app.use(express.static('public'));

app.get('/us_map', function( req, res ) {

	res.send( data )

})

app
	.get('/schedules/schedule_a/by_state/by_candidate/:candidate_id', function( req, res ) {

	// comments = [{

	// 		"candidate_id": "P00003392",
	// 		"author": "chung",
	// 		"comment": "hmm" 
	// 	}]

		//console.log(req.params.candidate_id)
		//console.log("does this work?")
		//'candidate_id': req.params.candidate_id}
		Comment.find({}, function( err, comments ) {

	    	res.status(200).json( comments )

	  	})

	})
	.post('/schedules/schedule_a/by_state/by_candidate/:candidate_id', function( req, res ) {

		commentData = JSON.parse(req.body.data)
		var newComment = new Comment({

			candidate_id: commentData.candidate_id,
			author: commentData.author,
			comment: commentData.comment

		})

		// need to nest find() in save() because save() will
		// take l
		newComment.save( function( err ) {
		    if (err) {
		      console.log( err )
		    }

		    Comment.find({}, function( err, comments ) {

		      res.status(200).json(comments)

		    })

		 })

	})

app.listen(2000, function() {
  console.log('listening on port 2000')
})
