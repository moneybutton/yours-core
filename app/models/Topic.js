var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.SchemaTypes.ObjectId
  , passportLocalMongoose = require('passport-local-mongoose')
  , slug = require('mongoose-slug');

// this defines the fields associated with the model,
// and moreover, their type.
var TopicSchema = new Schema({
    name: { type: String, required: true, max: 255 }
  , description: { type: String, required: true }
  , _author: { type: ObjectId, required: true, ref: 'Person' }
  , _forum:  { type: ObjectId, required: true, ref: 'Forum' }
  , created: { type: Date, required: true, default: Date.now }
});

// attach a URI-friendly slug
TopicSchema.plugin( slug( 'name' , {
  required: true
}) );

var Topic = mongoose.model('Topic', TopicSchema);

// export the model to anything requiring it.
module.exports = {
  Topic: Topic
};
