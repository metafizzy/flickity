QUnit.test( 'lazyload srcset', function( assert ) {

  let done = assert.async();

  let gallery = document.querySelector('#lazyload-srcset');
  let flkty = new Flickity( gallery, {
    lazyLoad: 1,
  } );

  let loadCount = 0;
  flkty.on( 'lazyLoad', function( event, cellElem ) {
    loadCount++;

    assert.equal( event.type, 'load', 'event.type == load' );
    assert.ok( event.target.complete, `img ${loadCount} is complete` );
    assert.ok( cellElem, 'cellElement argument there' );
    let srcset = event.target.getAttribute('srcset');
    assert.ok( srcset, 'srcset attribute set' );
    let lazyAttr = event.target.getAttribute('data-flickity-lazyload-srcset');
    assert.ok( !lazyAttr, 'data-flickity-lazyload attribute removed' );

    // after first 2 have loaded, select 7th cell
    if ( loadCount === 2 ) {
      done();
    }
  } );

} );
