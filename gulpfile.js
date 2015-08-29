var q = require('q')
var gulp = require('gulp')
var mocha = require('gulp-mocha')
var karma = require('gulp-karma')
var globby = require('globby')
var path = require('path')
var fs = require('fs')
var browserify = require('browserify')
var envify = require('envify')

// By default, we assume browser-loaded javascript is served from the root
// directory, "/", of the http server. karma, however, assumes files are in the
// "/base/" directory, thus we invented this variable to allow overriding the
// directory. If you wish to put your javascript somewhere other than root,
// specify it by setting this environment variable before building.
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
    .pipe(fs.createWriteStream(path.join(__dirname, 'public', process.env.DATT_NODE_JS_WORKERPOOL_FILE)))
})

gulp.task('build-worker', ['build-workerpool'], function () {
  return browserify({debug: false})
    .transform(envify)
    .require(require.resolve('./lib/worker.js'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'public', process.env.DATT_NODE_JS_WORKER_FILE)))
})

gulp.task('build-bundle', ['build-worker'], function () {
  return browserify({debug: false})
    .transform(envify)
    .require(require.resolve('./index.js'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'public', process.env.DATT_NODE_JS_BUNDLE_FILE)))
})

gulp.task('build-tests', ['build-worker'], function () {
  return q.nfbind(globby)(['./test/*.js']).done(function (entries) {
    browserify({entries: entries, debug: false})
      .transform(envify)
      .bundle()
      .pipe(fs.createWriteStream(path.join(__dirname, 'public', process.env.DATT_NODE_JS_TESTS_FILE)))
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

gulp.task('test-karma', ['build-karma'], function () {
  var server = require(path.join(__dirname, 'bin', 'testapp')).server // runs the PeerJS server
  return gulp.src([])
    .pipe(karma({
      configFile: '.karma.conf.js',
      action: 'run'
    }))
    .on('error', function (err) {
      throw err
    })
    .on('end', function () {
      server.close()
      process.exit()
    })
})

gulp.task('default', ['build-bundle', 'build-tests'])
