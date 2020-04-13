QUnit.test( 'lazyload', function( assert ) {
  'use strict';

  var done = assert.async();

  var gallery = document.querySelector('#lazyload');
  var flkty = new Flickity( gallery, {
    lazyLoad: 1,
  } );

  var loadCount = 0;
  flkty.on( 'lazyLoad', function( event, cellElem ) {
    loadCount++;

    assert.equal( event.type, 'load', 'event.type == load' );
    assert.ok( event.target.complete, 'img ' + loadCount + ' is complete' );
    assert.ok( cellElem, 'cellElement argument there' );
    var lazyAttr = event.target.getAttribute('data-flickity-lazyload');
    assert.ok( !lazyAttr, 'data-flickity-lazyload attribute removed' );

    // after first 2 have loaded, select 7th cell
    if ( loadCount == 2 ) {
      flkty.select( 6 );
    }
    if ( loadCount == 5 ) {
      var loadedImgs = gallery.querySelectorAll('.flickity-lazyloaded');
      assert.equal( loadedImgs.length, '5', 'only 5 images loaded' );
      done();
    }
  } );

} );
