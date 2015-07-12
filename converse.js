var config = require('./config');
var async = require('async');

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
    password: { type: String , max: 70 , masked: true },
    created:  { type: Date , default: Date.now , render: { query: false } },
    bio:      { type: String , max: 250 },
    image:    { type: 'File' }
  },
  icon: 'user'
});

/* converse.define('Board', {
  attributes: {
    name: { type: String, required: true, max: 200 , slug: true },
    description: { type: String, max: 1024 },
    created: { type: Date, required: true, default: Date.now },
    _creator: { type: ObjectId, required: true, ref: 'Person' },
    _owner: { type: ObjectId, required: true, ref: 'Person' },
    _moderators: [ { type: ObjectId, ref: 'Person' } ]
  },
  icon: 'slack'
}); */

var Post = converse.define('Post', {
  attributes: {
    created:     { type: Date, required: true, default: Date.now },
    hashcash:    { type: String, required: true , sparse: true },
    name:        { type: String, required: true, max: 200 },
    description: { type: String },
    sticky:      { type: Boolean , default: false },
    _author:     { type: ObjectId, required: true, ref: 'Person', populate: ['get', 'query'] },
    //_board:      { type: ObjectId, /* required: true, */ ref: 'Board' },
    link:        { type: String },
    _object:     { type: ObjectId , ref: 'Object', populate: ['get'] },
    stats:       {
      comments:  { type: Number , default: 0 }
    },
    attribution: {
      _author: { type: ObjectId , ref: 'Person', populate: ['get', 'query'] }
    }
  },
  requires: {
    'Comment': {
      filter: function() {
        var post = this;
        return { _post: post._id , _parent: { $exists: false } };
      },
      populate: '_author _parent'
    }
  },
  icon: 'pin'
});

var Comment = converse.define('Comment', {
  attributes: {
    _author: { type: ObjectId, required: true, ref: 'Person' },
    _post:   { type: ObjectId, required: true , ref: 'Post', populate: ['get'] },
    _parent: { type: ObjectId, ref: 'Comment' },
    created: { type: Date, required: true, default: Date.now },
    updated: { type: Date },
    hashcash: { type: String , required: true , sparse: true },
    content: { type: String, min: 1 },
    stats: {
      comments: { type: Number , default: 0 }
    }
  },
  requires: {
    'Comment': {
      filter: function() {
        var comment = this;
        return { _parent: comment._id };
      },
      populate: '_author _parent'
    }
  },
  handlers: {
    html: {
      create: function(req, res) {
        var comment = this;
        req.flash('info', 'Comment created successfully!');
        if (comment._parent) {
          res.status( 303 ).redirect('/comments/' + comment._parent + '#comments' + comment._id );
        } else {
          res.status( 303 ).redirect('/posts/' + comment._post );
        }

      }
    }
  },
  icon: 'comment'
});

Comment.post('create', function(next, cb) {
  var comment = this;

  var pipeline = {};

  pipeline.post = function updatePostStats(done) {
    Post.Model.update({
      _id: comment._post
    }, {
      $inc: { 'stats.comments': 1 }
    }, done);
  }

  if (comment._parent) {
    pipeline.parent = function updateParentComment(done) {
      Comment.Model.update({
        _id: comment._parent
      }, {
        $inc: { 'stats.comments': 1 }
      }, done);
    }
  }

  async.parallel(pipeline, function(err, results) {
    if (err) return cb(err);
    next();
  });

});

converse.define('Object', {
  attributes: {
    url: { type: String , required: true },
    title: { type: String , max: 1024 },
    description: { type: String , max: 1024 },
    image: { type: 'File' }
  }
});

converse.define('Index', {
  name: 'Index',
  static: true,
  internal: true,
  routes: {
    query: '/'
  },
  templates: {
    query: 'posts'
  },
  requires: {
    'Post': {
      filter: {},
      populate: '_author'
    }
  }
});

converse.start(function(err) {

});
