/*!
 * Tap listener
 * listens to taps
 */

( function( window, factory ) {
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'eventie/eventie'
    ], function( eventie, utils ) {
      return factory( window, eventie, utils );
    });
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('eventie')
    );
  } else {
    // browser global
    window.TapListener = factory(
      window,
      window.eventie
    );
  }

}( window, function factory( window, eventie ) {

'use strict';

function getPointerPoint( pointer ) {
  return {
    x: pointer.pageX !== undefined ? pointer.pageX : pointer.clientX,
    y: pointer.pageY !== undefined ? pointer.pageY : pointer.clientY
  };
}

// --------------------------  TapListener -------------------------- //

function TapListener( elem, callback ) {
  this.element = elem;
  this.callback = callback;
  this.bindStartEvent();
}

TapListener.prototype.bindStartEvent = function() {
  this._bindStartEvent( true );
};

TapListener.prototype.unbindStartEvent = function() {
  this._bindStartEvent( false );
};

/**
 * works as unbinder, as you can ._bindStart( false ) to unbind
 * @param {Boolean} isBind - will unbind if falsey
 */
TapListener.prototype._bindStartEvent = function( isBind ) {
  // munge isBind, default to true
  isBind = isBind === undefined ? true : !!isBind;
  var bindMethod = isBind ? 'bind' : 'unbind';

  if ( window.navigator.pointerEnabled ) {
    // W3C Pointer Events, IE11. See https://coderwall.com/p/mfreca
    eventie[ bindMethod ]( this.element, 'pointerdown', this );
  } else if ( window.navigator.msPointerEnabled ) {
    // IE10 Pointer Events
    eventie[ bindMethod ]( this.element, 'MSPointerDown', this );
  } else {
    // listen for both, for devices like Chrome Pixel
    eventie[ bindMethod ]( this.element, 'mousedown', this );
    eventie[ bindMethod ]( this.element, 'touchstart', this );
  }
};

// trigger handler methods for events
TapListener.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// returns the touch that we're keeping track of
TapListener.prototype.getTouch = function( touches ) {
  for ( var i=0, len = touches.length; i < len; i++ ) {
    var touch = touches[i];
    if ( touch.identifier == this.pointerIdentifier ) {
      return touch;
    }
  }
};

// ----- start event ----- //

TapListener.prototype.onmousedown = function( event ) {
  // dismiss clicks from right or middle buttons
  var button = event.button;
  if ( button && ( button !== 0 && button !== 1 ) ) {
    return;
  }
  this.pointerDown( event, event );
};

TapListener.prototype.ontouchstart = function( event ) {
  this.pointerDown( event, event.changedTouches[0] );
};

TapListener.prototype.onMSPointerDown =
TapListener.prototype.onpointerdown = function( event ) {
  this.pointerDown( event, event );
};

// hash of events to be bound after start event
var postStartEvents = {
  mousedown: [ 'mouseup' ],
  touchstart: [ 'touchend', 'touchcancel' ],
  pointerdown: [ 'pointerup', 'pointercancel' ],
  MSPointerDown: [ 'MSPointerUp', 'MSPointerCancel' ]
};

/**
 * pointer start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
TapListener.prototype.pointerDown = function( event, pointer ) {
  // dismiss other pointers
  if ( this.isPointerDown ) {
    return;
  }

  this.isPointerDown = true;
  // save pointer identifier to match up touch events
  this.pointerIdentifier = pointer.pointerId !== undefined ?
    // pointerId for pointer events, touch.indentifier for touch events
    pointer.pointerId : pointer.identifier;

  // bind end and cancel events
  this._bindPostStartEvents({
    // get proper events to match start event
    events: postStartEvents[ event.type ],
    // IE8 needs to be bound to document
    node: event.preventDefault ? window : document
  });

  // HACK, should emit pointerDown event
  if ( this.onPointerDown ) {
    this.onPointerDown( event, pointer );
  }
};

// ----- bind/unbind ----- //

TapListener.prototype._bindPostStartEvents = function( args ) {
  for ( var i=0, len = args.events.length; i < len; i++ ) {
    var event = args.events[i];
    eventie.bind( args.node, event, this );
  }
  // save these arguments
  this._boundPointerEvents = args;
};

TapListener.prototype._unbindPostStartEvents = function() {
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

// ----- end event ----- //

TapListener.prototype.onmouseup = function( event ) {
  this.pointerUp( event, event );
};

TapListener.prototype.onMSPointerUp =
TapListener.prototype.onpointerup = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this.pointerUp( event, event );
  }
};

TapListener.prototype.ontouchend = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this.pointerUp( event, touch );
  }
};

/**
 * drag end
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
TapListener.prototype.pointerUp = function( event, pointer ) {
  this.pointerDone();
  // console.log('pointer up');
  var pointerPoint = getPointerPoint( pointer );
  var boundingRect = this.element.getBoundingClientRect();
  var scrollX = window.pageXOffset;
  var scrollY = window.pageYOffset;
  var isInside = pointerPoint.x >= boundingRect.left + scrollX &&
    pointerPoint.x <= boundingRect.right + scrollX &&
    pointerPoint.y >= boundingRect.top + scrollY &&
    pointerPoint.y <= boundingRect.bottom + scrollY;
  // trigger callback if pointer is inside element
  if ( isInside ) {
    // console.log( event.target );
    this.callback.call( this.element, event, pointer );
  }
};

// ----- pointer done ----- //

TapListener.prototype.pointerDone = function() {
  this.isPointerDown = false;
  delete this.pointerIdentifier;
  // remove events
  this._unbindPostStartEvents();
};

// ----- cancel event ----- //

TapListener.prototype.onMSPointerCancel =
TapListener.prototype.onpointercancel = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this.pointerDone();
  }
};

TapListener.prototype.ontouchcancel = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this.pointerDone();
  }
};

// ----- destroy ----- //

TapListener.prototype.destroy = function() {
  this.pointerDone();
  this.unbindStartEvent();
};

// -----  ----- //

return TapListener;

}));
