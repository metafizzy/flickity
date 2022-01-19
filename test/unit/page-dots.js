QUnit.test( 'pageDots', function( assert ) {

  let elem = document.querySelector('#page-dots');
  let flkty = new Flickity( elem );

  let dotsHolder = elem.querySelector('.flickity-page-dots');
  let dotsElems = [ ...dotsHolder.querySelectorAll('.flickity-page-dot') ];

  assert.ok( dotsHolder, 'dots holder in DOM' );
  assert.equal( flkty.pageDots.holder, dotsHolder,
      'dots holder element matches flkty.pageDots.holder' );
  assert.equal( dotsElems.length, flkty.cells.length,
      'number of dots matches number of cells' );

  function getSelectedDotIndex() {
    return dotsElems.indexOf( dotsHolder.querySelector('.is-selected') );
  }

  assert.equal( getSelectedDotIndex(), 0, 'first dot is selected' );
  flkty.select( 2 );
  assert.equal( getSelectedDotIndex(), 2, '3rd dot is selected' );

  // fake click
  flkty.onPageDotsClick({ target: dotsElems[4] });
  assert.equal( flkty.selectedIndex, 4, 'tap dot selects cell' );

} );
