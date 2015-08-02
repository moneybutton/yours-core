"use strict";
let gulp = require('gulp');
let karma = require('gulp-karma');
let mocha = require('gulp-mocha');
let path = require('path');
let fs = require('fs');
let browserify = require('browserify');
let es6ify = require('es6ify');
let envify = require('envify');
let uglifyify = require('uglifyify');
let glob = require('glob');

// By default, we assume browser-loaded javascript is served from the root
// directory, "/", of the http server. karma, however, assumes files are in the
// "/base/" directory, thus we invented this variable to allow overriding the
// directory. If you wish to put your javascript somewhere other than root,
// specify it by setting this environment variable before building. You can
// also override the name of the bundle files or the minified versions by
// setting the respective environment variables below.
if (!process.env.DATT_JS_BASE_URL) {
  process.env.DATT_JS_BASE_URL = '/';
}

if (!process.env.DATT_JS_BUNDLE_FILE) {
  process.env.DATT_JS_BUNDLE_FILE = 'datt.js';
}

if (!process.env.DATT_JS_BUNDLE_MIN_FILE) {
  process.env.DATT_JS_BUNDLE_MIN_FILE = 'datt-min.js';
}

gulp.task('build-bundle', function() {
  return new Promise(function(resolve, reject) {
    browserify({debug: false})
    .add(es6ify.runtime)
    .transform(envify)
    // don't es6ify any node_modules, unless it's fullnode
    .transform(es6ify.configure(/^(?!.*node_modules(?!\/fullnode\/lib))+.+\.js$/))
    .require(require.resolve('./index.js'), {entry: true})
    .bundle()
    .on('error', function(err) {reject(err);})
    .on('end', function() {resolve();})
    .pipe(fs.createWriteStream(path.join(__dirname, 'browser', process.env.DATT_JS_BUNDLE_FILE)));
  });
});

gulp.task('build-bundle-min', ['build-bundle'], function() {
  return new Promise(function(resolve, reject) {
    let backup = process.env.DATT_JS_BUNDLE_FILE;
    process.env.DATT_JS_BUNDLE_FILE = process.env.DATT_JS_BUNDLE_MIN_FILE;
    browserify({debug: false})
    .add(es6ify.runtime)
    .transform(envify)
    // don't es6ify any node_modules, unless it's fullnode
    .transform(es6ify.configure(/^(?!.*node_modules(?!\/fullnode\/lib))+.+\.js$/))
    .transform(uglifyify)
    .require(require.resolve('./index.js'), {entry: true})
    .bundle()
    .on('error', function(err) {reject(err);})
    .on('end', function() {process.env.DATT_JS_BUNDLE_FILE = backup; resolve();})
    .pipe(fs.createWriteStream(path.join(__dirname, 'browser', process.env.DATT_JS_BUNDLE_FILE)));
  });
});

gulp.task('build-tests', ['build-bundle'], function() {
  return new Promise(function(resolve, reject) {
    glob("./test/**/*.js", {}, function (err, files) {
      let b = browserify({debug: true})
      .add(es6ify.runtime)
      .transform(envify)
      // don't es6ify any node_modules, unless it's fullnode
      .transform(es6ify.configure(/^(?!.*node_modules(?!\/fullnode\/lib))+.+\.js$/));
      for (let file of files) {
        b.add(file);
      }
      b.bundle()
      .on('error', function(err) {reject(err);})
      .on('end', function() {resolve();})
      .pipe(fs.createWriteStream(path.join(__dirname, 'browser', 'tests.js')));
    });
  });
});

gulp.task('test-node', function() {
  return gulp.src(['test/*.js'])
  .pipe(mocha({reporter: 'dot'}))
  .once('error', function(error) {
    process.exit(1);
  })
  .once('end', function() {
    process.exit();
  });
});

gulp.task('build-karma-url', function() {
  // karma serves static files, including js files, from /base/
  process.env.DATT_JS_BASE_URL = '/base/';
});

gulp.task('build-karma', ['build-karma-url', 'build-tests']);

gulp.task('test-karma', ['build-karma'], function() {
  return gulp.src([])
  .pipe(karma({
    configFile: '.karma.conf.js',
    action: 'run'
  }))
  .on('error', function(err) {
    throw err;
  })
  .on('end', function() {
    process.exit();
  });
});

gulp.task('test-browser', ['build-karma', 'test-karma']);
gulp.task('test', ['test-node']);
gulp.task('build', ['build-bundle', 'build-bundle-min', 'build-tests']);
gulp.task('default', ['build']);
