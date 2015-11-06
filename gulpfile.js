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
let browserSyncCreator = require('browser-sync')
let watchify = require('watchify')
let jsx_require_extension = require('jsx-require-extension')
let gutil = require('gulp-util')
let q = require('q')
let testapp = require('./bin/testapp')

let browserSyncs = []
browserSyncs['3040'] = browserSyncCreator.create()
browserSyncs['3041'] = browserSyncCreator.create()
browserSyncs['3042'] = browserSyncCreator.create()
browserSyncs['3043'] = browserSyncCreator.create()
browserSyncs['3044'] = browserSyncCreator.create()

let jsfiles = ['*.js', 'bin/*.js', 'views/**/*.js', 'views/**/*.jsx', 'lib/**/*.js', 'test/**/*.js', 'test/**/*.jsx']
let cssfiles = ['build/main.css']
let allfiles = [].concat(jsfiles).concat(cssfiles)

let browserifyOpts

// For some weird reason, while watching files, they appear not to exist
// immediately after noticing they've changed. Thus we set a timeout not to
// rebuild bundles for a brief period after a file has changed. If this timeout
// isn't set, there will often be a "file doesn't exist" error while rebuilding
// bundles that depend on the changed files. At least, that's what happens on
// Linux - presumably this is a platform issue.
let watchifytimeout = 1000

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
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, 'node_modules', 'workerpool', 'dist', 'workerpool.js'))
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_WORKERPOOL_FILE)))
      .on('close', resolve)
  })
}

gulp.task('build-workerpool', function () {
  return build_workerpool()
})

browserifyOpts = {debug: false}
browserifyOpts = Object.assign({}, watchify.args, browserifyOpts)
let build_worker_browserify

function set_build_worker_browserify () {
  build_worker_browserify = watchify(browserify(browserifyOpts))
  build_worker_browserify
    // The polyfill needs to be included exactly once per page. We put it in
    // the worker and in the bundle.
    .add(require.resolve('babel-polyfill'))
    .transform(envify)
    .transform(babelify, {presets: ['es2015', 'react']})
    .add(require.resolve('./lib/worker.js'), {entry: true})
}

set_build_worker_browserify()

function build_worker () {
  return new Promise((resolve, reject) => {
    q.delay(watchifytimeout).then(() => {
      build_worker_browserify
        .bundle()
        .on('error', err => {
          gutil.log.bind(gutil, 'Browserify Error')
          build_worker_browserify.close()
          set_build_worker_browserify()
          reject(err)
        })
        .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_WORKER_FILE)))
        .once('finish', resolve)
        .once('error', reject)
    })
  })
}

gulp.task('build-worker', ['build-workerpool'], function () {
  return build_worker()
})

browserifyOpts = {debug: false}
browserifyOpts = Object.assign({}, watchify.args, browserifyOpts)
let build_core_browserify

function set_build_core_browserify () {
  build_core_browserify = watchify(browserify(browserifyOpts))
  build_core_browserify
    .on('error', gutil.log.bind(gutil, 'Unknown Error'))
    // The polyfill needs to be included exactly once per page. We put it in
    // the worker and in the bundle.
    .add(require.resolve('babel-polyfill'))
    .transform(envify)
    .transform(babelify, {presets: ['es2015', 'react']})
    .require(require.resolve('./lib/index.js'), {entry: true})
}

set_build_core_browserify()

function build_core () {
  return new Promise((resolve, reject) => {
    q.delay(watchifytimeout).then(() => {
      build_core_browserify
        .bundle()
        .on('error', err => {
          gutil.log.bind(gutil, 'Browserify Error')
          build_core_browserify.close()
          set_build_core_browserify()
          reject(err)
        })
        .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_BUNDLE_FILE)))
        .once('finish', resolve)
        .once('error', reject)
    })
  })
}

gulp.task('build-core', ['build-worker'], () => {
  return build_core()
})

browserifyOpts = {debug: false}
browserifyOpts = Object.assign({}, watchify.args, browserifyOpts)
let build_react_browserify

function set_build_react_browserify () {
  build_react_browserify = watchify(browserify(browserifyOpts))
  build_react_browserify
    // Do not include the polyfill - it is already included by datt-core.js
    .transform('reactify')
    .transform(babelify, {presets: ['es2015', 'react']})
    .add(require.resolve('./views/index.js'), {entry: true})
}

set_build_react_browserify()

function build_react () {
  let p1 = new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.css'))
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', 'bootstrap.css')))
      .on('close', resolve)
      .on('error', reject)
  })
  let p2 = new Promise((resolve, reject) => {
    q.delay(watchifytimeout).then(() => {
      build_react_browserify
        .bundle()
        .on('error', err => {
          gutil.log.bind(gutil, 'Browserify Error')
          build_react_browserify.close()
          set_build_react_browserify()
          reject(err)
        })
        .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_REACT_JS_FILE)))
        .once('finish', resolve)
        .once('error', reject)
    })
  })
  return p1.then(function () {
    return p2
  })
}

gulp.task('build-react', function () {
  return build_react()
})

browserifyOpts = {debug: false}
browserifyOpts = Object.assign({}, watchify.args, browserifyOpts)
let build_tests_browserify

function set_build_tests_browserify () {
  return new Promise((resolve, reject) => {
    glob('./test/**/*+(.js|.jsx)', {}, (err, files) => {
      build_tests_browserify = watchify(browserify(browserifyOpts))
      if (err) {
        reject(err)
        return
      }
      build_tests_browserify
        .transform(envify)
        .transform(babelify, {presets: ['es2015', 'react']})
        .ignore('jsdom')
      for (let file of files) {
        build_tests_browserify.add(file)
      }
      resolve()
    })
  })
}

gulp.task('build-tests-prebundle', () => {
  return set_build_tests_browserify()
})

function build_tests () {
  return new Promise((resolve, reject) => {
    q.delay(watchifytimeout).then(() => {
      build_tests_browserify
        .bundle()
        .on('error', err => {
          gutil.log.bind(gutil, 'Browserify Error')
          build_tests_browserify.close()
          set_build_tests_browserify().then(function () {
            reject(err)
          }).catch(error => {
            reject(err + ', ' + error)
          })
        })
        .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_JS_TESTS_FILE)))
        .on('finish', resolve)
    })
  })
}

gulp.task('build-tests', ['build-tests-prebundle', 'build-core', 'build-worker'], () => {
  return build_tests()
})

gulp.task('build-mocha', () => {
  // copy the mocha js and css files to our build directory so you can use them
  // in the tests HTML file
  let p1 = new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, 'node_modules', 'mocha', 'mocha.js'))
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', 'mocha.js')))
      .on('close', resolve)
      .on('error', reject)
  })
  let p2 = new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, 'node_modules', 'mocha', 'mocha.css'))
      .pipe(fs.createWriteStream(path.join(__dirname, 'build', 'mocha.css')))
      .on('close', resolve)
      .on('error', reject)
  })
  return p1.then(() => {
    return p2
  })
})

gulp.task('build', ['build-react', 'build-core', 'build-tests', 'build-mocha'])

gulp.task('build-exit', ['build'], () => {
  process.exit()
})

function test_node (end) {
  return gulp.src(['./test/*.js', './test/**/*.js', './test/**/*.jsx'])
    .pipe(plumber()) // keeps gulp from crashing when there is an exception
    .pipe(mocha({
      reporter: 'dot',
      compilers: {
        jsx: jsx_require_extension
      }
    }))
    .once('end', () => {
      if (end) {
        process.exit()
      }
    })
}

gulp.task('test-node', () => {
  return test_node(true)
})

gulp.task('watch-test-node', () => {
  // runs the mocha node tests and runs js standard on all the files
  watch(jsfiles, function () {
    q.delay(watchifytimeout).then(() => {
      exec('node_modules/.bin/standard *.js ./views/**/*.js ./views/**/*.jsx ./lib/**/*.js ./test/**/*.js', {cwd: __dirname}, (err, stdout, stderr) => {
        if (err) {
          console.log(stdout)
        }
        test_node()
      })
    })
  })
})

gulp.task('build-karma-url', () => {
  // karma serves static files, including js files, from /base/
  process.env.DATT_JS_BASE_URL = '/base/'
})

gulp.task('build-karma', ['build-karma-url', 'build'])

gulp.task('test-karma', ['build-karma'], () => {
  let rendezvousServer = testapp.createRendezvousServer(3031)
  let appServer = testapp.createAppServer(3030)
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
})

gulp.task('watch-test-karma', () => {})

gulp.task('build-browsersync', ['build'], () => {
  browserSyncs['3040'].reload()
  browserSyncs['3041'].reload()
  browserSyncs['3042'].reload()
  browserSyncs['3043'].reload()
  browserSyncs['3044'].reload()
})

gulp.task('serve', ['build'], () => {
  testapp.createRendezvousServer(3031)
  testapp.createAppServer(3030)

  let config = {
    ui: false,
    proxy: 'http://localhost:3030',
    open: false // don't automatically open browser window
  }

  console.log('browser-sync proxy on ports 3040 - 3044')
  browserSyncs['3040'].init(Object.assign({port: 3040}, config))
  browserSyncs['3041'].init(Object.assign({port: 3041}, config))
  browserSyncs['3042'].init(Object.assign({port: 3042}, config))
  browserSyncs['3043'].init(Object.assign({port: 3043}, config))
  browserSyncs['3044'].init(Object.assign({port: 3044}, config))

  gulp.watch(allfiles, ['build-browsersync'])
})

gulp.task('default', ['build-exit'])
