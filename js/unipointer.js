/*global eventie: false*/

( function( window ) {

'use strict';

// -----  ----- //

function noop() {}

// -------------------------- Unipointer -------------------------- //

function Unipointer() {}

// trigger handler methods for events
Unipointer.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// returns the touch that we're keeping track of
Unipointer.prototype.getTouch = function( touches ) {
  for ( var i=0, len = touches.length; i < len; i++ ) {
    var touch = touches[i];
    if ( touch.identifier === this.pointerIdentifier ) {
      return touch;
    }
  }
};

// ----- bind start ----- //

// works as unbinder, as you can .bindHandles( false ) to unbind

/**
 * @param {Boolean} isBind - will unbind if falsey
 */
Unipointer.prototype.bindHandles = function( isBind ) {
  var binder;
  if ( window.navigator.pointerEnabled ) {
    binder = this.bindPointer;
  } else if ( window.navigator.msPointerEnabled ) {
    binder = this.bindMSPointer;
  } else {
    binder = this.bindMouseTouch;
  }
  // munge isBind, default to true
  isBind = isBind === undefined ? true : !!isBind;
  for ( var i=0, len = this.handles.length; i < len; i++ ) {
    var handle = this.handles[i];
    binder.call( this, handle, isBind );
  }
};

Unipointer.prototype.bindPointer = function( handle, isBind ) {
  // W3C Pointer Events, IE11. See https://coderwall.com/p/mfreca
  var bindMethod = isBind ? 'bind' : 'unbind';
  eventie[ bindMethod ]( handle, 'pointerdown', this );
  // disable scrolling on the element
  handle.style.touchAction = isBind ? 'none' : '';
};

Unipointer.prototype.bindMSPointer = function( handle, isBind ) {
  // IE10 Pointer Events
  var bindMethod = isBind ? 'bind' : 'unbind';
  eventie[ bindMethod ]( handle, 'MSPointerDown', this );
  // disable scrolling on the element
  handle.style.msTouchAction = isBind ? 'none' : '';
};

Unipointer.prototype.bindMouseTouch = function( handle, isBind ) {
  // listen for both, for devices like Chrome Pixel
  //   which has touch and mouse events
  var bindMethod = isBind ? 'bind' : 'unbind';
  eventie[ bindMethod ]( handle, 'mousedown', this );
  eventie[ bindMethod ]( handle, 'touchstart', this );
  // TODO re-enable img.ondragstart when unbinding
  if ( isBind ) {
    disableImgOndragstart( handle );
  }
};

// remove default dragging interaction on all images in IE8
// IE8 does its own drag thing on images, which messes stuff up

function noDragStart() {
  return false;
}

// TODO replace this with a IE8 test
var isIE8 = 'attachEvent' in document.documentElement;

// IE8 only
var disableImgOndragstart = !isIE8 ? noop : function( handle ) {

  if ( handle.nodeName === 'IMG' ) {
    handle.ondragstart = noDragStart;
  }

  var images = handle.querySelectorAll('img');
  for ( var i=0, len = images.length; i < len; i++ ) {
    var img = images[i];
    img.ondragstart = noDragStart;
  }
};

// ----- start event ----- //

Unipointer.prototype.onmousedown = function( event ) {
  // dismiss clicks from right or middle buttons
  var button = event.button;
  if ( button && ( button !== 0 && button !== 1 ) ) {
    return;
  }
  this._pointerDown( event, event );
};

Unipointer.prototype.ontouchstart = function( event ) {
  this._pointerDown( event, event.changedTouches[0] );
};

Unipointer.prototype.onMSPointerDown =
Unipointer.prototype.onpointerdown = function( event ) {
  this._pointerDown( event, event );
};

// hash of events to be bound after start event
var postStartEvents = {
  mousedown: [ 'mousemove', 'mouseup' ],
  touchstart: [ 'touchmove', 'touchend', 'touchcancel' ],
  pointerdown: [ 'pointermove', 'pointerup', 'pointercancel' ],
  MSPointerDown: [ 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel' ]
};

/**
 * pointer start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
Unipointer.prototype._pointerDown = function( event, pointer ) {
  // dismiss other pointers
  if ( this.isPointerDown ) {
    return;
  }

  this.isPointerDown = true;

  // save pointer identifier to match up touch events
  this.pointerIdentifier = pointer.pointerId !== undefined ?
    // pointerId for pointer events, touch.indentifier for touch events
    pointer.pointerId : pointer.identifier;

  // bind move and end events
  this._bindPostStartEvents({
    // get proper events to match start event
    events: postStartEvents[ event.type ],
    // IE8 needs to be bound to document
    node: event.preventDefault ? window : document
  });

  this.pointerDown( event, pointer );
  this.emitEvent( 'pointerDown', [ this, event, pointer ] );
};

Unipointer.prototype.pointerDown = noop;

// ----- bind/unbind ----- //

Unipointer.prototype._bindPostStartEvents = function( args ) {
  for ( var i=0, len = args.events.length; i < len; i++ ) {
    var event = args.events[i];
    eventie.bind( args.node, event, this );
  }
  // save these arguments
  this._boundPointerEvents = args;
};

Unipointer.prototype._unbindPostStartEvents = function() {
  var args = this._boundPointerEvents;
  // IE8 can trigger dragEnd twice, check for _boundEvents
  if ( !args || !args.events ) {
    return;
  }

  for ( var i=0, len = args.events.length; i < len; i++ ) {
    var event = args.events[i];
    eventie.unbind( args.node, event, this );
  }
  delete this._boundPointerEvents;
};

// ----- move event ----- //

Unipointer.prototype.onmousemove = function( event ) {
  this._pointerMove( event, event );
};

Unipointer.prototype.onMSPointerMove =
Unipointer.prototype.onpointermove = function( event ) {
  if ( event.pointerId === this.pointerIdentifier ) {
    this._pointerMove( event, event );
  }
};

Unipointer.prototype.ontouchmove = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this._pointerMove( event, touch );
  }
};

/**
 * drag move
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
Unipointer.prototype._pointerMove = function( event, pointer ) {
  this.pointerMove( event, pointer );
  this.emitEvent( 'pointerMove', [ this, event, pointer ] );
};

Unipointer.prototype.pointerMove = noop;

// ----- end event ----- //

Unipointer.prototype.onmouseup = function( event ) {
  this._pointerUp( event, event );
};

Unipointer.prototype.onMSPointerUp =
Unipointer.prototype.onpointerup = function( event ) {
  if ( event.pointerId === this.pointerIdentifier ) {
    this._pointerUp( event, event );
  }
};

Unipointer.prototype.ontouchend = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this._pointerUp( event, touch );
  }
};

/**
 * drag end
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
Unipointer.prototype._pointerUp = function( event, pointer ) {
  this.isPointerDown = false;

  delete this.pointerIdentifier;

  // remove events
  this._unbindPostStartEvents();

  this.pointerUp( event, pointer );
  this.emitEvent( 'pointerUp', [ this, event, pointer ] );
};

Unipointer.prototype.pointerUp = noop;

// ----- cancel event ----- //

// coerce to end event

Unipointer.prototype.onMSPointerCancel =
Unipointer.prototype.onpointercancel = function( event ) {
  if ( event.pointerId === this.pointerIdentifier ) {
    this._pointerUp( event, event );
  }
};

Unipointer.prototype.ontouchcancel = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  this._pointerUp( event, touch );
};

// -----  ----- //

Unipointer.getPointerPoint = function( pointer ) {
  return {
    x: pointer.pageX !== undefined ? pointer.pageX : pointer.clientX,
    y: pointer.pageY !== undefined ? pointer.pageY : pointer.clientY
  };
};

// fix for IE8
Unipointer.setPointerPoint = function( point, pointer ) {
  point.x = pointer.pageX !== undefined ? pointer.pageX : pointer.clientX;
  point.y = pointer.pageY !== undefined ? pointer.pageY : pointer.clientY;
};

// -----  ----- //

window.Unipointer = Unipointer;

})( window );
