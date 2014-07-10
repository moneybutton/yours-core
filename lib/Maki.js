var fs = require('fs');

var Maki = function( app ) {
  var self = this;

  self.app = app;
  self.models      = [];
  self.views       = [];
  self.controllers = [];
  
  var path = __dirname + '/../app/';
  
  async.waterfall([
    // Models
    function(callback) {
      fs.readdir( path + 'models' , function(err, files) {
        if (err) { throw new Error(err); }
        
        files.forEach(function(fileName) {
          var file = path + 'models/' + fileName;
          self.models.push( require( file )[ fileName.slice( 0 , -3) ] );
        });
        
        callback( null );
        
      });
    }
  ], function(err, results) {
    console.log('application setup complete: ' /*/, self.models/**/ );
  });
  
}

Maki.prototype.start = function() {
  this.app.start();
}

module.exports = Maki;
