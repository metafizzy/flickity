test( 'add/remove cells', function() {

  'use strict';

  function makeCellElem() {
    var cellElem = document.createElement('div');
    cellElem.className = 'cell';
    return cellElem;
  }

  // position values can be off by 0.1% or 1px
  function isPositionApprox( value, expected ) {
    var isPercent = value.indexOf('%') != -1;
    value = parseFloat( value );
    var diff = Math.abs( expected - value );
    return isPercent ? diff < 0.1 : diff <= 1;
  }


  var elem = document.querySelector('#add-remove-cells');
  var flkty = new Flickity( elem );
  var sliderElem = elem.querySelector('.flickity-slider');

  function checkCellElem( cellElem, index, message ) {
    equal( sliderElem.children[ index ], cellElem, message + ' cell element in DOM correct' );
    equal( flkty.cells[ index ].element, cellElem, message + ' element added as cell' );
    ok( isPositionApprox( cellElem.style.left, index * 25 ), ' element positioned' );
  }

  // prepend cell element
  var cellElem = makeCellElem();
  flkty.prepend( cellElem );
  checkCellElem( cellElem, 0, 'prepended' );
  equal( flkty.selectedIndex, 1, 'selectedIndex +1 after prepend' );
  // append cell element
  cellElem = makeCellElem();
  flkty.append( cellElem );
  var lastIndex = flkty.cells.length - 1;
  checkCellElem( cellElem, lastIndex, 'appended' );
  equal( flkty.selectedIndex, 1, 'selectedIndex same after prepend' );
  // insert single cell element
  cellElem = makeCellElem(); // this one gets removed first
  flkty.select( 2 );
  flkty.insert( cellElem, 2 );
  checkCellElem( cellElem, 2, 'single inserted' );
  equal( flkty.selectedIndex, 3, 'selectedIndex +1 after insert before' );
  flkty.insert( makeCellElem(), 4 );
  equal( flkty.selectedIndex, 3, 'selectedIndex same after insert before' );
  // insert multiple cell elements
  var cellElems = [ makeCellElem(), makeCellElem(), makeCellElem() ];
  flkty.insert( cellElems, 3 );
  checkCellElem( cellElems[0], 3, 'first multiple inserted' );
  checkCellElem( cellElems[1], 4, 'second multiple inserted' );
  checkCellElem( cellElems[2], 5, 'third multiple inserted' );
  equal( flkty.selectedIndex, 6, 'selectedIndex +6 after 3 insert before' );

  function checkCellPositions() {
    var isGap = false;
    for ( var i=0, len = flkty.cells.length; i < len; i++ ) {
      var cell = flkty.cells[i];
      if ( !isPositionApprox( cell.element.style.left, i * 25 ) ) {
        ok( false, 'gap in cell position ' + i + ' after removal' );
        isGap = true;
      }
    }
    ok( !isGap, 'no gaps in cell positions' );
  }

  // remove single cell element that was inserted
  var len = flkty.cells.length;
  flkty.remove( cellElem );
  equal( len - sliderElem.children.length, 1, 'element removed from DOM' );
  equal( len - flkty.cells.length, 1, 'cell removed' );
  equal( flkty.selectedIndex, 5, 'selectedIndex -1 after remove before' );
  checkCellPositions();
  // remove multiple
  len = flkty.cells.length;
  flkty.select( 4 );
  flkty.remove([ cellElems[2], cellElems[0], cellElems[1] ]);
  equal( len - sliderElem.children.length, 3, 'elements removed from DOM' );
  equal( len - flkty.cells.length, 3, 'cells removed' );
  equal( flkty.selectedIndex, 2, 'selectedIndex -2 after 2 removed before' );
  checkCellPositions();

});
