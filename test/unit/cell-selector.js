/* globals matchesSelector */

QUnit.test( 'cellSelector', function( assert ) {

  let elem = document.querySelector('#cell-selector');
  let notCell1 = elem.querySelector('.not-cell1');
  let notCell2 = elem.querySelector('.not-cell2');

  let flkty = new Flickity( elem, {
    cellSelector: '.cell',
  } );

  let cellsMatchSelector = true;
  let i;
  for ( i = 0; i < flkty.cells.length; i++ ) {
    let cell = flkty.cells[i];
    let isMatch = matchesSelector( cell.element, flkty.options.cellSelector );
    cellsMatchSelector = cellsMatchSelector && isMatch;
  }

  // getCellElements()
  let cellElems = flkty.getCellElements();
  let queriedCellElems = elem.querySelectorAll( flkty.options.cellSelector );
  assert.equal( cellElems.length, flkty.cells.length,
      'getCellElements returns corrent number of elements' );
  for ( i = 0; i < cellElems.length; i++ ) {
    assert.equal( cellElems[i], queriedCellElems[i],
        'cell element same as queried cell element' );
  }

  assert.ok( cellsMatchSelector, 'all cell elements match cellSelector' );

  assert.equal( notCell1.parentNode, elem, 'notCell1 parent node is still gallery' );
  assert.equal( notCell2.parentNode, elem, 'notCell2 parent node is still gallery' );

} );
