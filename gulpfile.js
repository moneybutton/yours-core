'use strict'
let gulp = require('gulp')
let exec = require('child_process').exec
let mocha = require('gulp-mocha')
let glob = require('glob')
let path = require('path')
let fs = require('fs')
let browserify = require('browserify')
let envify = require('envify')
let babelify = require('babelify')
let watch = require('gulp-watch')
let plumber = require('gulp-plumber')
let karma = require('gulp-karma')

// By default, we assume browser-loaded javascript is served from the root
// directory, "/", of the http server. karma, however, assumes files are in the
// "/base/" directory, thus we invented this letiable to allow overriding the
// directory. If you wish to put your javascript somewhere other than root,
// specify it by setting this environment letiable before building. Some people
// will also need it if they need to put their js in some specific location.
if (!process.env.DATT_JS_BASE_URL) {
  process.env.DATT_JS_BASE_URL = '/'
}

if (!process.env.DATT_CORE_JS_BUNDLE_FILE) {
  process.env.DATT_CORE_JS_BUNDLE_FILE = 'datt-core.js'
}

if (!process.env.DATT_CORE_JS_WORKER_FILE) {
  process.env.DATT_CORE_JS_WORKER_FILE = 'datt-core-worker.js'
}

if (!process.env.DATT_CORE_JS_WORKERPOOL_FILE) {
  process.env.DATT_CORE_JS_WORKERPOOL_FILE = 'datt-core-workerpool.js'
}

if (!process.env.DATT_JS_TESTS_FILE) {
  process.env.DATT_JS_TESTS_FILE = 'datt-tests.js'
}

if (!process.env.DATT_REACT_JS_FILE) {
  process.env.DATT_REACT_JS_FILE = 'datt-react.js'
}

gulp.task('build-workerpool', function () {
  return fs.createReadStream(path.join(__dirname, 'node_modules', 'workerpool', 'dist', 'workerpool.js'))
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_WORKERPOOL_FILE)))
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
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_WORKER_FILE)))
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
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_BUNDLE_FILE)))
})

gulp.task('build-react', function () {
  return browserify({debug: false})
    // Do not include the polyfill - it is already included by datt-core.js
    .transform('reactify')
    .transform(babelify)
    .add(require.resolve('./views/index.js'), {entry: true})
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
        .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_JS_TESTS_FILE)))
    })
  })
})

gulp.task('test-node', function () {
  // This runs the mocha tests, but does not run the js standard tests. To run
  // both, run "npm run test-node"
  return gulp.src(['./test/*.js'])
    .pipe(mocha({reporter: 'dot'}))
    .once('end', function () {
      process.exit()
    })
})

gulp.task('watch-test-node', function (callback) {
  // This will watch the lib and test files and will run both the mocha tests
  // and js standard tests - ideal for working on the logic of the p2p app in
  // node
  watch(['./lib/**/*.js', './test/**/*.js'], function () {
    exec('node_modules/.bin/standard ./lib/**/*.js ./test/**/*.js', {cwd: __dirname}, function (err, stdout, stderr) {
      if (err) {
        console.log(err)
      }
      console.log(stdout)
      gulp.src(['./test/*.js'])
        .pipe(plumber())
        .pipe(mocha({reporter: 'dot'}))
    })
  })
})

gulp.task('build-karma-url', function () {
  // karma serves static files, including js files, from /base/
  process.env.DATT_JS_BASE_URL = '/base/'
})

gulp.task('build-karma', ['build-karma-url', 'build-tests'])

gulp.task('test-karma', ['build-karma'], function () {
  return gulp.src([])
    .pipe(karma({
      configFile: '.karma.conf.js',
      action: 'run'
    }))
    .on('error', function (err) {
      throw err
    })
    .on('end', function () {
      process.exit()
    })
})

gulp.task('default', ['build-react', 'build-bundle', 'build-tests'])
