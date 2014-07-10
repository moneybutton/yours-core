var config = require('./config')
var mongoose = require('mongoose');

/* connect mongoose to the database */
mongoose.connect( config.database.uri , config.database.name );

/* export a copy of mongoose */
exports.mongoose = mongoose;
