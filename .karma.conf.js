// Karma configuration
// Generated on Tue Jan 06 2015 16:30:03 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    frameworks: ['mocha'],

    files: [
      {pattern: 'public/tests.js'}
    ],

    client: {
      mocha: {
        reporter: 'html', // change Karma's debug.html to the mocha web reporter
        ui: 'bdd'
      }
    },

    browsers: ['Chrome'],

    singleRun: true
  });
};
