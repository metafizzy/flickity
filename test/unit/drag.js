( function() {

'use strict';

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

test( 'drag', function( assert ) {
  // async test
  var done = assert.async();

  var flkty = new Flickity('#drag');

  // do each drag test one after another
  function doNextTest() {
    if ( dragTests.length ) {
      var dragTest = dragTests.shift();
      dragTest();
    } else {
      done();
    }
  }

  var dragTests = [
    // drag to 2nd cell
    function() {
      flkty.once( 'select', function() {
        equal( flkty.selectedIndex, 1, 'selected 2nd cell' );
      });
      flkty.once( 'settle', function() {
        equal( Math.round( -flkty.x ), Math.round( flkty.cells[1].target ), 'settled at 2nd cell' );
        doNextTest();
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
        doNextTest();
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
        doNextTest();
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
        doNextTest();
      });
      fakeDrag( flkty, [ 0, -10, -50, -77, -100, -125, -150, -175, -250, -350 ] );
    }
  ];

  // trigger async
  // triggering immediately causes bug
  setTimeout( doNextTest );

});

})();

