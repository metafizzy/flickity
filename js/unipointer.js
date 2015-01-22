( function( window, factory ) {
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'eventie/eventie'
    ], function( eventie ) {
      return factory( window, eventie );
    });
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('eventie')
    );
  } else {
    // browser global
    window.Unipointer = factory(
      window,
      window.eventie
    );
  }

}( window, function factory( window, eventie ) {

'use strict';

// -----  ----- //

function noop() {}

// handle IE8 prevent default
function preventDefaultEvent( event ) {
  if ( event.preventDefault ) {
    event.preventDefault();
  } else {
    event.returnValue = false;
  }
}

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
    if ( touch.identifier == this.pointerIdentifier ) {
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

  if ( handle.nodeName == 'IMG' ) {
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

var allowTouchstartNodes = {
  INPUT: true,
  A: true,
  BUTTON: true
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
  // track to see when dragging starts
  this.pointerDownPoint = Unipointer.getPointerPoint( pointer );

  var targetNodeName = event.target.nodeName;
  // HACK iOS, allow clicks on buttons, inputs, and links
  var isTouchstart = event.type == 'touchstart';
  var isTouchstartNode = allowTouchstartNodes[ targetNodeName ];
  if ( !isTouchstart || ( isTouchstart && !isTouchstartNode ) ) {
    preventDefaultEvent( event );
  }
  // kludge to blur focused inputs in dragger
  var focused = document.activeElement;
  if ( focused && focused.blur && focused != this.element ) {
    focused.blur();
  }
  // focus element, if its not an input
  if ( this.options.accessibility && targetNodeName != 'INPUT' ) {
    this.element.focus();
  }

  // bind move and end events
  this._bindPostStartEvents({
    // get proper events to match start event
    events: postStartEvents[ event.type ],
    // IE8 needs to be bound to document
    node: event.preventDefault ? window : document
  });

  this.pointerDown( event, pointer );
};

Unipointer.prototype.pointerDown = function( event, pointer ) {
  this.emitEvent( 'pointerDown', [ this, event, pointer ] );
};

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
  if ( event.pointerId == this.pointerIdentifier ) {
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
  var movePoint = Unipointer.getPointerPoint( pointer );
  var moveVector = {
    x: movePoint.x - this.pointerDownPoint.x,
    y: movePoint.y - this.pointerDownPoint.y
  };
  // function to check if pointer has moved far enough to start drag
  var hasDragStarted = this.hasDragStarted || function( moveVector ) {
    return Math.abs( moveVector.x ) > 3 || Math.abs( moveVector.x ) > 3;
  };
  // start drag
  if ( !this.isDragging && hasDragStarted( moveVector ) ) {
    this._dragStart( event, pointer );
  }

  this.pointerMove( event, pointer, moveVector );
  this._dragMove( event, pointer, moveVector );
};

Unipointer.prototype.pointerMove = function( event, pointer, moveVector ) {
  this.emitEvent( 'pointerMove', [ this, event, pointer, moveVector ] );
};

// ----- end event ----- //

Unipointer.prototype.onmouseup = function( event ) {
  this._pointerUp( event, event );
};

Unipointer.prototype.onMSPointerUp =
Unipointer.prototype.onpointerup = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
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

  if ( this.isDragging ) {
    this._dragEnd( event, pointer );
  } else {
    // pointer didn't move enough for drag to start
    this._staticClick( event, pointer );
  }

  this.pointerUp( event, pointer );
};

Unipointer.prototype.pointerUp = function( event, pointer ) {
  this.emitEvent( 'pointerUp', [ this, event, pointer ] );
};

// ----- cancel event ----- //

// coerce to end event

Unipointer.prototype.onMSPointerCancel =
Unipointer.prototype.onpointercancel = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this._pointerUp( event, event );
  }
};

Unipointer.prototype.ontouchcancel = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  this._pointerUp( event, touch );
};

// -------------------------- drag -------------------------- //

// dragStart
Unipointer.prototype._dragStart = function( event, pointer ) {
  this.isDragging = true;
  this.dragStartPoint = Unipointer.getPointerPoint( pointer );
  // prevent clicks
  this.isPreventingClicks = true;

  this.dragStart( event, pointer );
};

Unipointer.prototype.dragStart = function( event, pointer ) {
  this.emitEvent( 'dragStart', [ this, event, pointer ] );
};

// dragMove
Unipointer.prototype._dragMove = function( event, pointer, moveVector ) {
  // do not drag if not dragging yet
  if ( !this.isDragging ) {
    return;
  }

  this.dragMove( event, pointer, moveVector );
};

Unipointer.prototype.dragMove = function( event, pointer, moveVector ) {
  this.emitEvent( 'dragMove', [ this, event, pointer, moveVector ] );
};

// dragEnd
Unipointer.prototype._dragEnd = function( event, pointer ) {
  // set flags
  this.isDragging = false;
  this.dragEnd( event, pointer );
};

Unipointer.prototype.dragEnd = function( event, pointer ) {
  this.emitEvent( 'dragEnd', [ this, event, pointer ] );
};

// ----- onclick ----- //

// handle all clicks and prevent clicks when dragging
Unipointer.prototype.onclick = function( event ) {
  if ( this.isPreventingClicks ) {
    preventDefaultEvent( event );
  }
};

// ----- staticClick ----- //

// triggered after pointer down & up with no/tiny movement
Unipointer.prototype._staticClick = function( event, pointer ) {
  // allow click in text input
  if ( event.target.nodeName == 'INPUT' && event.target.type == 'text' ) {
    event.target.focus();
  }
  this.staticClick( event, pointer );
};

Unipointer.prototype.staticClick = function( event, pointer ) {
  this.emitEvent( 'staticClick', [ this, event, pointer ] );
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

return Unipointer;

}));
