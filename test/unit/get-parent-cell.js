QUnit.test( 'getParentCell', function( assert ) {
  'use strict';

  var gallery = document.querySelector('#get-parent-cell');
  var flkty = new Flickity( gallery );

  // cell1
  var cell = flkty.getParentCell( gallery.querySelector('.cell1') );
  assert.ok( cell, 'getParentCell( cell ) ok' );
  assert.ok( cell instanceof Flickity.Cell, 'cell is Flickity.Cell' );
  var index = flkty.cells.indexOf( cell );
  assert.equal( index, 0, 'cell is index 0' );
  // cell3
  cell = flkty.getParentCell( gallery.querySelector('.cell3') );
  assert.ok( cell, 'getParentCell( cell ) ok' );
  assert.ok( cell instanceof Flickity.Cell, 'cell is Flickity.Cell' );
  index = flkty.cells.indexOf( cell );
  assert.equal( index, 2, 'cell is index 2' );
  // child1
  cell = flkty.getParentCell( gallery.querySelector('.child1') );
  assert.ok( cell, 'getParentCell( cell ) ok' );
  assert.ok( cell instanceof Flickity.Cell, 'cell is Flickity.Cell' );
  index = flkty.cells.indexOf( cell );
  assert.equal( index, 0, 'cell is index 0' );
  // child2
  cell = flkty.getParentCell( gallery.querySelector('.child2') );
  assert.ok( cell, 'getParentCell( cell ) ok' );
  assert.ok( cell instanceof Flickity.Cell, 'cell is Flickity.Cell' );
  index = flkty.cells.indexOf( cell );
  assert.equal( index, 1, 'cell is index 1' );
  // outside
  cell = flkty.getParentCell( document.querySelector('.outside') );
  assert.ok( !cell, 'getParentCell( notCell ) not ok' );
  index = flkty.cells.indexOf( cell );
  assert.equal( index, -1, 'not cell is index -1' );

});
