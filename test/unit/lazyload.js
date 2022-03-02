QUnit.test( 'lazyload', function( assert ) {

  let done = assert.async();

  let gallery = document.querySelector('#lazyload');
  let flkty = new Flickity( gallery, {
    lazyLoad: 1,
  } );

  let loadCount = 0;
  flkty.on( 'lazyLoad', function( event, cellElem ) {
    loadCount++;

    assert.equal( event.type, 'load', 'event.type == load' );
    assert.ok( event.target.complete, `img ${loadCount} is complete` );
    assert.ok( cellElem, 'cellElement argument there' );
    let lazyAttr = event.target.getAttribute('data-flickity-lazyload');
    assert.ok( !lazyAttr, 'data-flickity-lazyload attribute removed' );

    // after first 2 have loaded, select 7th cell
    if ( loadCount === 2 ) {
      flkty.select( 6 );
    }
    if ( loadCount === 5 ) {
      let loadedImgs = gallery.querySelectorAll('.flickity-lazyloaded');
      assert.equal( loadedImgs.length, '5', 'only 5 images loaded' );
      done();
    }
  } );

} );
