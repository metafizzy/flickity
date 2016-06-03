test( 'lazyload', function( assert ) {
  'use strict';

  var done = assert.async();

  var gallery = document.querySelector('#lazyload');
  var flkty = new Flickity( gallery, {
    lazyLoad: 1
  });

  var loadCount = 0;
  flkty.on( 'lazyLoad', function( event, cellElem ) {
    loadCount++;

    equal( event.type, 'load', 'event.type == load' );
    ok( event.target.complete, 'img ' + loadCount + ' is complete' );
    ok( cellElem, 'cellElement argument there' );

    // after first 2 have loaded, select 7th cell
    if ( loadCount == 2 ) {
      flkty.select( 6 );
    }

    var loadingImgs = gallery.querySelectorAll('.flickity-lazyloading').length;
    if (loadingImgs = 5) {
      equal(loadingImgs, '5', 'preparing to load 5 images');
    }
    if ( loadCount == 5 ) {
      var loadedImgs = gallery.querySelectorAll('.flickity-lazyloaded:not(.flickity-lazyloading)');
      equal( loadedImgs.length, '5', 'only 5 images loaded' );
      done();
    }
  });

});
