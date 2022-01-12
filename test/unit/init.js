( function() {

QUnit.module('Flickity');

let utils = window.fizzyUIUtils;

QUnit.test( 'init', function( assert ) {

  let elem = document.querySelector('#init');
  let flkty = new Flickity( elem );

  for ( let prop in Flickity.defaults ) {
    assert.equal( flkty.options[ prop ], Flickity.defaults[ prop ],
        `${prop} option matches default` );
  }

  assert.equal( flkty.element, elem, '.element is proper element' );
  let children = utils.makeArray( flkty.element.children );
  assert.notEqual( children.indexOf( flkty.viewport ), -1,
      'viewport element is a child element' );
  assert.equal( flkty.viewport.children[0], flkty.slider, 'slider is in viewport' );
  assert.equal( flkty.viewport.style.height, '100px', 'viewport height set' );

  assert.ok( flkty.isActive, 'isActive' );
  assert.ok( elem.matches('.flickity-enabled'), 'flickity-enabled class added' );

  assert.equal( flkty.cells.length, 6, 'has 6 cells' );
  assert.equal( getComputedStyle( flkty.cells[0].element ).left, '0px',
      'first cell left: 0px' );
  assert.equal( flkty.cells[0].element.style.transform,
      'translateX(0%)', 'first cell translateX: 0%' );
  assert.equal( flkty.cells[5].element.style.transform,
      'translateX(500%)', '6th cell translateX: 500%' );

  assert.equal( flkty.selectedIndex, 0, 'selectedIndex = 0' );
  assert.equal( flkty.cursorPosition, 200, 'cursorPosition = 200' );
  assert.equal( flkty.x + flkty.cursorPosition, 0, 'x + cursorPosition = 0' );

} );

} )();
