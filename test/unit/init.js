( function() {

'use strict';

QUnit.module('Flickity');

var utils = window.fizzyUIUtils;

QUnit.test( 'init', function( assert ) {

  var elem = document.querySelector('#init');
  var flkty = new Flickity( elem );

  for ( var prop in Flickity.defaults ) {
    assert.equal( flkty.options[ prop ], Flickity.defaults[ prop ], prop + ' option matches default' );
  }

  assert.equal( flkty.element, elem, '.element is proper element' );
  var children = utils.makeArray( flkty.element.children );
  assert.notEqual( children.indexOf( flkty.viewport ), -1, 'viewport element is a child element' );
  assert.equal( flkty.viewport.children[0], flkty.slider, 'slider is in viewport' );
  assert.equal( flkty.viewport.style.height, '100px', 'viewport height set' );

  assert.ok( flkty.isActive, 'isActive' );
  assert.ok( matchesSelector( elem, '.flickity-enabled' ), 'flickity-enabled class added' );

  assert.equal( flkty.cells.length, 6, 'has 6 cells' );
  assert.equal( flkty.cells[0].element.style.left, '0%', 'first cell left: 0%' );
  assert.equal( flkty.cells[5].element.style.left, '500%', '6th cell left: 500%' );

  assert.equal( flkty.selectedIndex, 0, 'selectedIndex = 0' );
  assert.equal( flkty.cursorPosition, 200, 'cursorPosition = 200' );
  assert.equal( flkty.x + flkty.cursorPosition, 0, 'x + cursorPosition = 0' );

});

})();
