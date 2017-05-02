var mongoose = require('mongoose')
var Schema = mongoose.Schema

var commentSchema = new Schema({
	candidate_id: String,
	author: String,
  	comment: String
})

var Comment = mongoose.model( 'Comment', commentSchema )

module.exports = Comment
