( function( window ) {

function Cell( elem, parent ) {
  this.element = elem;
  this.parent = parent;

  this.create();
}

Cell.prototype.create = function() {
  this.element.style.position = 'absolute';
};

Cell.prototype.getSize = function() {
  this.size = getSize( this.element );
};

Cell.prototype.setPosition = function( x ) {
  this.element.style.left = x + 'px';
}

window.Cell = Cell;

})( window );
