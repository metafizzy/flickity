QUnit.test( 'adaptiveHeight', function( assert ) {

  let flkty = new Flickity( '#adaptive-height', {
    adaptiveHeight: true,
  } );

  // 2,1,3, 1,4,2, 1,2,1

  function checkSelectHeight( index, height ) {
    flkty.select( index, false, true );
    assert.equal( flkty.viewport.style.height, `${height}px`, `slide ${index}` );
  }

  checkSelectHeight( 0, 200 );
  checkSelectHeight( 1, 100 );
  checkSelectHeight( 2, 300 );
  checkSelectHeight( 3, 100 );
  checkSelectHeight( 4, 400 );
  checkSelectHeight( 5, 200 );

  flkty.options.groupCells = true;
  flkty.resize();

  checkSelectHeight( 0, 300 );
  checkSelectHeight( 1, 400 );
  checkSelectHeight( 2, 200 );

} );
