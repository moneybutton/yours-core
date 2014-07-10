var http = require('http');
var app = require('express')();
var server = http.createServer(app);

// frameworks
var rack     = require('asset-rack'); // minification / concatenation of assets
var mongoose = require('mongoose');   // manage 
var flashify = require('flashify');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BitAuthStrategy = require('passport-bitauth').Strategy;
var passportLocalMongoose = require('passport-local-mongoose');

// utility
var pathToRegex = require('path-to-regexp');

// config
var config = require('./config');
var database = require('./db');

/* Models represent the data your application keeps. */
/* You'll need at least the Person model if you want to 
	allow users to login */
Person = require('./app/models/Person').Person;
Forum  = require('./app/models/Forum').Forum;
Topic  = require('./app/models/Topic').Topic;
Post   = require('./app/models/Post').Post;

// set up controlers for various resources
people   = require('./app/controllers/people');
forums   = require('./app/controllers/forums');
topics   = require('./app/controllers/topics');
posts    = require('./app/controllers/posts');

// common utilities
_     = require('underscore');
async = require('async');

var Maki = require('./lib/Maki');
var maki = new Maki( app );

// make the HTML output readible, for designers. :)
app.locals.pretty = true;
app.locals.markdown = require('marked');

/* use AssetRack to minify and cache static objects */
var assets = new rack.Rack([
  new rack.JadeAsset({
      url: '/js/templates.js',
      dirname: './app/views',
      // strip out layouts (we don't want them)
      beforeCompile: function( input ) {
        return input.replace(/extends (.*)\n/, '');
      }
  }),
  new rack.StaticAssets({
    urlPrefix: '/',
    dirname: __dirname + '/public'
  }),
  new rack.LessAsset({
    url: '/css/bootstrap.css',
    filename: __dirname + '/private/less/bootstrap.less'
  }),
  new rack.LessAsset({
    url: '/css/font-awesome.css',
    filename: __dirname + '/private/less/fontawesome/font-awesome.less'
  }),
  new rack.LessAsset({
    url: '/css/maki.css',
    filename: __dirname + '/private/less/maki.less'
  }),
  /*/new rack.DynamicAssets({
    type: rack.LessAsset,
    urlPrefix: '/css',
    dirname: __dirname + '/private/css'
  })/**/
]);
app.use( assets.handle );

// jade is the default templating engine.
app.engine('jade', require('jade').__express);
/* configure the application to use jade, with a specified path for views */
app.set('view engine', 'jade');
app.set('views', __dirname + '/app/views' );

var redis = require('redis');
var redisClient = redis.createClient( config.redis.port , config.redis.host );
var session = require('express-session');
var RedisStore = require('connect-redis')( session );

// set up middlewares for session handling
app.use( require('cookie-parser')( config.sessions.secret ) );
app.use( require('body-parser')() );
app.use( session({
    store: new RedisStore({
      client: redisClient
    })
  , secret: config.sessions.secret
}));

/* Configure the registration and login system */
app.use(passport.initialize());
app.use(passport.session());

/* enable "local" login (e.g., username and password) */
passport.use(new LocalStrategy( Person.authenticate() ) );
passport.use(new BitAuthStrategy(function() {}) );

passport.serializeUser( Person.serializeUser() );
passport.deserializeUser( Person.deserializeUser() );

/* configure some local variables for use later */
app.use(function(req, res, next) {
  // set a user context (from passport)
  res.locals.user = req.user || null;
  next();
});
app.use( require('provide') );

app.resources = {};
var resource = {
  define: function( spec ) {
    /* define required fields */
    ['name', 'path'].forEach(function(prop) {
      if (!spec[prop]) {
        throw new Error('"' + prop + '" is required to create an endpoint.');
      }
    });

    ['get', 'put', 'post', 'delete'].forEach(function(method) {
      if (spec[ method ]) {
        
        // bind the function (if defined) in Express
        app[ method ]( spec.path , spec[method] );
        
        // build a regex for later pattern matching (mainly websockets)
        spec.regex = pathToRegex( spec.path );
        
        // build a map of resource names to their available methods
        if (!app.resources[ spec.name ]) { app.resources[ spec.name ] = spec; }
        app.resources[ spec.name ][ method ] = spec[ method ];

      }
    });
  }
}

var resources = [
    {
      name: 'index',
      path: '/',
      template: 'index',
      get: function(req, res) {
        
        Forum.find().exec(function(err, forums) {
          res.provide('index', {
            forums: forums,
            index: Object.keys( app.resources ).map(function(k) {
              return app.resources[ k ];
            })
          });
        });
        

      }}  
  , { name: 'registrationForm', path: '/register',           template: 'register', get: people.forms.register }
  , { name: 'loginForm',        path: '/login',              template: 'login',    get: people.forms.login }
  , { name: 'destroySession' ,  path: '/logout' ,            template: 'index',    get: people.logout }
  , { name: 'people',           path: '/people',             template: 'people',   get: people.list , post: people.create }
  , { 
      name: 'person',
      path: '/people/:personSlug',
      template: 'person',
      get: people.view,
      put: people.edit
    }
  , { 
      name: 'personEdit',
      path: '/people/:personSlug/edit',
      template: 'person',
      post: people.edit
    }
  , {
      name: 'forums',
      path: '/forums' ,
      template: 'forums',
      get: forums.list,
      post: forums.create
    }
  , {
      name: 'forum',
      path: '/forums/:forumSlug' ,
      template: 'forum',
      get: forums.view
    }
  , {
      name: 'topics',
      path: '/forums/:forumSlug/topics' ,
      template: 'forum-topics',
      get: topics.list,
      post: topics.create
    }
  , {
      name: 'topic',
      path: '/forums/:forumSlug/topics/:topicSlug' ,
      template: 'topic',
      get: topics.view
    }
  , {
      name: 'posts',
      path: '/forums/:forumSlug/topics/:topicSlug/posts' ,
      template: 'forum-topics',
      get: posts.list,
      post: posts.create
    }
];

resources.forEach(function(r) {
  resource.define( r );
});

// TODO: build a middleware chain for resources
app.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/');
});

// catch-all route (404)
app.get('*', function(req, res) {
  res.status(404).render('404');
});

// prepare the websocket server
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
  server: server
});
// TODO: bind this to redis / other pubsub arch
wss.on('connection', function(ws) {
  // determine appropriate resource / handler
  for (var name in app.resources) {
    var resource = app.resources[ name ];
    // test if this resource should handle the request...
    if ( resource.regex.test( ws.upgradeReq.url ) ) {
      console.log('socket to be handled by resource: ' , resource.name );
      // TODO: sub with redis
      return; // exit the 'connection' handler
      break;
    }
  }
  console.log('none');
});

server.listen( config.services.http.port , function() {
  console.log('Demo application is now listening on http://localhost:' + config.services.http.port + ' ...');
});
