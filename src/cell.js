( function( window ) {

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
  // pixel positioning
  this.element.style.left = this.parent.options.pixelPositioning ? x + 'px' :
    // percent positioning
    ( ( x / this.parent.size.width ) * 100 ) + '%';
};

window.Cell = Cell;

})( window );
