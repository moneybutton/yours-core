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
      sort: '-created'
    },
    'Save': {
      filter: function() {
        var person = this;
        return { _user: person._id };
      },
      map: function(save) {
        return save._post;
      },
      populate: '_post._author',
      sort: '-created'
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
      wilson:    { type: Number , default: 0 },
      hotness:   { type: Number , default: 0 },
      comments:  { type: Number , default: 0 },
      gildings:  { type: Number , default: 0 },
      gilded:    { type: Number , default: 0 },
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
      sort: '-stats.wilson'
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
      wilson:   { type: Number , default: 0 },
      hotness:  { type: Number , default: 0 },
      comments: { type: Number , default: 0 },
      gildings: { type: Number , default: 0 },
      gilded:   { type: Number , default: 0 },
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
              Notification.patch({
                _id: { $in: notifications.map(function(n) { return n._id; }) }
              }, [
                { op: 'replace', path: '/status', value: 'read' }
              ], function(err) {
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

var Gilding = converse.define('Gilding', {
  attributes: {
    //status: { type: String , required: true , enum: ['pending', 'issued', 'failed'], default: 'pending' },
    _user: { type: ObjectId , ref: 'Person', required: true },
    _target: { type: ObjectId, required: true },
    context: { type: String , enum: ['post', 'comment'] },
    amount: { type: Number, required: true },
  }
});

Gilding.on('gilding', function(gilding) {
  var opts = {
    'post': Post,
    'comment': Comment
  };

  Gilding.Model.aggregate([
    { $match: { _target: new UUID(gilding._target) } },
    { $group: {
      _id: '$_target',
      total: { $sum: '$amount' },
      count: { $sum: 1 }
    } }
  ], function(err, stats) {
    if (err) return console.error(err);
    if (!stats.length) return;
    opts[ gilding.context ].patch({
      _id: gilding._target
    }, [
      { op: 'replace', path: '/stats/gildings', value: stats[0].count },
      { op: 'replace', path: '/stats/gilded', value: stats[0].total }
    ], function(err) {
      if (err) console.error(err);
    });
  });
});

Gilding.post('create', function() {
  var gilding = this;
  // NOTE: the only other time a vote event is emitted is when a vote is
  // updated in pre:create (see below)
  Gilding.emit('gilding', gilding);
});

// NOTE: this is strikingly similar to how the pre:create hook for Vote works,
// and probably deserves some consolidation.  We'll also need atomic operations,
// if not a full-on linked-list/blockchain-based accounting system.
Gilding.pre('create', function(next, finalize) {
  var gilding = this;
  var COST = 50;

  async.waterfall([
    deductFromUser,
    addToUser
  ], function(err, results) {
    if (err) return finalize(null, err);
    next();
  });

  function deductFromUser(done) {
    Person.get({ _id: gilding._user }, function(err, sender) {
      if (err) return done(err);
      // TODO: better error handling across Maki
      if (sender.balance - COST <= 0) return done({ error: 'insufficient balance' });

      Person.Model.update({
        _id: gilding._user
      }, {
        $inc: { 'balance': -COST }
      }, function(err) {
        return done(err);
      });
    });
  }

  function addToUser(done) {
    var Resource;
    if (gilding.context === 'post') {
      Resource = Post;
    } else if (gilding.context === 'comment') {
      Resource = Comment;
    }

    Resource.get({ _id: gilding._target }, function(err, resource) {
      Person.Model.update({
        _id: resource._author
      }, {
        $inc: { 'balance': COST }
      }, function(err) {
        return done(err);
      });
    });
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
  var opts = {
    'post': Post,
    'comment': Comment
  };

  function hotScore(ups, downs, date) {
    var decay = 45000;
    var s = ups - downs;
    var order = Math.log(Math.max(Math.abs(s), 1)) / Math.LN10;
    var secAge = (Date.now() - date.getTime()) / 1000;
    return order - secAge / decay;
  }

  function wilsonScore(ups, downs) {
    var z = 1.96;
    var n = ups + downs;
    if (n === 0) {
      return 0;
    }

    var p = ups / n;
    var zzfn = z*z / (4*n);
    return (p + 2*zzfn - z*Math.sqrt((zzfn / n + p*(1 - p))/n)) / (1 + 4*zzfn);
  }

  Vote.Model.aggregate([
    { $match: { _target: new UUID(vote._target) } },
    { $group: {
      _id: '$_target',
      score: { $sum: '$amount' },
      ups: {
        $sum: {
          $cond: [ { $gte: ['$amount', 1] }, 1 , 0 ]
        }
      },
      downs: {
        $sum: {
          $cond: [ { $lte: ['$amount', -1] }, 1 , 0 ]
        }
      },
    } }
  ], function(err, stats) {
    if (err) return console.error(err);
    if (!stats.length) return;
    var meta = stats[0];

    opts[ vote.context ].get({ _id: vote._target }, function(err, item) {
      var hotness = hotScore(meta.ups, meta.downs, item.created);
      var wilson = wilsonScore(meta.ups, meta.downs);

      opts[ vote.context ].patch({
        _id: vote._target
      }, [
        { op: 'replace', path: '/score', value: meta.score },
        { op: 'replace', path: '/stats/hotness', value: hotness },
        { op: 'replace', path: '/stats/wilson', value: wilson },
      ], function(err) {
        if (err) console.error(err);
      });
    });
  });
});

Vote.post('create', function() {
  var vote = this;
  // NOTE: the only other time a vote event is emitted is when a vote is
  // updated in pre:create (see below)
  Vote.emit('vote', vote);
});

Vote.pre('create', function(next, finalize) {
  var vote = this;
  var COST = 1; // maybe this will eventually be per-sub or per-tag, whatever
                // the group ends up deciding.

  if (vote.sentiment == '1') {
    vote.amount = COST;
  } else if (vote.sentiment == '-1') {
    vote.amount = -COST;
  } else {
    return done('No such value.');
  }

  async.waterfall([
    applyVote,
    deductFromUser,
    addToUser
  ], function(err, results) {
    // Note: counterintuitive.  Err here is likely the vote, if it's an update
    if (err) return finalize(null, err);
    next();
  });

  function deductFromUser(done) {
    Person.get({ _id: vote._user }, function(err, sender) {
      if (err) return done(err);
      // TODO: better error handling across Maki
      if (sender.balance - COST <= 0) return done({ error: 'insufficient balance' });

      Person.Model.update({
        _id: vote._user
      }, {
        $inc: { 'balance': -COST }
      }, function(err) {
        return done(err);
      });
    });
  }

  function addToUser(done) {
    var Resource;
    if (vote.context === 'post') {
      Resource = Post;
    } else if (vote.context === 'comment') {
      Resource = Comment;
    }

    Resource.get({ _id: vote._target }, function(err, resource) {
      Person.Model.update({
        _id: resource._author
      }, {
        $inc: { 'balance': COST }
      }, function(err) {
        return done(err);
      });
    });
  }

  function applyVote(done) {
    Vote.query({
      _user: vote._user,
      _target: vote._target
    }, function(err, votes) {
      if (err) return done(err);
      if (!votes.length) {
        return done();
      }

      Vote.patch({
        _user: vote._user,
        _target: vote._target
      }, [{ op: 'replace', path: '/amount', value: vote.amount }], function(err) {
        // NOTE: if you change this, beware of consequences – the vote scoring
        // only updates on:vote (see above)
        Vote.emit('vote', vote);
        return done(vote);
      });
    });
  }

});

var Save = converse.define('Save', {
  attributes: {
    _user: { type: ObjectId , required: true , ref: 'Person', populate: ['query', 'get'] },
    _post: { type: ObjectId , required: true , ref: 'Post', populate: ['query', 'get'] },
    created: { type: Date , required: true , default: Date.now }
  },
  icon: 'bookmark'
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
      sort: '-stats.hotness'
    }
  }
});

converse.start(function(err) {

});
