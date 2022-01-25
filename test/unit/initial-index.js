QUnit.test( 'initialIndex', function( assert ) {
  'use strict';
  // initialIndex number
  var flkty = new Flickity( '#initial-index', {
    initialIndex: 3,
  } );
  assert.equal( flkty.selectedIndex, 3, 'initialIndex number' );
  // selectedIndex remains same after reactivation
  flkty.deactivate();
  flkty.activate();
  assert.equal( flkty.selectedIndex, 3, 'reactivated selectedIndex stays the same' );
  flkty.destroy();
  // initialIndex selector string
  flkty = new Flickity( '#initial-index', {
    initialIndex: '.cell--initial',
  } );
  assert.equal( flkty.selectedIndex, 4, 'initialIndex selector string' );
  flkty.destroy();
  // initialIndex selector string with groupCells #881
  flkty = new Flickity( '#initial-index', {
    groupCells: 3,
    initialIndex: '.cell--initial',
  } );
  assert.equal( flkty.selectedIndex, 1, 'initialIndex selector string with groupCells' );

} );
