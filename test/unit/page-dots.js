QUnit.test( 'pageDots', function( assert ) {

  let elem = document.querySelector('#page-dots');
  let flkty = new Flickity( elem );

  let dotsHolder = elem.querySelector('.flickity-page-dots');
  let dotsElems = dotsHolder.querySelectorAll('.dot');

  assert.ok( dotsHolder, 'dots holder in DOM' );
  assert.equal( flkty.pageDots.holder, dotsHolder,
      'dots holder element matches flkty.pageDots.holder' );
  assert.equal( dotsElems.length, flkty.cells.length,
      'number of dots matches number of cells' );

  function getSelectedDotIndex() {
    let selectedDot = dotsHolder.querySelector('.is-selected');
    for ( let i = 0; i < dotsElems.length; i++ ) {
      if ( dotsElems[i] == selectedDot ) return i;
    }
    return -1;
  }

  assert.equal( getSelectedDotIndex(), 0, 'first dot is selected' );
  flkty.select( 2 );
  assert.equal( getSelectedDotIndex(), 2, '3rd dot is selected' );

  // fake tap
  flkty.pageDots.onTap({ target: dotsElems[4] });
  assert.equal( flkty.selectedIndex, 4, 'tap dot selects cell' );

} );
