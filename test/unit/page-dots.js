QUnit.test( 'pageDots', function( assert ) {
  'use strict';

  var elem = document.querySelector('#page-dots');
  var flkty = new Flickity( elem );

  var dotsHolder = elem.querySelector('.flickity-page-dots');
  var dotsElems = dotsHolder.querySelectorAll('.dot');

  assert.ok( dotsHolder, 'dots holder in DOM' );
  assert.equal( flkty.pageDots.holder, dotsHolder, 'dots holder element matches flkty.pageDots.holder' );
  assert.equal( dotsElems.length, flkty.cells.length, 'number of dots matches number of cells' );

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

  assert.equal( getSelectedDotIndex(), 0, 'first dot is selected' );
  flkty.select( 2 );
  assert.equal( getSelectedDotIndex(), 2, '3rd dot is selected' );

  // fake tap
  flkty.pageDots.onTap( { target: dotsElems[4] } );
  assert.equal( flkty.selectedIndex, 4, 'tap dot selects cell' );

});
