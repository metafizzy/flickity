/*jshint node: true, strict: false */

var fs = require('fs');
var gulp = require('gulp');

// ----- jshint ----- //

var jshint = require('gulp-jshint');

gulp.task( 'hint', function() {
  // source
  gulp.src('js/**/*.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
  // tests
  gulp.src('test/unit/*.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
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
        path: file.relative,
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
var replace = require('gulp-replace');

// regex for banner comment
var reBannerComment = new RegExp('^\\s*(?:\\/\\*[\\s\\S]*?\\*\\/)\\s*');

function getBanner() {
  var src = fs.readFileSync( 'js/flickity.js', 'utf8' );
  var matches = src.match( reBannerComment );
  var banner = matches[0].replace( 'Flickity', 'Flickity PACKAGED' );
  return banner;
}

function addBanner( str ) {
  return replace( /^/, str );
}

gulp.task( 'requirejs', function() {
  var banner = getBanner();
  // HACK src is not needed
  // should refactor rjsOptimize to produce src
  return gulp.src('js/index.js')
    .pipe( rjsOptimize({
      baseUrl: 'bower_components',
      optimize: 'none',
      include: [
        'jquery-bridget/jquery.bridget',
        'flickity/js/index',
        'flickity-as-nav-for/as-nav-for',
        'flickity-imagesloaded/flickity-imagesloaded'
      ],
      paths: {
        flickity: '../',
        jquery: 'empty:'
      }
    }) )
    // remove named module
    .pipe( replace( "'flickity-imagesloaded/flickity-imagesloaded',", '' ) )
    // add banner
    .pipe( addBanner( banner ) )
    .pipe( rename('flickity.pkgd.js') )
    .pipe( gulp.dest('dist') );
});


// ----- uglify ----- //

var uglify = require('gulp-uglify');

gulp.task( 'uglify', [ 'requirejs' ], function() {
  var banner = getBanner();
  gulp.src('dist/flickity.pkgd.js')
    .pipe( uglify() )
    // add banner
    .pipe( addBanner( banner ) )
    .pipe( rename('flickity.pkgd.min.js') )
    .pipe( gulp.dest('dist') );
});

gulp.task( 'copy-css', function() {
  gulp.src('css/flickity.css')
    .pipe( gulp.dest('dist') );
});

gulp.task( 'default', [
  'hint',
  'uglify',
  'copy-css'
]);
