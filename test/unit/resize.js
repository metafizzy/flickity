QUnit.test( 'resize', function( assert ) {

  'use strict';

  var elem = document.querySelector('#resize');
  var flkty = new Flickity( elem, {
    initialIndex: 2,
  } );
  elem.style.width = '500px';
  flkty.resize();

  assert.equal( flkty.selectedIndex, 2, 'selectedIndex = 2' );
  assert.equal( flkty.cursorPosition, 250, 'cursorPosition = 250' );
  assert.equal( flkty.x + flkty.cursorPosition, -1000, 'x + cursorPosition = -1000' );

} );
