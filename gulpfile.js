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


// requirejs
var rjs = require('gulp-r');

gulp.task( 'requirejs', function() {
  gulp.src('js/*.js')
    .pipe( rjs({
      baseUrl: '../js'
    }) )
  // gulp.src('')
    // .pipe( rjs({
    //   baseUrl: 'bower_components',
    //   include: [
    //     'jquery-bridget/jquery.bridget',
    //     'flickity/js/flickity'
    //   ],
    //   paths: {
    //     flickity: '../',
    //     jquery: 'empty:'
    //   }
    // }) )
    .pipe( gulp.dest('dist/rjs') );
});


var amdOptimize = require('amd-optimize');

gulp.task( 'opt', function() {
  amdOptimize.src( '../js/flickity', {
    baseUrl: 'bower_components',
    include: [
      'jquery-bridget/jquery.bridget'
    ],
    preserveComments: true
  })
    .pipe( concat('flickity.opt.js') )
    .pipe( gulp.dest('dist') );
});
