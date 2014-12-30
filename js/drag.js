/*global Unipointer: false*/

( function( window ) {

'use strict';

var U = window.utils;

// handle IE8 prevent default
function preventDefaultEvent( event ) {
  if ( event.preventDefault ) {
    event.preventDefault();
  } else {
    event.returnValue = false;
  }
}

// -------------------------- drag prototype -------------------------- //

var proto = {};
U.extend( proto, Unipointer.prototype );

// -------------------------- pointer events -------------------------- //

proto.pointerDown = function( event, pointer ) {
  preventDefaultEvent( event );
  // kludge to blur focused inputs in dragger
  var focused = document.activeElement;
  if ( focused && focused.blur && focused !== this.element ) {
    focused.blur();
  }
  // focus element, if its not an input
  if ( this.options.accessibility && event.target.nodeName !== 'INPUT' ) {
    this.element.focus();
  }
  // stop if it was moving
  this.velocity = 0;
  // track to see when dragging starts
  this.pointerDownPoint = Unipointer.getPointerPoint( pointer );
  // stop auto play
  this.player.stop();
};

proto.pointerMove = function( event, pointer ) {
  var movePoint = Unipointer.getPointerPoint( pointer );
  var dragMove = movePoint.x - this.pointerDownPoint.x;
  // start drag
  if ( !this.isDragging && Math.abs( dragMove ) > 3 ) {
    this.dragStart( event, pointer );
  }

  this.dragMove( movePoint, event, pointer );
};

proto.pointerUp = function( event, pointer ) {
  if ( this.isDragging ) {
    this.dragEnd( event, pointer );
  } else {
    // allow click in text input
    if ( event.target.nodeName === 'INPUT' && event.target.type === 'text' ) {
      event.target.focus();
    }
  }
};

// -------------------------- dragging -------------------------- //

proto.dragStart = function( event, pointer ) {
  this.isDragging = true;
  this.dragStartPoint = Unipointer.getPointerPoint( pointer );
  this.dragStartPosition = this.x;
  this.startAnimation();
  // prevent clicks
  this.isPreventingClicks = true;
  this.dispatchEvent( 'dragStart', event, [ pointer ] );
};

proto.dragMove = function( movePoint, event, pointer ) {
  // do not drag if not dragging yet
  if ( !this.isDragging ) {
    return;
  }

  this.previousDragX = this.x;

  var movedX = movePoint.x - this.dragStartPoint.x;
  // reverse if right-to-left
  var direction = this.options.rightToLeft ? -1 : 1;
  this.x = this.dragStartPosition + movedX * direction;

  if ( !this.options.wrapAround ) {
    // slow drag
    var originBound = Math.max( -this.cells[0].target, this.dragStartPosition);
    this.x = this.x > originBound ? ( this.x - originBound ) * 0.5 + originBound : this.x;
    var endBound = Math.min( -this.getLastCell().target, this.dragStartPosition );
    this.x = this.x < endBound ? ( this.x - endBound ) * 0.5 + endBound : this.x;
  }

  this.previousDragMoveTime = this.dragMoveTime;
  this.dragMoveTime = new Date();
  this.dispatchEvent( 'dragMove', event, [ pointer ] );
};

proto.dragEnd = function( event, pointer ) {
  this.dragEndFlick();
  if ( this.options.freeScroll ) {
    this.isFreeScrolling = true;
  }
  // set selectedIndex based on where flick will end up
  var index = this.dragEndRestingSelect();

  if ( this.options.freeScroll && !this.options.wrapAround ) {
    // if free-scroll & not wrap around
    // do not free-scroll if going outside of bounding cells
    // so bounding cells can attract slider, and keep it in bounds
    var restingX = this.getRestingPosition();
    this.isFreeScrolling = -restingX > this.cells[0].target &&
      -restingX < this.getLastCell().target;
  } else if ( !this.options.freeScroll && index === this.selectedWrapIndex ) {
    // boost selection if selected index has not changed
    index = this.dragEndBoostSelect();
  }
  // apply selection
  // TODO refactor this, selecting here feels weird
  this.select( index );
  // set flags
  this.isDragging = false;
  // re-enable clicking async
  var _this = this;
  setTimeout( function() {
    delete _this.isPreventingClicks;
  });

  this.dispatchEvent( 'dragEnd', event, [ pointer ] );
};

// apply velocity after dragging
proto.dragEndFlick = function() {
  if ( !isFinite( this.previousDragX ) ) {
    return;
  }
  // set slider velocity
  var timeDelta = ( new Date() ) - this.previousDragMoveTime;
  // 60 frames per second, ideally
  // TODO, velocity should be in pixels per millisecond
  // currently in pixels per frame
  timeDelta /= 1000 / 60;
  var xDelta = this.x - this.previousDragX;
  this.velocity = xDelta / timeDelta;
  // reset
  delete this.previousDragX;
};

proto.dragEndRestingSelect = function() {
  var restingX = this.getRestingPosition();
  // how far away from selected cell
  var distance = Math.abs( this.getCellDistance( -restingX, this.selectedWrapIndex ) );
  // get closet resting going up and going down
  var positiveResting = this._getClosestResting( restingX, distance, 1 );
  var negativeResting = this._getClosestResting( restingX, distance, -1 );
  // use closer resting for wrap-around
  var index = positiveResting.distance < negativeResting.distance ?
    positiveResting.index : negativeResting.index;
  return index;
};

/**
 * given resting X and distance to selected cell
 * get the distance and index of the closest cell
 * @param {Number} restingX - estimated post-flick resting position
 * @param {Number} distance - distance to selected cell
 * @param {Integer} increment - +1 or -1, going up or down
 * @returns {Object} - { distance: {Number}, index: {Integer} }
 */
proto._getClosestResting = function( restingX, distance, increment ) {
  var index = this.selectedWrapIndex;
  var minDistance = Infinity;
  while ( distance < minDistance ) {
    // measure distance to next cell
    index += increment;
    minDistance = distance;
    distance = this.getCellDistance( -restingX, index );
    if ( distance === null ) {
      break;
    }
    distance = Math.abs( distance );
  }
  return {
    distance: minDistance,
    // selected was previous index
    index: index - increment
  };
};

/**
 * measure distance between x and a cell target
 * @param {Number} x
 * @param {Integer} index - cell index
 */
proto.getCellDistance = function( x, index ) {
  var len = this.cells.length;
  var cellIndex = this.options.wrapAround ? U.modulo( index, len ) : index;
  var cell = this.cells[ cellIndex ];
  if ( !cell ) {
    return null;
  }
  // add distance for wrap-around cells
  var wrap = this.options.wrapAround ? this.slideableWidth * Math.floor( index / len ) : 0;
  return x - ( cell.target + wrap );
};

proto.dragEndBoostSelect = function() {
  var index = this.selectedWrapIndex;
  var distance = this.getCellDistance( -this.x, index );
  if ( distance > 0 && this.velocity < -1 ) {
    // if moving towards the right, and positive velocity, and the next attractor
    return index + 1;
  } else if ( distance < 0 && this.velocity > 1 ) {
    // if moving towards the left, and negative velocity, and previous attractor
    return index - 1;
  }
  return index;
};

// ----- onclick ----- //

// handle all clicks and prevent clicks when dragging
proto.onclick = function( event ) {
  if ( this.isPreventingClicks ) {
    preventDefaultEvent( event );
  }
};

window.Flickity = window.Flickity || {};
window.Flickity.dragPrototype = proto;

})( window );
