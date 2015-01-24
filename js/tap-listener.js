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
      'unipointer/unipointer'
    ], function( Unipointer ) {
      return factory( window, Unipointer );
    });
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('unipointer')
    );
  } else {
    // browser global
    window.TapListener = factory(
      window,
      window.Unipointer
    );
  }

}( window, function factory( window, Unipointer ) {

'use strict';

// --------------------------  TapListener -------------------------- //

function TapListener( elem, callback ) {
  this.element = elem;
  this.callback = callback;
  this.bindStartEvent();
}

// inherit Unipointer & EventEmitter
TapListener.prototype = new Unipointer();

TapListener.prototype.bindStartEvent = function() {
  this._bindStartEvent( this.element, true );
};

TapListener.prototype.unbindStartEvent = function() {
  this._bindStartEvent( this.element, false );
};

/**
 * pointer up
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
TapListener.prototype.pointerUp = function( event, pointer ) {
  // console.log('pointer up');
  var pointerPoint = Unipointer.getPointerPoint( pointer );
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

TapListener.prototype.destroy = function() {
  this.pointerDone();
  this.unbindStartEvent();
};

// -----  ----- //

return TapListener;

}));
