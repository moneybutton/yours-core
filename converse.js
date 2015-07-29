var config = require('./config');
var async = require('async');
var scrape = require('html-metadata');

var Maki = require('maki');
var converse = new Maki( config );

var ObjectId = converse.mongoose.SchemaTypes.ObjectId;
var UUID = converse.mongoose.Types.ObjectId;

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
    image:    { type: 'File' },
    balance:  { type: Number , required: true , default: 100 },
    settings: {
      amount: { type: Number , required: true , default: 1 }
    }
  },
  requires: {
    'Post': {
      filter: function() {
        var person = this;
        return { _author: person._id };
      },
      populate: '_author _document',
      sort: '-score -created'
    }
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
      populate: '_author _parent',
      sort: '-score -created'
    }
  },
  icon: 'pin'
});

Post.pre('create', function(next, done) {
  var post = this;
  if (!post.link) return next();
  if (!post.document) return next();

  Document.create({
    url: post.link,
    title: post.document.name,
    description: post.document.description
  }, function(err, document) {
    post._document = document._id;
    next();
  });
});

var Document = converse.define('Document', {
  attributes: {
    hash: { type: String },
    url: { type: String , required: true },
    title: { type: String , max: 1024 },
    description: { type: String , max: 1024 },
    image: {
      url: { type: String }
    },
  }
});

Document.pre('create', function(next, done) {
  var document = this;
  if (!document.url) return done('no url provided');
  var crypto = require('crypto');
  document.hash = crypto.createHash('sha256').update(document.url).digest('hex');
  scrape(document.url, function(err, metadata) {
    if (err) console.error(err);
    if (!metadata) return next();
    if (!metadata.openGraph) metadata.openGraph = {};
    if (!metadata.schemaOrg) metadata.schemaOrg = { items: [] };

    var authorshipClaims = [];

    metadata.schemaOrg.items.forEach(function(item) {
      if (item.properties.author) {
        item.properties.author.forEach(function(author) {
          if (author.type[0] === 'http://schema.org/Person') {
            authorshipClaims.push( author.properties.url[0] );
          }
        });
      }
    });

    console.log('authorshipClaims', authorshipClaims);

    // TODO: automatic parsing
    document.title = document.title || metadata.openGraph.title || metadata.general.title;
    document.description = document.description || metadata.openGraph.description || metadata.general.description;
    document.image = metadata.openGraph.image;



    console.log('okay, saved:', document);
    next(err);
  });
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
    score: { type: Number , required: 0 , default: 0 },
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
      populate: '_author _parent',
      sort: '-score -created'
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

var Vote = converse.define('Vote', {
  attributes: {
    //status: { type: String , required: true , enum: ['pending', 'issued', 'failed'], default: 'pending' },
    _user: { type: ObjectId , ref: 'Person', required: true },
    _target: { type: ObjectId, required: true },
    context: { type: String , enum: ['post', 'comment'] },
    amount: { type: Number, required: true },
  }
});

Vote.on('vote', function(vote) {
  console.log('vote event!');

  var opts = {
    'post': Post,
    'comment': Comment
  };

  Vote.Model.aggregate([
    { $match: { _target: new UUID(vote._target) } },
    { $group: {
      _id: '$_target',
      score: { $sum: '$amount' }
    } }
  ], function(err, stats) {
    if (err) return console.error(err);
    if (!stats.length) return;
    opts[ vote.context ].Model.update({
      _id: vote._target
    }, {
      $set: { 'score': stats[0].score }
    }, function(err) {
      if (err) console.error(err);
    });
  });
});

Vote.pre('create', function(next, done) {
  var vote = this;

  if (vote.sentiment == '1') {
    vote.amount = 1;
  } else if (vote.sentiment == '-1') {
    vote.amount = -1;
  } else {
    return done('No such value.');
  }

  Vote.query({
    _user: vote._user,
    _target: vote._target
  }, function(err, votes) {
    if (err) return done(err);
    if (!votes.length) {
      Vote.emit('vote', vote);
      return next();
    }

    Vote.Model.update({
      _user: vote._user,
      _target: vote._target
    }, {
      $set: { amount: vote.amount }
    }, function(err) {
      Vote.emit('vote', vote);
      return done(null, vote);
    });
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
      populate: '_author _document',
      sort: '-score -created'
    }
  }
});

converse.start(function(err) {

});
