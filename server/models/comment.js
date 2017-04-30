var mongoose = require('mongoose')
var Schema = mongoose.Schema

var commentSchema = new Schema({
  author: String,
  comments: String
})

var Comment = mongoose.model( 'Comment', commentSchema )

module.exports = Comment
