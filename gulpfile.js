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
let karma = require('gulp-karma')
let plumber = require('gulp-plumber')
let browserSync = require('browser-sync').create()

let jsfiles = ['*.js', 'bin/*.js', 'views/**/*.js', 'views/**/*.jsx', 'lib/**/*.js', 'test/**/*.js']

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

function build_workerpool () {
  return new Promise(function (resolve, reject) {
    fs.createReadStream(path.join(__dirname, 'node_modules', 'workerpool', 'dist', 'workerpool.js'))
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_WORKERPOOL_FILE)))
      .on('close', function () { resolve() })
  })
}

gulp.task('build-workerpool', function () {
  return build_workerpool()
})

function build_worker () {
  return new Promise(function (resolve, reject) {
    browserify({debug: false})
      // The polyfill needs to be included exactly once per page. We put it in
      // the worker and in the bundle.
      .add(require.resolve('babelify/polyfill'))
      .transform(envify)
      .transform(babelify)
      .add(require.resolve('./lib/worker.js'), {entry: true})
      .bundle()
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_WORKER_FILE)))
      .on('close', function () { resolve() })
  })
}

gulp.task('build-worker', ['build-workerpool'], function () {
  return build_worker()
})

function build_core () {
  return new Promise(function (resolve, reject) {
    browserify({debug: false})
      // The polyfill needs to be included exactly once per page. We put it in
      // the worker and in the bundle.
      .add(require.resolve('babelify/polyfill'))
      .transform(envify)
      .transform(babelify)
      .require(require.resolve('./lib/index.js'), {entry: true})
      .bundle()
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_BUNDLE_FILE)))
      .on('close', function () { resolve() })
  })
}

gulp.task('build-core', ['build-worker'], function () {
  return build_core()
})

function build_react () {
  return new Promise(function (resolve, reject) {
    browserify({debug: false})
      // Do not include the polyfill - it is already included by datt-core.js
      .transform('reactify')
      .transform(babelify)
      .add(require.resolve('./views/index.js'), {entry: true})
      .bundle()
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_REACT_JS_FILE)))
      .on('close', function () { resolve() })
  })
}

gulp.task('build-react', function () {
  return build_react()
})

function build_tests () {
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
}

gulp.task('build-tests', ['build-core', 'build-worker'], function () {
  return build_tests()
})

gulp.task('build-mocha', function () {
  // copy the mocha js and css files to our build directory so you can use them
  // in the tests HTML file
  let p1 = new Promise(function (resolve, reject) {
    fs.createReadStream(path.join(__dirname, 'node_modules', 'mocha', 'mocha.js'))
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', 'mocha.js')))
      .on('close', resolve)
      .on('error', reject)
  })
  let p2 = new Promise(function (resolve, reject) {
    fs.createReadStream(path.join(__dirname, 'node_modules', 'mocha', 'mocha.css'))
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', 'mocha.css')))
      .on('close', resolve)
      .on('error', reject)
  })
  return p1.then(function () {
    return p2
  })
})

gulp.task('build', ['build-react', 'build-core', 'build-tests', 'build-mocha'])

gulp.task('watch-build', ['build'], function () {
  gulp.watch(jsfiles, ['build'])
})

function test_node (end) {
  return gulp.src(['./test/*.js'])
    .pipe(plumber()) // keeps gulp from crashing when there is an exception
    .pipe(mocha({reporter: 'dot'}))
    .once('end', function () {
      if (end) {
        process.exit()
      }
    })
}

gulp.task('test-node', function () {
  return test_node(true)
})

gulp.task('watch-test-node', function () {
  // runs the mocha node tests and runs js standard on all the files
  watch(jsfiles, function () {
    exec('node_modules/.bin/standard *.js ./views/**/*.js ./views/**/*.jsx ./lib/**/*.js ./test/**/*.js', {cwd: __dirname}, function (err, stdout, stderr) {
      if (err) {
        console.log(stdout)
      }
      test_node()
    })
  })
})

gulp.task('build-karma-url', function () {
  // karma serves static files, including js files, from /base/
  process.env.DATT_JS_BASE_URL = '/base/'
})

gulp.task('build-karma', ['build-karma-url', 'build'])

gulp.task('test-karma', ['build-karma'], function () {
  return gulp.src([])
    .pipe(karma({
      configFile: '.karma.conf.js',
      action: 'run'
    }))
})

gulp.task('watch-test-karma', function () {})

gulp.task('build-browsersync', ['build'], function () {
  browserSync.reload()
})

gulp.task('test-serve', function () {
  browserSync.init({
    server: {
      baseDir: './build',
      port: 3000
    },
    open: false // don't automatically open browser window
  })

  gulp.watch(jsfiles, ['build-browsersync'])
})

gulp.task('default', ['build'])
