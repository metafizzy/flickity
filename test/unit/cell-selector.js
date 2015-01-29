test( 'cellSelector', function() {
  'use strict';

  var elem = document.querySelector('#cell-selector');
  var notCell1 = elem.querySelector('.not-cell1');
  var notCell2 = elem.querySelector('.not-cell2');

  var flkty = new Flickity( elem, {
    cellSelector: '.cell'
  });

  var cellsMatchSelector = true;
  for ( var i=0, len = flkty.cells.length; i < len; i++ ) {
    var cell = flkty.cells[i];
    var isMatch = matchesSelector( cell.element, flkty.options.cellSelector );
    cellsMatchSelector = cellsMatchSelector && isMatch;
  }

  ok( cellsMatchSelector, 'all cell elements match cellSelector' );

  equal( notCell1.parentNode, elem, 'notCell1 parent node is still gallery' );
  equal( notCell2.parentNode, elem, 'notCell2 parent node is still gallery' );

});
