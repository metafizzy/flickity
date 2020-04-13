QUnit.test( 'selectCell', function( assert ) {
  'use strict';

  var gallery = document.querySelector('#select-cell');
  var cellElems = gallery.querySelectorAll('.cell');
  var flkty = new Flickity( gallery, {
    groupCells: true, // groups of 3
  } );

  flkty.selectCell( 3 );
  assert.equal( flkty.selectedIndex, 1, 'selectCell number' );
  flkty.selectCell( cellElems[1] );
  assert.equal( flkty.selectedIndex, 0, 'selectCell element' );
  flkty.selectCell('.select-cell__6');
  assert.equal( flkty.selectedIndex, 2, 'selectCell selector string' );
  flkty.selectCell('none');
  assert.equal( flkty.selectedIndex, 2, 'selectCell bad string is okay' );
} );
