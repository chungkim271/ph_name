console.log("is the server running?")
var express = require('express')
var bodyParser = require('body-parser')
var d3 = require('d3')
var cors = require('cors')
var Comment = require('./server/models/comment.js')

var data = require('./server/public/us-states.json')
var mongoose = require('mongoose')
var port = process.env.PORT || 8081

mongoose.connect('mongodb://chung:cfapp@ds129031.mlab.com:29031/cf-data-viz-app-comments')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }) )
app.use(cors())
app.use(express.static('./server/public'));

app.get('/', function( req, res ) {
	res.send('hello world!');
})

app.get('/us_map', function( req, res ) {

	res.send( data )

})

app
	.get('/schedules/schedule_a/by_state/by_candidate/:candidate_id', function( req, res ) {

	// testComment = [{

	// 		"candidate_id": "P00003392",
	// 		"author": "chung",
	// 		"comment": "hmm" 
	// 	}]

		Comment.find({ 'candidate_id': req.params.candidate_id }, 'author comment', {sort: {"_id": -1}}, function( err, comments ) {

		//console.log(req.params.candidate_id)
		//console.log(typeof req.params.candidate_id)
		//Comment.find({}, function( err, comments ) {

			//console.log(comments)
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

		    //req.params.candidate_id

		    Comment.find({ 'candidate_id': req.params.candidate_id }, 'author comment', {sort: {"_id": -1}}, function( err, comments ) {

		      res.status(200).json(comments)

		    })

		 })

	})

app.listen(port, function() {
  console.log('listening on port aws port: ' + port)
})
