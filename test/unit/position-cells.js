( function() {

'use strict';

// position values can be off by 0.1% or 1px
function isPositionApprox( value, expected ) {
  var isPercent = value.indexOf('%') != -1;
  value = parseFloat( value );
  var diff = Math.abs( expected - value );
  return isPercent ? diff < 0.1 : diff <= 1;
}

// loop through cells and check position values against expecteds
function checkCellPositions( flkty, expecteds ) {
  var isOK;
  for ( var i = 0; i < expecteds.length; i++ ) {
    var expected = expecteds[i];
    var cell = flkty.cells[i];
    var transform = cell.element.style.transform;
    var position = transform.replace( 'translateX(', '' ).replace( ')', '' );
    isOK = isPositionApprox( position, expected );
    if ( !isOK ) {
      console.error( 'wrong cell position, index: ' + i + '. ' +
        'expected: ' + expected + '. position: ' + position );
      break;
    }
  }
  return isOK;
}

QUnit.test( 'position cells', function( assert ) {

  var flkty = new Flickity('#position-cells');

  assert.ok( checkCellPositions( flkty, [ 0, 160, 108.3, 312.5, 275, 900 ] ),
      'percent cell position' );
  // .cell { margin: 0 2%; }
  flkty.element.classList.add('percent-margin');
  flkty.positionCells();
  assert.ok( checkCellPositions( flkty, [ 0, 176, 121.67, 342.5, 301.67, 980 ] ),
      'percent cell position with margin' );
  flkty.element.classList.remove('percent-margin');
  // pixel-based position
  flkty.options.percentPosition = false;
  flkty.positionCells();
  assert.ok( checkCellPositions( flkty, [ 0, 160, 260, 500, 660, 900 ] ),
      'pixel cell position' );
  // pixel margin, { margin: 0 10px; }
  flkty.element.classList.add('pixel-margin');
  flkty.positionCells();
  assert.ok( checkCellPositions( flkty, [ 0, 180, 300, 560, 740, 1000 ] ),
      'pixel cell position with margin' );

} );

} )();
