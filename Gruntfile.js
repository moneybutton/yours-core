module.exports = function(grunt) {
    grunt.initConfig({
	"pkg": grunt.file.readJSON('package.json'),
	"browserify": {
	    "./public/index.js": ["./exports.js"],
	    "options": {
		"browserifyOptions": {
		    "require": "./exports.js",
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
    grunt.loadNpmTasks('grunt-contrib-watch');
};
