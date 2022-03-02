QUnit.test( 'add/remove cells', function( assert ) {

  function makeCellElem() {
    let cellElem = document.createElement('div');
    cellElem.className = 'cell';
    return cellElem;
  }

  // position values can be off by 0.1% or 1px
  function isPositionApprox( value, expected ) {
    value = value.replace( 'translateX(', '' ).replace( ')', '' );
    let isPercent = value.indexOf('%') !== -1;
    value = parseFloat( value );
    let diff = Math.abs( expected - value );
    return isPercent ? diff < 0.1 : diff <= 1;
  }

  let elem = document.querySelector('#add-remove-cells');
  let flkty = new Flickity( elem );
  let sliderElem = elem.querySelector('.flickity-slider');

  function checkCellElem( cellElem, index, message ) {
    assert.equal( sliderElem.children[ index ], cellElem,
        message + ' cell element in DOM correct' );
    assert.equal( flkty.cells[ index ].element, cellElem,
        message + ' element added as cell' );
    assert.ok( isPositionApprox( cellElem.style.transform, index * 100 ),
        ` element positioned ${index * 100}` );
  }

  // prepend cell element
  let cellElem = makeCellElem();
  flkty.prepend( cellElem );
  checkCellElem( cellElem, 0, 'prepended' );
  assert.equal( flkty.selectedIndex, 1, 'selectedIndex +1 after prepend' );
  // append cell element
  cellElem = makeCellElem();
  flkty.append( cellElem );
  let lastIndex = flkty.cells.length - 1;
  checkCellElem( cellElem, lastIndex, 'appended' );
  assert.equal( flkty.selectedIndex, 1, 'selectedIndex same after prepend' );
  // insert single cell element
  cellElem = makeCellElem(); // this one gets removed first
  flkty.select( 2 );
  flkty.insert( cellElem, 2 );
  checkCellElem( cellElem, 2, 'single inserted' );
  assert.equal( flkty.selectedIndex, 3, 'selectedIndex +1 after insert before' );
  flkty.insert( makeCellElem(), 4 );
  assert.equal( flkty.selectedIndex, 3, 'selectedIndex same after insert before' );
  // insert multiple cell elements
  let cellElems = [ makeCellElem(), makeCellElem(), makeCellElem() ];
  flkty.insert( cellElems, 3 );
  checkCellElem( cellElems[0], 3, 'first multiple inserted' );
  checkCellElem( cellElems[1], 4, 'second multiple inserted' );
  checkCellElem( cellElems[2], 5, 'third multiple inserted' );
  assert.equal( flkty.selectedIndex, 6, 'selectedIndex +6 after 3 insert before' );

  function checkCellPositions() {
    let isGap = false;
    flkty.cells.forEach( ( cell, i ) => {
      if ( !isPositionApprox( cell.element.style.transform, i * 100 ) ) {
        assert.ok( false, `gap in cell position ${i} after removal` );
        isGap = true;
      }
    } );
    assert.ok( !isGap, 'no gaps in cell positions' );
  }

  // remove single cell element that was inserted
  let len = flkty.cells.length;
  flkty.remove( cellElem );
  assert.equal( len - sliderElem.children.length, 1, 'element removed from DOM' );
  assert.equal( len - flkty.cells.length, 1, 'cell removed' );
  assert.equal( flkty.selectedIndex, 5, 'selectedIndex -1 after remove before' );
  checkCellPositions();
  // remove multiple
  len = flkty.cells.length;
  flkty.select( 4 );
  flkty.remove([ cellElems[2], cellElems[0], cellElems[1] ]);
  assert.equal( len - sliderElem.children.length, 3, 'elements removed from DOM' );
  assert.equal( len - flkty.cells.length, 3, 'cells removed' );
  checkCellPositions();

  // remove all cells
  flkty.remove( flkty.getCellElements() );
  assert.equal( flkty.cells.length, 0, 'all cells removed' );
  flkty.resize();
  assert.ok( true, 'resize with zero items didnt freak out' );

} );
