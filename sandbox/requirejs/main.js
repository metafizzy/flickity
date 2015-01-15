/*jshint strict: false */
/*global requirejs: false*/

// /*
// bower components
requirejs.config({
  baseUrl: '../../bower_components'
});

requirejs( [ '../js/flickity' ], function( Flickity ) {
  new Flickity('#gallery');
});
// */

/*
// packery.pkgd.js
requirejs( [
  'js/packery.pkgd.js',
  'require'
], function( pkgd, require ) {
  require( ['packery/js/packery'], function ( Packery ) {
    new Packery('#basic');
  });
});
// */

/*
requirejs( [
  'js/packery.pkgd.js'
], function( Packery ) {
  new Packery('#basic');
});
// */
