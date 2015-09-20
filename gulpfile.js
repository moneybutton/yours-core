var q = require('q')
var gulp = require('gulp')
var mocha = require('gulp-mocha')
var through = require('through2')
var globby = require('globby')
var path = require('path')
var fs = require('fs')
var browserify = require('browserify')
var envify = require('envify')

// By default, we assume browser-loaded javascript is served from the root
// directory, "/", of the http server. karma, however, assumes files are in the
// "/base/" directory, thus we invented this variable to allow overriding the
// directory. If you wish to put your javascript somewhere other than root,
// specify it by setting this environment variable before building. karma is
// disabled for now, but if we ever add it back we will need this. Some people
// will also need it if they need to put their js in some specific location.
if (!process.env.DATT_NODE_JS_BASE_URL) {
  process.env.DATT_NODE_JS_BASE_URL = '/'
}

if (!process.env.DATT_NODE_JS_BUNDLE_FILE) {
  process.env.DATT_NODE_JS_BUNDLE_FILE = 'datt-node.js'
}

if (!process.env.DATT_NODE_JS_TESTS_FILE) {
  process.env.DATT_NODE_JS_TESTS_FILE = 'datt-node-tests.js'
}

gulp.task('build-bundle', function () {
  return browserify({debug: false})
    .transform(envify)
    .require(require.resolve('./lib/index.js'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'browser', process.env.DATT_NODE_JS_BUNDLE_FILE)))
})

gulp.task('build-tests', function () {
  var bundledStream = through()
  q.nfbind(globby)(['./test/*.js']).done(function (entries) {
    browserify({entries: entries, debug: false})
      .transform(envify)
      .bundle()
      .pipe(bundledStream)
      .pipe(fs.createWriteStream(path.join(__dirname, 'browser', process.env.DATT_NODE_JS_TESTS_FILE)))
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
