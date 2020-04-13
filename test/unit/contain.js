QUnit.test( 'contain', function( assert ) {

  'use strict';

  var flkty = new Flickity( '#contain', {
    contain: true,
  } );

  assert.equal( Math.round( flkty.x + flkty.cursorPosition ), 0,
      'selected at 0, position left edge' );
  flkty.select( 1 );
  flkty.positionSliderAtSelected();
  assert.equal( Math.round( flkty.x + flkty.cursorPosition ), 0,
      'selected at 1, position left edge' );
  flkty.select( 4 );
  flkty.positionSliderAtSelected();
  var endLimit = flkty.slideableWidth - flkty.size.innerWidth * ( 1 - flkty.cellAlign );
  assert.equal( Math.round( -endLimit ), Math.round( flkty.x ),
      'selected at 4, position right edge' );
  flkty.select( 5 );
  flkty.positionSliderAtSelected();
  assert.equal( Math.round( -endLimit ), Math.round( flkty.x ),
      'selected at 5, position right edge' );

} );
