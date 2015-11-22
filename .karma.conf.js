module.exports = function (config) {
  config.set({
    basePath: 'build',

    frameworks: ['mocha'],

    files: [
      {pattern: 'datt-core.js', watched: true, included: true, served: true},
      {pattern: 'datt-core-worker.js', watched: true, included: false, served: true},
      {pattern: 'datt-core-workerpool.js', watched: true, included: false, served: true},
      {pattern: 'datt-react.js', watched: true, included: false, served: true},
      {pattern: 'datt-tests.js'}
    ],

    client: {
      mocha: {
        reporter: 'html', // change Karma's debug.html to the mocha web reporter
        ui: 'bdd'
      }
    },

    browsers: ['Firefox'],

    singleRun: true,

    proxies: {
      '/blockchain-api': 'http://localhost:3030/blockchain-api'
    }
  })
}
