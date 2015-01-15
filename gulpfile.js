/*jshint node: true, strict: false */

var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');

gulp.task( 'jshint', function() {
  return gulp.src('js/**/*.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});

gulp.task( 'concat:js', function() {
  gulp.src([
    // dependencies
    'bower_components/get-style-property/get-style-property.js',
    'bower_components/get-size/get-size.js',
    'bower_components/matches-selector/matches-selector.js',
    'bower_components/eventEmitter/EventEmitter.js',
    'bower_components/eventie/eventie.js',
    'bower_components/doc-ready/doc-ready.js',
    'bower_components/classie/classie.js',
    // source
    'js/utils.js',
    'js/unipointer.js',
    'js/cell.js',
    'js/prev-next-button.js',
    'js/page-dots.js',
    'js/player.js',
    'js/drag.js',
    'js/animate.js',
    'js/cell-change.js',
    'js/flickity.js'
  ])
    .pipe( concat('flickity.pkgd.js') )
    .pipe( gulp.dest('dist/') );
});


// -------------------------- RequireJS makes pkgd -------------------------- //

// refactored from gulp-requirejs-optimize
// https://www.npmjs.com/package/gulp-requirejs-optimize/

var gutil = require('gulp-util');
var through = require('through2');
var requirejs = require('requirejs');
var chalk = require('chalk');

function rjsOptimize( options ) {
  var stream;

  requirejs.define('node/print', [], function() {
    return function(msg) {
      if( msg.substring(0, 5) === 'Error' ) {
        gutil.log( chalk.red( msg ) );
      } else {
        gutil.log( msg );
      }
    };
  });

  options = options || {};

  stream = through.obj(function (file, enc, cb) {
    if ( file.isNull() ) {
      this.push( file );
      return cb();
    }

    options.logLevel = 2;

    options.out = function( text ) {
      var outFile = new gutil.File({
        path: '.',
        contents: new Buffer( text )
      });
      cb( null, outFile );
    };

    gutil.log('RequireJS optimizing');
    requirejs.optimize( options, null, function( err ) {
      var gulpError = new gutil.PluginError( 'requirejsOptimize', err.message );
      stream.emit( 'error', gulpError );
    });
  });

  return stream;
}

var rename = require('gulp-rename');

gulp.task( 'requirejs', function() {
  // HACK src is not needed
  // should refactor rjsOptimize to produce src
  gulp.src('')
    .pipe( rjsOptimize({
      baseUrl: 'bower_components',
      optimize: 'none',
      include: [
        'flickity/js/flickity'
      ],
      paths: {
        flickity: '../'
      }
    }) )
    .pipe( rename('flickity.grjs.js') )
    .pipe( gulp.dest('dist') );
});
