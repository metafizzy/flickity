( function() {

'use strict';

module('Flickity');

var utils = window.fizzyUIUtils;

test( 'init', function() {

  var elem = document.querySelector('#init');
  var flkty = new Flickity( elem );

  for ( var prop in Flickity.defaults ) {
    equal( flkty.options[ prop ], Flickity.defaults[ prop ], prop + ' option matches default' );
  }

  equal( flkty.element, elem, '.element is proper element' );
  var children = utils.makeArray( flkty.element.children );
  notEqual( children.indexOf( flkty.viewport ), -1, 'viewport element is a child element' );
  equal( flkty.viewport.children[0], flkty.slider, 'slider is in viewport' );
  equal( flkty.viewport.style.height, '100px', 'viewport height set' );

  ok( flkty.isActive, 'isActive' );
  ok( matchesSelector( elem, '.flickity-enabled' ), 'flickity-enabled class added' );

  equal( flkty.cells.length, 6, 'has 6 cells' );
  equal( flkty.cells[0].element.style.left, '0%', 'first cell left: 0%' );
  equal( flkty.cells[5].element.style.left, '500%', '6th cell left: 500%' );

  equal( flkty.selectedIndex, 0, 'selectedIndex = 0' );
  equal( flkty.cursorPosition, 200, 'cursorPosition = 200' );
  equal( flkty.x + flkty.cursorPosition, 0, 'x + cursorPosition = 0' );

});

})();
