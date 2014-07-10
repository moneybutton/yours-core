module.exports = {
  list: function(req, res, next) {
    Person.find().exec(function(err, people) {
      res.provide( 'people', {
        people: people
      });
    });
  },
  view: function(req, res, next) {
    Person.findOne({ slug: req.param('personSlug') }).exec(function(err, person) {
      if (err || !person) { return next(); }
      res.provide( 'person', {
        person: person
      });
    });
  },
  // TODO: define a forms class that describes fields
  forms: {
      login: function(req, res) {
        res.render('login');
      }
    , register: function(req, res, next) {
        res.render('register');
      }
  },
  create: function(req, res) {
    Person.register(new Person({
      email : req.body.email,
      username : req.body.username
    }), req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        return res.render('register', { user : user });
      }

      res.redirect('/');
    });
  },
  logout: function(req, res, next) {
    req.logout();
    res.redirect('/');
  }
}
