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
