/*!
 * Flickity
 * Touch responsive gallery
 * http://isotope.metafizzy.co
 */

/*global EventEmitter: false */

( function( window ) {

'use strict';

// -------------------------- utils -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

// -------------------------- Flickity -------------------------- //

function Flickity( element, options ) {
  // use element as selector string
  if ( typeof element === 'string' ) {
    element = document.querySelector( element );
  }
  this.element = element;

  // options
  this.options = extend( {}, this.constructor.defaults );
  this.option( options );

  // kick things off
  this._create();
}

Flickity.defaults = {
};

// inherit EventEmitter
Flickity.prototype = new EventEmitter();

Flickity.prototype._create = function() {

};

window.Flickty = Flickity;

})( window );
