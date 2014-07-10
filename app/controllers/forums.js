module.exports = {
  create: function(req, res, next) {
    if (!req.user) { return next('Must be logged in to do this.'); }

    var forum = new Forum({
        name: req.param('name')
      , _creator: req.user._id
      , _owner: req.user._id
    });
    forum.save(function(err) {
      if (err) { return next(err); }
      
      res.redirect('/forums/' + forum.slug);
      
    });
  },
  view: function(req, res, next) {
    Forum.findOne({ slug: req.param('forumSlug') }).exec(function(err, forum) {
      if (err || !forum) { return next(); }
      
      Topic.find({ _forum: forum._id }).populate('_author').exec(function(err, topics) {
        res.provide('forum', {
            forum: forum
          , topics: topics
        });
      });
    });
  }
};
