/* This file is a config, that exposes various
   meaningful values to the rest of the application.
   This is done using the module.exports function,
   which sets them when require('./thisfile') is run. */

module.exports = {
  services: {
    http: {
      port: process.env.CONVERSE_HTTP_PORT || 9200
    }
  },
  database: {
      name: process.env.CONVERSE_DATABASE_NAME || 'converse'
    , uri:  process.env.CONVERSE_DATABASE_URI  || 'localhost' 
  },
  sessions: {
      enabled: process.env.CONVERSE_SESSIONS_ENABLE || true
    , secret:  process.env.CONVERSE_SESSIONS_SECRET || 'this can be any random string, you can even use this one. :)'
  },
  redis: {
      host: process.env.CONVERSE_REDIS_HOST || 'localhost'
    , port: process.env.CONVERSE_REDIS_PORT || 6379
  },
  auth: {
    local: {
      enabled: true
    }
  }
};
