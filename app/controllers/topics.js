module.exports = {
  view: function(req, res, next) {
    Forum.findOne({ slug: req.param('forumSlug') }).exec(function(err, forum) {
      if (err) { console.log(err); }
      if (!forum) { return next(); }
      
      Topic.findOne({ _forum: forum._id , slug: req.param('topicSlug') }).populate('_author').exec(function(err, topic) {
        if (err) { console.log(err); }
        if (!topic) { return next(); }
        
        Post.find({ _topic: topic._id }).populate('_author').exec(function(err, posts) {
          if (err) { console.log(err); }

          res.provide('topic', {
              forum: forum
            , topic: topic
            , posts: posts
          });
        });
      });
    });
  },
  create: function(req, res, next) {
    Forum.findOne({ slug: req.param('forumSlug') }).exec(function(err, forum) {
      if (err) { console.log(err); }
      if (!forum) { return next(); }
      
      var topic = new Topic({
          name: req.param('name')
        , description: req.param('description')
        , _author: req.user._id
        , _owner: req.user._id
        , _forum: forum._id
      });
      topic.save(function(err) {
        if (err) { console.log(err); return next(); }
        
        res.redirect('/forums/' + forum.slug + '/topics/' + topic.slug );
        
      });
      
    });
  }
};
