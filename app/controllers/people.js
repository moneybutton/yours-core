module.exports = {
  edit: function(req, res, next) {
    Person.findOne({ slug: req.param('personSlug') }).exec(function(err, person) {
      if (err) { console.log(err); }
      if (!person) { return next(); }
      
      person.bio = req.param('bio') || person.bio;
      person.save(function(err) {
        if (err) { console.log(err); next(err); }
        
        res.redirect('/people/' + person.slug );
        
      });
      
    });
  },
  list: function(req, res, next) {
    Person.find().exec(function(err, people) {
      if (err) { console.log(err); }
      res.provide( 'people', {
        people: people
      });
    });
  },
  view: function(req, res, next) {
    Person.findOne({ slug: req.param('personSlug') }).exec(function(err, person) {
      if (err) { console.log(err); }
      if (!person) { return next(); }
      
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
