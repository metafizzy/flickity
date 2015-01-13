( function() {

'use strict';

test( 'contain', function() {

  var flkty = new Flickity( '#contain', {
    contain: true
  });

  equal( Math.round( flkty.x + flkty.cursorPosition ), 0, 'selected at 0, position left edge' );
  flkty.select( 1 );
  flkty.positionSliderAtSelected();
  equal( Math.round( flkty.x + flkty.cursorPosition ), 0, 'selected at 1, position left edge' );
  flkty.select( 4 );
  flkty.positionSliderAtSelected();
  var endLimit = flkty.slideableWidth - flkty.size.innerWidth * ( 1 - flkty.cellAlign );
  equal( Math.round( -endLimit ), Math.round( flkty.x ), 'selected at 4, position right edge' );
  flkty.select( 5 );
  flkty.positionSliderAtSelected();
  equal( Math.round( -endLimit ), Math.round( flkty.x ), 'selected at 5, position right edge' );

});

})();
