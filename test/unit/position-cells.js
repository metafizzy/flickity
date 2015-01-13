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
  for ( var i=0, len = expecteds.length; i < len; i++ ) {
    var expected = expecteds[i];
    var cell = flkty.cells[i];
    var position = cell.element.style.left;
    isOK = isPositionApprox( position, expected );
    if ( !isOK ) {
      console.error( 'wrong cell position, index: ' + i + '. ' +
        'expected: ' + expected + '. position: ' + position );
      break;
    }
  }
  return isOK;
}

test( 'position cells', function() {

  var flkty = new Flickity('#position-cells');

  ok( checkCellPositions( flkty, [ 0, 40, 65, 125, 165, 225 ] ), 'percent cell position' );
  // .cell { margin: 0 2%; }
  classie.add( flkty.element, 'percent-margin' );
  flkty.positionCells();
  ok( checkCellPositions( flkty, [ 0, 44, 73, 137, 181, 245 ] ), 'percent cell position' );
  classie.remove( flkty.element, 'percent-margin' );
  // pixel-based position
  flkty.options.percentPosition = false;
  flkty.positionCells();
  ok( checkCellPositions( flkty, [ 0, 160, 260, 500, 660, 900 ] ), 'pixel cell position' );
  // pixel margin, { margin: 0 10px; }
  classie.add( flkty.element, 'pixel-margin' );
  flkty.positionCells();
  ok( checkCellPositions( flkty, [ 0, 180, 300, 560, 740, 1000 ] ), 'pixel cell position' );
  
  // w2, w1, w3, w2, w3, w1
  // w1 = 25% 100px; w2 = 40%, 160px; w3 = 60%, 240px
  

});

})();
