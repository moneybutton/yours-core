'use strict'
let babel_core_register = require('babel-core/register')
let babelify = require('babelify')
let browserify = require('browserify')
let envify = require('envify')
let fs = require('fs')
let gulp = require('gulp')
let gulp_mocha = require('gulp-mocha')
let gulp_plumber = require('gulp-plumber')
let path = require('path')

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

gulp.task('build-fullnode-worker', function () {
  return task_build_fullnode_worker()
})

function task_build_fullnode () {
  // the fullnode config sets environment variables necessary to use fullnode
  // if they are not already set in he environment.
  require('fullnode/config')

  return browserify({debug: false})
    .transform(envify)
    .transform(babelify.configure({ignore: /node_modules/, presets: ['es2015']}))
    .require(require.resolve('fullnode/index.js'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.FULLNODE_JS_BUNDLE_FILE)))
}

gulp.task('build-fullnode', function () {
  return task_build_fullnode()
})

function task_build_dattcore () {
  require('./config')

  return browserify({debug: false})
    .exclude(require.resolve('fullnode'))
    .transform(envify)
    .transform(babelify.configure({ignore: /node_modules/, presets: ['es2015']}))
    .require(require.resolve('./core'), {entry: true})
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'build', process.env.DATT_CORE_JS_BUNDLE_FILE)))
}

gulp.task('build-dattcore', function () {
  return task_build_dattcore()
})

function task_test_node () {
  return gulp.src(['./test/*.js', './test/**/*.js', './test/**/*.jsx'])
    .pipe(gulp_plumber()) // keeps gulp from crashing when there is an exception
    .pipe(gulp_mocha({
      reporter: 'dot',
      compilers: {
        jsx: babel_core_register
      }
    }))
}

gulp.task('test-node', () => {
  return task_test_node()
})
