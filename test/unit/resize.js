test( 'resize', function() {

  'use strict';

  var elem = document.querySelector('#resize');
  var flkty = new Flickity( elem, {
    initialIndex: 2
  });
  elem.style.width = '500px';
  flkty.resize();

  equal( flkty.selectedIndex, 2, 'selectedIndex = 2' );
  equal( flkty.cursorPosition, 250, 'cursorPosition = 250' );
  equal( flkty.x + flkty.cursorPosition, -1000, 'x + cursorPosition = -1000' );

});
