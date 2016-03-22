module.exports = function (config) {
  config.set({
    basePath: 'build',

    frameworks: ['mocha'],

    files: [
      {pattern: 'fullnode-worker.js', watched: true, included: false, served: true},
      {pattern: 'fullnode.js', watched: true, included: true, served: true},
      {pattern: 'datt.js', watched: true, included: true, served: true},
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
      '/blockchainapi': 'http://localhost:3030/blockchainapi'
    }
  })
}
