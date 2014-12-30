/*global getSize: false */

( function( window ) {

'use strict';

function Cell( elem, parent ) {
  this.element = elem;
  this.parent = parent;

  this.create();
}

Cell.prototype.create = function() {
  this.element.style.position = 'absolute';
  this.x = 0;
  this.shift = 0;
};

Cell.prototype.getSize = function() {
  this.size = getSize( this.element );
};

Cell.prototype.setPosition = function( x ) {
  this.x = x;
  this.target = x + this.size.width * this.parent.options.targetPosition;
  this.renderPosition( x );
};

Cell.prototype.renderPosition = function( x ) {
  // render position of cell with in slider
  var side = this.parent.getOriginSide();
  this.element.style[ side ] = this.parent.getPositionValue( x );
};

/**
 * @param {Integer} factor - 0, 1, or -1
**/
Cell.prototype.wrapShift = function( shift ) {
  this.shift = shift;
  this.renderPosition( this.x + this.parent.slideableWidth * shift );
};

window.Cell = Cell;

})( window );
