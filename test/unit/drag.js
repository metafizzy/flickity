( function() {

'use strict';

var utils = window.utils;

function noop() {}

var fakeDrag = window.fakeDrag = function( flkty, positions ) {

  function fakeEvent( type, pageX ) {
    return {
      type: type,
      pageX: pageX,
      pageY: 0,
      preventDefault: noop,
      target: flkty.viewport
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

// flickity, dragPositions, index, callback, message
function getFakeDragTest( args ) {
  var assert = args.assert;
  var flkty = args.flickity;
  var msgCell = 'cell[' + args.index + ']';

  return function fakeDragTest() {
    var selectMsg = ( args.message ? args.message + '. ' : '' ) + 'selected ' + msgCell;
    flkty.once( 'select', function() {
      assert.equal( flkty.selectedIndex, args.index, selectMsg );
    });

    var settleMsg = ( args.message ? args.message + '. ' : '' ) + 'settled ' + msgCell;
    var target = flkty.cells[ args.index ].target;
    flkty.once( 'settle', function() {
      assert.equal( Math.round( -flkty.x ), Math.round( target ), settleMsg );
      args.callback();
    });

    fakeDrag( args.flickity, args.dragPositions );
  };
}



test( 'drag', function( assert ) {
  // async test
  var done = assert.async();

  var flkty = new Flickity('#drag');

  var doNextDragTest = getDoNextDragTest( done );

  dragTests = [
    // drag to 2nd cell
    function() {
      flkty.once( 'select', function() {
        equal( flkty.selectedIndex, 1, 'selected 2nd cell' );
      });
      flkty.once( 'settle', function() {
        equal( Math.round( -flkty.x ), Math.round( flkty.cells[1].target ), 'settled at 2nd cell' );
        doNextDragTest();
      });
      fakeDrag( flkty, [ 0, -10, -20 ] );
    },
    // drag back to 1st cell
    function() {
      flkty.once( 'select', function() {
        equal( flkty.selectedIndex, 0, 'selected 1st cell' );
      });
      flkty.once( 'settle', function() {
        equal( Math.round( -flkty.x ), Math.round( flkty.cells[0].target ), 'settled at 1st cell' );
        doNextDragTest();
      });
      fakeDrag( flkty, [ 0, 10, 20 ] );
    },
    // big flick to to 3rd cell
    function() {
      flkty.once( 'select', function() {
        equal( flkty.selectedIndex, 2, 'big flick to to 3rd cell' );
      });
      flkty.once( 'settle', function() {
        equal( Math.round( -flkty.x ), Math.round( flkty.cells[2].target ), 'settled at 3rd cell' );
        doNextDragTest();
      });
      fakeDrag( flkty, [ 0, -10, -100 ] );
    },
    // drag and try to flick past 6th cell
    function() {
      flkty.once( 'select', function() {
        equal( flkty.selectedIndex, 5, 'drag and try to flick past last cell' );
      });
      flkty.once( 'settle', function() {
        equal( Math.round( -flkty.x ), Math.round( flkty.cells[5].target ), 'settled at last cell' );
        doNextDragTest();
      });
      fakeDrag( flkty, [ 0, -10, -50, -77, -100, -125, -150, -175, -250, -350 ] );
    }
  ];



  // trigger async
  // triggering immediately causes bug
  setTimeout( doNextDragTest );

});

test( 'drag with wrapAround', function( assert ) {
  // async test
  var done = assert.async();

  var flkty = new Flickity('#drag-wrap-around', {
    wrapAround: true
  });

  var doNextDragTest = getDoNextDragTest( done );

  function getDragTest( args ) {
    args = utils.extend( args, {
      assert: assert,
      flickity: flkty,
      callback: doNextDragTest
    });
    return getFakeDragTest( args );
  }

  dragTests = [
    getDragTest({
      message: 'drag to last cell via wrap-around',
      index: 5,
      dragPositions: [ 0, 10, 20 ]
    }),
    getDragTest({
      message: 'drag to first cell via wrap-around',
      index: 0,
      dragPositions: [ 0, -10, -20 ]
    })
  ];

  // trigger async
  setTimeout( doNextDragTest );

});


})();


