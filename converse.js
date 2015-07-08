var config = require('./config');

var Maki = require('maki');
var converse = new Maki( config );

var ObjectId = converse.mongoose.SchemaTypes.ObjectId;

var Passport = require('maki-passport-local');
var passport = new Passport({
  resource: 'Person'
});

converse.use( passport );

converse.define('Person', {
  attributes: {
    username: { type: String , max: 35 , required: true , slug: true },
    password: { type: String , max: 70 , masked: true }
  },
  icon: 'user'
});

converse.define('Board', {
  attributes: {
    name: { type: String, required: true, max: 200 , slug: true },
    description: { type: String, max: 1024 },
    created: { type: Date, required: true, default: Date.now },
    _creator: { type: ObjectId, required: true, ref: 'Person' },
    _owner: { type: ObjectId, required: true, ref: 'Person' },
    _moderators: [ { type: ObjectId, ref: 'Person' } ]
  },
  icon: 'slack'
});

converse.define('Post', {
  attributes: {
    name: { type: String, required: true, max: 200 },
    description: { type: String, required: true },
    _author: { type: ObjectId, required: true, ref: 'Person' },
    _board:  { type: ObjectId, /* required: true, */ ref: 'Forum' },
    created: { type: Date, required: true, default: Date.now },
    link:    { type: String }
  },
  icon: 'pin'
});

converse.define('Comment', {
  attributes: {
    _author: { type: ObjectId, required: true, ref: 'Person' },
    _post: { type: ObjectId, required: true , ref: 'Post' },
    _parent: { type: ObjectId, required: true , ref: 'Comment' },
    created: { type: Date, required: true, default: Date.now },
    updated: { type: Date },
    content: { type: String, min: 1 }
  },
  icon: 'comment'
});

converse.start(function(err) {

});
