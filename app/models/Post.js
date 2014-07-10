var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.SchemaTypes.ObjectId;

// this defines the fields associated with the model,
// and moreover, their type.
var PostSchema = new Schema({
    _author: { type: ObjectId, required: true, ref: 'Person' }
  , _topic: { type: ObjectId, required: true }
  , created: { type: Date, required: true, default: Date.now }
  , updated: { type: Date }
  , content: { type: String, min: 1 }
});

var Post = mongoose.model('Post', PostSchema);

// export the model to anything requiring it.
module.exports = {
  Post: Post
};
