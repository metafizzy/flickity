( function( window, factory ) {
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'eventie/eventie',
      'fizzy-ui-utils/utils'
    ], function( eventie, utils ) {
      return factory( window, eventie, utils );
    });
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('eventie'),
      require('fizzy-ui-utils')
    );
  } else {
    // browser global
    window.pointerTap = factory(
      window,
      window.eventie,
      window.fizzyUIUtils
    );
  }

}( window, function factory( window, eventie, utils ) {

'use strict';

// --------------------------  -------------------------- //

// --------------------------  -------------------------- //

function TapListener( elem, callback ) {
  this.element = elem;
  this.callback = callback;
  this._bindStart( true );
}

/**
 * works as unbinder, as you can ._bindStart( false ) to unbind
 * @param {Boolean} isBind - will unbind if falsey
 */
TapListener.prototype._bindStart = function( isBind ) {
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
  this._pointerDown( event, event );
};

TapListener.prototype.ontouchstart = function( event ) {
  this._pointerDown( event, event.changedTouches[0] );
};

TapListener.prototype.onMSPointerDown =
TapListener.prototype.onpointerdown = function( event ) {
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
TapListener.prototype._pointerDown = function( event, pointer ) {
  // dismiss other pointers
  if ( this.isPointerDown ) {
    return;
  }

  // prevent iOS from doing psuedo-clicks
  if ( event.type == 'touchstart' ) {
    event.preventDefault();
  }

  // console.log('pointer down');
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

// ----- move event ----- //

TapListener.prototype.onmousemove = function( event ) {
  this._pointerMove( event, event );
};

TapListener.prototype.onMSPointerMove =
TapListener.prototype.onpointermove = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this._pointerMove( event, event );
  }
};

TapListener.prototype.ontouchmove = function( event ) {
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
TapListener.prototype._pointerMove = function( event, pointer ) {
  // var movePoint = getPointerPoint( pointer );
  // var moveVector = {
  //   x: movePoint.x - this.pointerDownPoint.x,
  //   y: movePoint.y - this.pointerDownPoint.y
  // };
  // TODO detect if pointer has moved outside or inside element
};

// ----- end event ----- //

TapListener.prototype.onmouseup = function( event ) {
  this._pointerUp( event, event );
};

TapListener.prototype.onMSPointerUp =
TapListener.prototype.onpointerup = function( event ) {
  if ( event.pointerId == this.pointerIdentifier ) {
    this._pointerUp( event, event );
  }
};

TapListener.prototype.ontouchend = function( event ) {
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
TapListener.prototype._pointerUp = function( event, pointer ) {
  this.pointerDone();
  // console.log('pointer up');
  var pointerPoint = getPointerPoint( pointer );
  var boundingRect = this.element.getBoundingClientRect();
  var isInside = pointerPoint.x >= boundingRect.left &&
    pointerPoint.x <= boundingRect.right &&
    pointerPoint.y >= boundingRect.top &&
    pointerPoint.y <= boundingRect.bottom;

  // trigger callback if pointer is inside element
  if ( isInside ) {
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


// -----  ----- //

var pointerTap = {};

pointerTap.bind = function( elem, callback ) {
  new TapListener( elem, callback );
};

// -----  ----- //

function getPointerPoint( pointer ) {
  return {
    x: pointer.pageX !== undefined ? pointer.pageX : pointer.clientX,
    y: pointer.pageY !== undefined ? pointer.pageY : pointer.clientY
  };
}

window.TapListener = TapListener;

return pointerTap;



}));
