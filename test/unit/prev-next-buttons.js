QUnit.test( 'prev-next-buttons', function( assert ) {
  'use strict';

  var elem = document.querySelector('#prev-next-buttons');
  var flkty = new Flickity( elem );

  var prevElem = elem.querySelector('.flickity-prev-next-button.previous');
  var nextElem = elem.querySelector('.flickity-prev-next-button.next');
  assert.ok( prevElem, 'previous button in DOM' );
  assert.ok( nextElem, 'next button in DOM' );
  assert.equal( flkty.prevButton.element, prevElem,
      'previous button element matches prevButton.element' );
  assert.equal( flkty.nextButton.element, nextElem,
      'next button element matches nextButton.element' );
  assert.ok( prevElem.disabled, 'previous button is disabled at first index' );

  prevElem.focus();
  prevElem.click();
  assert.equal( flkty.selectedIndex, 0, 'selectedIndex still at 0' );
  nextElem.focus();
  nextElem.click();
  assert.equal( flkty.selectedIndex, 1, 'next button clicked, selectedIndex at 1' );
  prevElem.focus();
  prevElem.click();
  assert.equal( flkty.selectedIndex, 0,
      'previous button clicked, selectedIndex back at 0' );
  flkty.select( 5 );
  assert.ok( nextElem.disabled, 'next button disabled when at last cell' );

} );
