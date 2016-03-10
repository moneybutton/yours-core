'use strict'
let asink = require('asink')
let babel_core_register = require('babel-core/register')
let babelify = require('babelify')
let browserSyncCreator = require('browser-sync')
let browserify = require('browserify')
let createAppServer = require('./server/app').createAppServer
let createRendezvousServer = require('./server/rendezvous').createRendezvousServer
let envify = require('envify')
let fs = require('fs')
let glob = require('glob')
let gulp = require('gulp')
let gulp_mocha = require('gulp-mocha')
let gulp_plumber = require('gulp-plumber')
let karma = require('gulp-karma')
let path = require('path')

require('./config')

function task_build_fullnode_worker () {
  // the fullnode config sets environment variables necessary to use fullnode
  // if they are not already set in he environment.
  require('fullnode/config')

  return browserify({debug: false})
    .transform(envify)
    .transform(babelify.configure({ignore: /node_modules/, presets: ['es2015']}))
    .require(require.resolve('fullnode/lib/worker-browser.js'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.FULLNODE_JS_WORKER_FILE)))
}

gulp.task('build-fullnode-worker', task_build_fullnode_worker)

function task_build_fullnode () {
  require('fullnode/config')
  return browserify({debug: false})
    .add(require.resolve('babel-polyfill'))
    .transform(envify)
    .transform(babelify.configure({presets: ['es2015']}))
    .add(require.resolve('fullnode'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.FULLNODE_JS_BUNDLE_FILE)))
}

gulp.task('build-fullnode', task_build_fullnode)

function task_build_dattcore () {
  require('./config')

  return browserify({debug: false})
    .external('fullnode')
    // Do not include the polyfill - it is already included by fullnode.js
    .transform(envify)
    .transform(babelify.configure({ignore: /node_modules/, presets: ['es2015']}))
    .require(require.resolve('./core'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_BUNDLE_FILE)))
}

gulp.task('build-dattcore', task_build_dattcore)

function task_build_css () {
  return fs.createReadStream(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.css'))
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', 'bootstrap.css')))
}

gulp.task('build-css', task_build_css)

function task_build_dattreact () {
  return browserify({debug: false})
    // Do not include the polyfill - it is already included by fullnode.js
    .transform('reactify')
    .transform(babelify, {presets: ['es2015', 'react'], sourceMaps: false})
    .add(require.resolve('./react/index.js'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_REACT_JS_FILE)))
}

gulp.task('build-dattreact', task_build_dattreact)

function task_build_mocha () {
  return asink(function *() {
    // copy the mocha js and css files to our build directory so you can use them
    // in the tests HTML file
    yield new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, 'node_modules', 'mocha', 'mocha.js'))
        .pipe(fs.createWriteStream(path.join(__dirname, 'build', 'mocha.js')))
        .on('close', resolve)
        .on('error', reject)
    })
    yield new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, 'node_modules', 'mocha', 'mocha.css'))
        .pipe(fs.createWriteStream(path.join(__dirname, 'build', 'mocha.css')))
        .on('close', resolve)
        .on('error', reject)
    })
  }, this)
}

gulp.task('build-mocha', task_build_mocha)

function task_build_tests () {
  return new Promise((resolve, reject) => {
    glob('./test/**/*+(.js|.jsx)', {}, (err, files) => {
      if (err) {
        reject(err)
        return
      }
      let b = browserify({debug: false})
      b.transform(envify)
        .transform(babelify, {presets: ['es2015', 'react'], sourceMaps: false})
        .ignore('jsdom')
      for (let file of files) {
        b.add(file)
      }
      b.bundle()
        .on('error', reject)
        .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_JS_TESTS_FILE)))
        .on('finish', resolve)
    })
  })
}

gulp.task('build-tests', task_build_tests)

gulp.task('build', ['build-fullnode-worker', 'build-fullnode', 'build-dattcore', 'build-dattreact', 'build-mocha', 'build-tests'])

gulp.task('build-karma-url', () => {
  // karma serves static files, including js files, from /base/
  process.env.FULLNODE_JS_BASE_URL = '/base/'
  process.env.DATT_JS_BASE_URL = '/base/'
})

gulp.task('build-karma', ['build-karma-url', 'build'])

function task_test_karma () {
  let rendezvousServer = createRendezvousServer(3031)
  let appServer = createAppServer(3030)
  return gulp.src([])
    .pipe(karma({
      configFile: '.karma.conf.js',
      action: 'run'
    }))
    .on('error', () => {
      process.exit(1)
    })
    .on('end', () => {
      rendezvousServer.close()
      appServer.close()
      process.exit()
    })
}

gulp.task('test-karma', ['build-karma'], task_test_karma)

function task_test_node () {
  return gulp.src(['./test/*.js', './test/**/*.js', './test/**/*.jsx'])
    .pipe(gulp_plumber()) // keeps gulp from crashing when there is an exception
    .pipe(gulp_mocha({
      reporter: 'dot',
      require: ['fullnode'],
      compilers: {
        jsx: babel_core_register
      }
    }))
}

gulp.task('test-node', task_test_node)

function task_serve () {
  // Create two rendezvous servers, one for the tests and one for the UI, so
  // that network connections do not overlap
  createRendezvousServer(3031) // For the tests (i.e., localhost:3040/tests.html)
  createRendezvousServer(3032) // For the UI (i.e., localhost:3040)

  // One app server, that delivers the app and the tests file
  createAppServer(3030)

  let config = {
    ui: false,
    proxy: 'http://localhost:3030',
    open: false // don't automatically open browser window
  }

  let browserSyncs = []
  browserSyncs['3040'] = browserSyncCreator.create()
  browserSyncs['3041'] = browserSyncCreator.create()
  browserSyncs['3042'] = browserSyncCreator.create()
  browserSyncs['3043'] = browserSyncCreator.create()
  browserSyncs['3044'] = browserSyncCreator.create()

  console.log('browser-sync proxy on ports 3040 - 3044')
  console.log('Make sure you also built the browser files with "gulp build"')
  browserSyncs['3040'].init(Object.assign({port: 3040}, config))
  browserSyncs['3041'].init(Object.assign({port: 3041}, config))
  browserSyncs['3042'].init(Object.assign({port: 3042}, config))
  browserSyncs['3043'].init(Object.assign({port: 3043}, config))
  browserSyncs['3044'].init(Object.assign({port: 3044}, config))
}

gulp.task('serve', task_serve)

gulp.task('default', ['build'])
