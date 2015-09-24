'use strict'
let gulp = require('gulp')
let mocha = require('gulp-mocha')
let glob = require('glob')
let path = require('path')
let fs = require('fs')
let browserify = require('browserify')
let envify = require('envify')
let babelify = require('babelify')
let reactify = require('reactify')

// By default, we assume browser-loaded javascript is served from the root
// directory, "/", of the http server. karma, however, assumes files are in the
// "/base/" directory, thus we invented this letiable to allow overriding the
// directory. If you wish to put your javascript somewhere other than root,
// specify it by setting this environment letiable before building. karma is
// disabled for now, but if we ever add it back we will need this. Some people
// will also need it if they need to put their js in some specific location.
if (!process.env.DATT_NODE_JS_BASE_URL) {
  process.env.DATT_NODE_JS_BASE_URL = '/'
}

if (!process.env.DATT_NODE_JS_BUNDLE_FILE) {
  process.env.DATT_NODE_JS_BUNDLE_FILE = 'datt-node.js'
}

if (!process.env.DATT_NODE_JS_WORKER_FILE) {
  process.env.DATT_NODE_JS_WORKER_FILE = 'datt-node-worker.js'
}

if (!process.env.DATT_NODE_JS_WORKERPOOL_FILE) {
  process.env.DATT_NODE_JS_WORKERPOOL_FILE = 'datt-node-workerpool.js'
}

if (!process.env.DATT_NODE_JS_TESTS_FILE) {
  process.env.DATT_NODE_JS_TESTS_FILE = 'datt-node-tests.js'
}

if (!process.env.DATT_REACT_JS_FILE) {
  process.env.DATT_REACT_JS_FILE = 'datt-react.js'
}

gulp.task('build-workerpool', function () {
  return fs.createReadStream(path.join(__dirname, 'node_modules', 'workerpool', 'dist', 'workerpool.js'))
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_NODE_JS_WORKERPOOL_FILE)))
})

gulp.task('build-worker', ['build-workerpool'], function () {
  return browserify({debug: false})
    // The polyfill needs to be included exactly once per page. We put it in
    // the worker and in the bundle.
    .add(require.resolve('babelify/polyfill'))
    .transform(envify)
    .transform(babelify)
    .add(require.resolve('./lib/worker.js'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_NODE_JS_WORKER_FILE)))
})

gulp.task('build-bundle', ['build-worker'], function () {
  return browserify({debug: false})
    // The polyfill needs to be included exactly once per page. We put it in
    // the worker and in the bundle.
    .add(require.resolve('babelify/polyfill'))
    .transform(envify)
    .transform(babelify)
    .require(require.resolve('./lib/index.js'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_NODE_JS_BUNDLE_FILE)))
})

gulp.task('build-react', function () {
  return browserify({debug: false})
    // Do not include the polyfill - it is already included by datt-node.js
    .transform(reactify)
    .transform(babelify)
    .add(require.resolve('./views/app.js'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_REACT_JS_FILE)))
})

gulp.task('build-tests', ['build-worker'], function () {
  return new Promise(function (resolve, reject) {
    glob('./test/**/*.js', {}, function (err, files) {
      if (err) {
        reject(err)
        return
      }
      let b = browserify({debug: true})
        .transform(envify)
        .transform(babelify)
      for (let file of files) {
        b.add(file)
      }
      b.bundle()
        .on('error', function (err) { reject(err) })
        .on('end', function () { resolve() })
        .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_NODE_JS_TESTS_FILE)))
    })
  })
})

gulp.task('test-node', function () {
  return gulp.src(['./test/*.js'])
    .pipe(mocha({reporter: 'list'}))
    .once('end', function () {
      process.exit()
    })
})

gulp.task('build-karma-url', function () {
  // karma serves static files, including js files, from /base/
  process.env.DATT_NODE_JS_BASE_URL = '/base/'
})

gulp.task('build-karma', ['build-karma-url', 'build-tests'])

gulp.task('watch', function () {
  gulp.watch(['./lib/*.js', './test/*.js'], ['build-tests'])
})

gulp.task('default', ['build-react', 'build-bundle', 'build-tests'])
