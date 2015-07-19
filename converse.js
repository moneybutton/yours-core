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

converse.use({
  extends: {
    services: {
      http: {
        middleware: function(req, res, next) {
          if (!req.user) return next();
          Notification.Model.count({
            _to: req.user._id,
            status: 'unread'
          }, function(err, notificationCount) {
            res.locals.unreadNotifications = new Array(notificationCount);
            next();
          });
        }
      }
    }
  }
});

var Person = converse.define('Person', {
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
    hashcash:    { type: String },
    name:        { type: String, required: true, max: 200 },
    description: { type: String },
    sticky:      { type: Boolean , default: false },
    _author:     { type: ObjectId, required: true, ref: 'Person', populate: ['get', 'query'] },
    //_board:      { type: ObjectId, /* required: true, */ ref: 'Board' },
    link:        { type: String },
    score:       { type: Number , required: true , default: 0 },
    _document:     { type: ObjectId , ref: 'Document', populate: ['get', 'query'] },
    stats:       {
      comments:  { type: Number , default: 0 },
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

Post.pre('create', function(next, done) {
  var post = this;
  if (!post.link) return next();

  // TODO: automatic parsing
  Document.create({
    url: post.link,
    title: post.name,
    description: post.description
  }, function(err, document) {
    post._document = document._id;
    next();
  });
});

var Document = converse.define('Document', {
  attributes: {
    url: { type: String , required: true },
    title: { type: String , max: 1024 },
    description: { type: String , max: 1024 },
    image: { type: 'File' }
  }
});

var Comment = converse.define('Comment', {
  attributes: {
    _author: { type: ObjectId, required: true, ref: 'Person', populate: ['query', 'get'] },
    _post:   { type: ObjectId, required: true , ref: 'Post', populate: ['get'] },
    _parent: { type: ObjectId, ref: 'Comment' },
    created: { type: Date, required: true, default: Date.now },
    updated: { type: Date },
    hashcash: { type: String },
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
  };

  pipeline.authorNotification = function notifyAuthor(done) {
    Post.get({ _id: comment._post }, function(err, post) {
      Notification.create({
        _to: post._author,
        _comment: comment._id
      }, done);
    });
  };

  if (comment._parent) {
    pipeline.parent = function updateParentComment(done) {
      Comment.Model.update({
        _id: comment._parent
      }, {
        $inc: { 'stats.comments': 1 }
      }, done);
    };

    pipeline.parentNotification = function notifyParentAuthor(done) {
      Comment.get({ _id: comment._parent }, function(err, parent) {
        Notification.create({
          _to: parent._author,
          _comment: comment._id
        }, done);
      });
    };
  }

  async.parallel(pipeline, function(err, results) {
    if (err) return cb(err);
    next();
  });

});

var Notification = converse.define('Notification', {
  attributes: {
    _to: { type: ObjectId , ref: 'Person', required: true },
    _comment: { type: ObjectId , ref: 'Comment', populate: ['query', 'get'] },
    created: { type: Date , required: true , default: Date.now },
    status: { type: String , enum: ['unread', 'read'], default: 'unread' }
  },
  handlers: {
    html: {
      query: function(req, res, next) {
        if (!req.user) return next();
        Notification.query({ _to: req.user._id }, function(err, notifications) {
          Comment.Model.populate(notifications, {
            path: '_comment'
          }, function(err, notifications) {
            Person.Model.populate(notifications, {
              path: '_comment._author'
            }, function(err, notifications) {
              Notification.Model.update({
                _id: {
                  $in: notifications.map(function(n) { return n._id; })
                }
              }, { $set: { status: 'read' } }, { multi: true }, function(err) {
                return res.render('notifications', {
                  notifications: notifications,
                  unreadNotifications: [] // a bit of a hack
                });
              });
            });
          });
        });
      }
    }
  }
});

var Tip = converse.define('Tip', {
  attributes: {
    _from: { type: ObjectId , ref: 'Person', required: true },
    _to: { type: ObjectId , ref: 'Person', required: true },
    _for: { type: ObjectId },
    context: { type: String , enum: ['post', 'comment'] },
    amount: { type: Number, ref: 'Person', required: true },
  }
});

Tip.post('create', function(next, cb) {
  var tip = this;

  var pipeline = {};

  pipeline.post = function updatePostStats(done) {
    Post.Model.update({
      _id: tip._for
    }, {
      $inc: { 'score': 1 }
    }, done);
  };

  async.parallel(pipeline, function(err, results) {
    if (err) return cb(err);
    next();
  });
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
      populate: '_author _document'
    }
  }
});

converse.start(function(err) {

});
