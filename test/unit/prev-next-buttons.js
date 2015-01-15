test( 'prev-next-buttons', function() {

  'use strict';

  var elem = document.querySelector('#prev-next-buttons');
  var flkty = new Flickity( elem );

  var prevElem = elem.querySelector('.flickity-prev-next-button.previous');
  var nextElem = elem.querySelector('.flickity-prev-next-button.next');
  ok( prevElem, 'previous button in DOM' );
  ok( nextElem, 'next button in DOM' );
  equal( flkty.prevButton.element, prevElem, 'previous button element matches prevButton.element' );
  equal( flkty.nextButton.element, nextElem, 'next button element matches nextButton.element' );
  ok( prevElem.disabled, 'previous button is disabled at first index' );
  prevElem.click();
  equal( flkty.selectedIndex, 0, 'selectedIndex still at 0' );
  nextElem.click();
  equal( flkty.selectedIndex, 1, 'next button clicked, selectedIndex at 1' );
  prevElem.click();
  equal( flkty.selectedIndex, 0, 'previous button clicked, selectedIndex back at 0' );
  flkty.select( 5 );
  ok( nextElem.disabled, 'next button disabled when at last cell' );

});
