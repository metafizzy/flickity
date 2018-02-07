/*jshint node: true, strict: false */

var fs = require('fs');
var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');

// ----- hint ----- //

var jshint = require('gulp-jshint');

gulp.task( 'hint-js', function() {
  return gulp.src('js/**/*.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});

gulp.task( 'hint-test', function() {
  return gulp.src('test/unit/*.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});

gulp.task( 'hint-task', function() {
  return gulp.src('gulpfile.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});

var jsonlint = require('gulp-json-lint');

gulp.task( 'jsonlint', function() {
  return gulp.src( '*.json' )
    .pipe( jsonlint() )
    .pipe( jsonlint.report('verbose') );
});

gulp.task( 'hint', [ 'hint-js', 'hint-test', 'hint-task', 'jsonlint' ]);

// -------------------------- RequireJS makes pkgd -------------------------- //

var gutil = require('gulp-util');
var chalk = require('chalk');
var rjsOptimize = require('gulp-requirejs-optimize');

// regex for banner comment
var reBannerComment = new RegExp('^\\s*(?:\\/\\*[\\s\\S]*?\\*\\/)\\s*');

function getBanner() {
  var src = fs.readFileSync( 'js/index.js', 'utf8' );
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
        'jquery-bridget/jquery-bridget',
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

// ----- css ----- //

var cleanCSS = require('gulp-clean-css');

gulp.task( 'css', function() {
  gulp.src('css/flickity.css')
    // copy to dist
    .pipe( gulp.dest('dist') )
    // minify
    .pipe( cleanCSS({ advanced: false }) )
    .pipe( rename('flickity.min.css') )
    .pipe( replace( '*/', '*/\n' ) )
    .pipe( gulp.dest('dist') );
});

// ----- version ----- //

// set version in source files

var minimist = require('minimist');

// use gulp version -t 1.2.3
gulp.task( 'version', function() {
  var args = minimist( process.argv.slice(3) );
  var version = args.t;
  if ( !version || !/\d\.\d\.\d/.test( version ) ) {
    gutil.log( 'invalid version: ' + chalk.red( version ) );
    return;
  }
  gutil.log( 'ticking version to ' + chalk.green( version ) );

  function sourceReplace() {
    return replace( /Flickity v\d\.\d+\.\d+/, 'Flickity v' + version );
  }

  gulp.src('js/index.js')
    .pipe( sourceReplace() )
    .pipe( gulp.dest('js') );

  gulp.src('css/flickity.css')
    .pipe( sourceReplace() )
    .pipe( gulp.dest('css') );

  gulp.src( [ 'bower.json', 'package.json' ] )
    .pipe( replace( /"version": "\d\.\d+\.\d+"/, '"version": "' + version + '"' ) )
    .pipe( gulp.dest('.') );
  // replace CDN links in README
  var minorVersion = version.match( /^\d\.\d+/ )[0];
  gulp.src('README.md')
    .pipe( replace( /flickity@\d\.\d+/g, 'flickity@' + minorVersion ))
    .pipe( gulp.dest('.') );
});

// ----- default ----- //

gulp.task( 'default', [
  'hint',
  'uglify',
  'css',
]);
