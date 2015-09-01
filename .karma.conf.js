module.exports = function(config) {
  config.set({

    basePath: 'public',

    // Increase timeout from 2000 to 20000 ms, since the content store seems to
    // cause timeout-based disconnects frequently.
    browserDisconnectTimeout: 20000,

    // Increase tolerance for disconnects, to account for content store-related
    // disconnects.
    // browserDisconnectTolerance: 5,

    frameworks: ['mocha'],

    files: [
      {pattern: 'datt-node.js', watched: true, included: false, served: true},
      {pattern: 'datt-node-worker.js', watched: true, included: false, served: true},
      {pattern: 'datt-node-workerpool.js', watched: true, included: false, served: true},
      {pattern: 'datt-node-tests.js'}
    ],

    client: {
      mocha: {
        reporter: 'html', // change Karma's debug.html to the mocha web reporter
        ui: 'bdd'
      }
    },

    browsers: ['Chrome'],

    singleRun: true
  })
}
