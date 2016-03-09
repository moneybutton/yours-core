'use strict'
let asink = require('asink')
let babel_core_register = require('babel-core/register')
let babelify = require('babelify')
let browserify = require('browserify')
let envify = require('envify')
let fs = require('fs')
let glob = require('glob')
let gulp = require('gulp')
let gulp_mocha = require('gulp-mocha')
let gulp_plumber = require('gulp-plumber')
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
}

gulp.task('build-dattreact', task_build_dattreact)

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
