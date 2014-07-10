var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.SchemaTypes.ObjectId
  , slug = require('mongoose-slug');

// this defines the fields associated with the model,
// and moreover, their type.
var ForumSchema = new Schema({
    name: { type: String, required: true, max: 255 }
  , description: { type: String, max: 1024 }
  , created: { type: Date, required: true, default: Date.now }
  , _creator: { type: ObjectId, required: true, ref: 'Person' }
  , _owner: { type: ObjectId, required: true, ref: 'Person' }
  , _moderators: [ { type: ObjectId, ref: 'Person' }]
});

// attach a URI-friendly slug
ForumSchema.plugin( slug( 'name' , {
  required: true
}) );

var Forum = mongoose.model('Forum', ForumSchema);

// export the model to anything requiring it.
module.exports = {
  Forum: Forum
};
