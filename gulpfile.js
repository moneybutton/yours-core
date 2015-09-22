'use strict'
let q = require('q')
let gulp = require('gulp')
let mocha = require('gulp-mocha')
let through = require('through2')
let globby = require('globby')
let path = require('path')
let fs = require('fs')
let browserify = require('browserify')
let envify = require('envify')
let babelify = require('babelify')

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

gulp.task('build-tests', ['build-worker'], function () {
  let bundledStream = through()
  q.nfbind(globby)(['./test/*.js']).done(function (entries) {
    let b = browserify({debug: false})
      .transform(envify)
      .transform(babelify)

    for (let file of entries) {
      b.add(file)
    }

    b.bundle()
      .pipe(bundledStream)
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_NODE_JS_TESTS_FILE)))
  })
  return bundledStream
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

gulp.task('default', ['build-bundle', 'build-tests'])
