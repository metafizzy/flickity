QUnit.test( 'groupCells', function( assert ) {
  'use strict';

  var flkty = new Flickity( '#group-cells', {
    groupCells: true,
  } );

  function getSlideCellsCount() {
    var counts = flkty.slides.map( function( slide ) {
      return slide.cells.length;
    } );
    return counts.join(',');
  }

  assert.equal( getSlideCellsCount(), '3,2,2,1,1,3,2', 'groupCells: true' );
  var targets = flkty.slides.map( function( slide ) {
    return slide.target;
  } );
  assert.deepEqual( targets, [ 200, 600, 1000, 1300, 1600, 2000, 2300 ], 'targets' );

  flkty.selectCell( 6 );
  assert.equal( flkty.selectedIndex, 2, 'selectCell(6) selects 3rd slide' );
  flkty.selectCell( flkty.cells[2].element );
  assert.equal( flkty.selectedIndex, 0, 'selectCell(3rd elem) selects 1st slide' );

  flkty.options.groupCells = 2;
  flkty.reposition();
  assert.equal( getSlideCellsCount(), '2,2,2,2,2,2,2', 'groupCells: 2' );

  flkty.options.groupCells = '75%';
  flkty.reposition();
  assert.equal( getSlideCellsCount(), '2,1,1,2,1,1,1,2,2,1', 'groupCells: 75%' );

  flkty.element.classList.add('is-expanded'); // 600px wide
  flkty.options.groupCells = true;
  flkty.resize();
  assert.equal( getSlideCellsCount(), '3,3,2,3,3',
      'groupCells: true, container @ 600px' );

} );
