test( 'pageDots', function() {

  'use strict';

  var elem = document.querySelector('#page-dots');
  var flkty = new Flickity( elem );

  var dotsHolder = elem.querySelector('.flickity-page-dots');
  var dotsElems = dotsHolder.querySelectorAll('.dot');

  ok( dotsHolder, 'dots holder in DOM' );
  equal( flkty.pageDots.holder, dotsHolder, 'dots holder element matches flkty.pageDots.holder' );
  equal( dotsElems.length, flkty.cells.length, 'number of dots matches number of cells' );

  function getSelectedDotIndex() {
    var selectedDot = dotsHolder.querySelector('.is-selected');
    for ( var i=0, len = dotsElems.length; i < len; i++ ) {
      var dotElem = dotsElems[i];
      if ( dotElem == selectedDot ) {
        return i;
      }
    }
    return -1;
  }

  equal( getSelectedDotIndex(), 0, 'first dot is selected' );
  flkty.select( 2 );
  equal( getSelectedDotIndex(), 2, '3rd dot is selected' );

  // fake tap
  flkty.pageDots.onTap( null, { target: dotsElems[4] });
  equal( flkty.selectedIndex, 4, 'tap dot selects cell' );

});
