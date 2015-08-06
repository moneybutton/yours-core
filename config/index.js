/* This file is a config, that exposes various
   meaningful values to the rest of the application.
   This is done using the module.exports function,
   which sets them when require('./thisfile') is run. */

module.exports = {
  service: {
    name: 'datt',
    icon: 'comment',
    namespace: 'datt',
    mission: 'Simple, open-source, uncensorable conversations.',
    description: 'Want a place to share ideas and have discussions?  Keep in a place that can\'t be killed.',
    source: 'https://github.com/dattnetwork/datt',
    points: [
      {
        header: 'Open Source',
        description: 'Edit, modify, and improve the features and functionality of the platform.  It\'s open source.'
      },
      {
        header: 'Simple is beautiful.',
        description: 'Rethought, cleaned, and very direct.  No cruft from supporting legacy crap.'
      },
      {
        header: 'Already registered?',
        description: 'Go on then.  Get logged in.  You\'re _groovy_.',
        action: {
          text: 'Log In &raquo;',
          link: '/sessions'
        }
      }
    ],
  },
  services: {
    http: {
      port: process.env.DATT_HTTP_PORT || 3000
    }
  },
  database: {
    name: process.env.DATT_DATABASE_NAME || 'datt',
    uri:  process.env.DATT_DATABASE_URI  || 'localhost'
  },
  sessions: {
    enabled: process.env.DATT_SESSIONS_ENABLE || true,
    secret:  process.env.DATT_SESSIONS_SECRET || 'this can be any random string, you can even use this one. :)'
  },
  redis: {
    host: process.env.DATT_REDIS_HOST || 'localhost',
    port: process.env.DATT_REDIS_PORT || 6379
  },
  auth: {
    local: {
      enabled: true
    }
  }
};
