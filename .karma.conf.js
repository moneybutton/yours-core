module.exports = function(config) {
  config.set({

    basePath: 'public',

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
