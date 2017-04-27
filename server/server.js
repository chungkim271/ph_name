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

app.listen(2000, function() {
  console.log('listening on port 2000')
})
