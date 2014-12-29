/*global eventie: false */

// -------------------------- PageDots -------------------------- //

( function( window ) {

'use strict';

var U = window.utils;

function PageDots( parent ) {
  this.parent = parent;
  this._create();
}

PageDots.prototype._create = function() {
  // create holder element
  this.holder = document.createElement('ol');
  this.holder.className = 'flickity-page-dots';

  // create dots, array of elementss
  this.dots = [];

  for ( var i=0, len = this.parent.cells.length; i < len; i++ ) {
    var dot = document.createElement('li');
    dot.className = 'dot';
    this.holder.appendChild( dot );
    this.dots.push( dot );
  }

  this.update();

  // update on select
  var _this = this;
  this.onselect = function() {
    _this.update();
  };
  this.parent.on( 'select', this.onselect );

  eventie.bind( this.holder, 'click', this );

  this.parent.element.appendChild( this.holder );
};

PageDots.prototype.update = function() {
  // remove selected class on previous
  if ( this.selectedDot ) {
    this.selectedDot.className = 'dot';
  }

  this.selectedDot = this.dots[ this.parent.selectedIndex ];
  this.selectedDot.className = 'dot selected';
};

// trigger handler methods for events
PageDots.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

PageDots.prototype.onclick = function( event ) {
  var target = event.target;
  // only care about dot clicks
  if ( target.nodeName !== 'LI' ) {
    return;
  }

  var index = U.indexOf( this.dots, target );
  this.parent.select( index );
  this.parent.player.stop();
};

window.PageDots = PageDots;

})( window );
