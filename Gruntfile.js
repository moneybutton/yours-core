module.exports = function(grunt) {
  grunt.initConfig({
    "pkg": grunt.file.readJSON('package.json'),
    "browserify": {
      "./public/index.js": ["./index.js"],
      "./public/tests.js": ["./test/*.js"],
      "options": {
        "browserifyOptions": {
          "require": "./index.js",
          "outfile": "./public/index.js",
          "standalone": "DattLib"
        }
      }
    },
    "watch": {
      "files": [ "lib/*.js"],
      "tasks": [ 'browserify' ]
    }
  });

  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask("default", "browserify");
};
