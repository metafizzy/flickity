QUnit.test( 'getWrapCells', function( assert ) {
  'use strict';

  var flkty = new Flickity( '#get-wrap-cells', {
    wrapAround: true
  });
  // cells are 25% width
  // center align, 2 cells on each side
  assert.equal( flkty.beforeShiftCells.length, 2, 'center align, 2 before shift cells' );
  assert.equal( flkty.afterShiftCells.length, 2, 'center align, 2 after shift cells' );

  flkty.options.cellAlign = 'left';
  flkty.resize();
  // left align, 0, 4
  assert.equal( flkty.beforeShiftCells.length, 0, 'left align, 1 before shift cells' );
  assert.equal( flkty.afterShiftCells.length, 4, 'left align, 4 after shift cells' );

  flkty.options.cellAlign = 'right';
  flkty.resize();
  // right align, 4, 0
  assert.equal( flkty.beforeShiftCells.length, 4, 'right align, 4 before shift cells' );
  assert.equal( flkty.afterShiftCells.length, 0, 'right align, 0 after shift cells' );

});
