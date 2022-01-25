( function() {

'use strict';

var utils = window.fizzyUIUtils;

function noop() {}

var fakeDrag = window.fakeDrag = function( flkty, positions ) {

  function fakeEvent( type, pageX ) {
    return {
      type: type,
      pageX: pageX,
      pageY: 0,
      preventDefault: noop,
      target: flkty.viewport,
    };
  }

  var hasBeenDown = false;

  function triggerEvent() {
    var position = positions.shift();
    // down or move event
    if ( !hasBeenDown ) {
      var downEvent = fakeEvent( 'mousedown', position );
      flkty._pointerDown( downEvent, downEvent );
      hasBeenDown = true;
    } else {
      var moveEvent = fakeEvent( 'mousemove', position );
      flkty._pointerMove( moveEvent, moveEvent );
    }

    if ( positions.length ) {
      // loop next
      setTimeout( triggerEvent, 40 );
    } else {
      // up event
      var upEvent = fakeEvent( 'mouseup', position );
      flkty._pointerUp( upEvent, upEvent );
    }
  }

  triggerEvent();
};

var dragTests;
// do each drag test one after another
function getDoNextDragTest( done ) {
  return function doNextDragTest() {
    if ( dragTests.length ) {
      var dragTest = dragTests.shift();
      dragTest();
    } else {
      done();
    }
  };
}

// flickity, dragPositions, index, onSettle, message
function getFakeDragTest( args ) {
  var assert = args.assert;
  var flkty = args.flickity;
  var msgCell = 'slide[' + args.index + ']';

  return function fakeDragTest() {
    var selectMsg = ( args.message ? args.message + '. ' : '' ) + 'selected ' + msgCell;
    flkty.once( 'select', function() {
      assert.equal( flkty.selectedIndex, args.index, selectMsg );
    } );

    var settleMsg = ( args.message ? args.message + '. ' : '' ) + 'settled ' + msgCell;
    var target = flkty.slides[ args.index ].target;
    flkty.once( 'settle', function() {
      assert.equal( Math.round( -flkty.x ), Math.round( target ), settleMsg );
      setTimeout( args.onSettle );
    } );

    fakeDrag( args.flickity, args.dragPositions );
  };
}

QUnit.test( 'drag', function( assert ) {
  // async test
  var done = assert.async();

  var flkty = new Flickity('#drag');

  var doNextDragTest = getDoNextDragTest( done );

  function getDragTest( args ) {
    args = utils.extend( args, {
      assert: assert,
      flickity: flkty,
      onSettle: doNextDragTest,
    } );
    return getFakeDragTest( args );
  }

  dragTests = [
    getDragTest({
      message: 'drag to 2nd cell',
      index: 1,
      dragPositions: [ 0, -10, -20 ],
    }),
    getDragTest({
      message: 'drag back to 1st cell',
      index: 0,
      dragPositions: [ 0, 10, 20 ],
    }),
    getDragTest({
      message: 'big flick to 3rd cell',
      index: 2,
      dragPositions: [ 0, -10, -80 ],
    }),
    // minimal movement to trigger static click
    function() {
      flkty.once( 'staticClick', function() {
        assert.ok( true, 'staticClick fired on non-drag' );
        assert.equal( flkty.selectedIndex, 2, 'selected index still at 2 after click' );
        setTimeout( doNextDragTest );
      } );
      fakeDrag( flkty, [ 0, 1, 0, -2, -1 ] );
    },
    // move out then back to where it started
    function() {
      flkty.once( 'settle', function() {
        assert.equal( flkty.selectedIndex, 2, 'move out then back. same cell' );
        setTimeout( doNextDragTest );
      } );
      fakeDrag( flkty, [ 0, 10, 20, 30, 20 ] );
    },
    getDragTest({
      message: 'drag and try to flick past 6th cell',
      index: 5,
      dragPositions: [ 0, -10, -50, -77, -100, -125, -150, -175, -250, -350 ],
    }),
  ];

  doNextDragTest();

} );

QUnit.test( 'drag with wrapAround', function( assert ) {
  // async test
  var done = assert.async();

  var flkty = new Flickity( '#drag-wrap-around', {
    wrapAround: true,
  } );

  var doNextDragTest = getDoNextDragTest( done );

  function getDragTest( args ) {
    args = utils.extend( args, {
      assert: assert,
      flickity: flkty,
      onSettle: doNextDragTest,
    } );
    return getFakeDragTest( args );
  }

  dragTests = [
    getDragTest({
      message: 'drag to last cell via wrap-around',
      index: 5,
      dragPositions: [ 0, 10, 20 ],
    }),
    getDragTest({
      message: 'drag to first cell via wrap-around',
      index: 0,
      dragPositions: [ 0, -10, -20 ],
    }),
    getDragTest({
      message: 'big flick to 5th cell via wrap-around',
      index: 4,
      dragPositions: [ 0, 10, 80 ],
    }),
  ];

  doNextDragTest();

} );

} )();
