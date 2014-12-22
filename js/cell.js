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
};

Cell.prototype.getSize = function() {
  this.size = getSize( this.element );
};

Cell.prototype.setPosition = function( x ) {
  this.x = x;
  this.target = x + this.size.width * this.parent.options.targetPosition;
  // render position of cell with in slider
  var side = this.parent.options.rightToLeft ? 'right' : 'left';
  this.element.style[ side ] = this.parent.getPositionValue( this.x );
};

window.Cell = Cell;

})( window );
