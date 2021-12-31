QUnit.test( 'cellSelector', function( assert ) {

  let elem = document.querySelector('#cell-selector');
  let notCell1 = elem.querySelector('.not-cell1');
  let notCell2 = elem.querySelector('.not-cell2');

  let flkty = new Flickity( elem, {
    cellSelector: '.cell',
  } );

  let cellsMatchSelector = true;
  for ( let cell of flkty.cells ) {
    let isMatch = cell.element.matches( flkty.options.cellSelector );
    cellsMatchSelector = cellsMatchSelector && isMatch;
  }

  // getCellElements()
  let cellElems = flkty.getCellElements();
  let queriedCellElems = elem.querySelectorAll( flkty.options.cellSelector );
  cellElems.forEach( ( cellElem, i ) => {
    assert.equal( cellElem, queriedCellElems[i],
        'cell element same as queried cell element' );
  } );

  assert.ok( cellsMatchSelector, 'all cell elements match cellSelector' );

  assert.equal( notCell1.parentNode, elem, 'notCell1 parent node is still gallery' );
  assert.equal( notCell2.parentNode, elem, 'notCell2 parent node is still gallery' );

} );
