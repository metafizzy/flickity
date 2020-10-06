QUnit.test( 'lazyload picture srcset', function( assert ) {
  'use strict';

  var done = assert.async();

  var gallery = document.querySelector('#lazyload-picture-srcset');
  var flkty = new Flickity( gallery, {
    lazyLoad: 1,
  } );

  var loadCount = 0;
  flkty.on( 'lazyLoad', function( event, cellElem ) {
    loadCount++;

    assert.equal( event.type, 'load', 'event.type == load' );
    assert.ok( event.target.complete, 'img ' + loadCount + ' is complete' );
    assert.ok( cellElem, 'cellElement argument there' );
    var srcset = event.target.getAttribute('srcset');
    assert.ok( srcset, 'srcset attribute set' );
    var lazyAttr = event.target.getAttribute('data-flickity-lazyload-srcset');
    assert.ok( !lazyAttr, 'data-flickity-lazyload attribute removed' );

    if ( loadCount == 2 ) {
      done();
    }
  } );

} );
