( function( window ) {

function Cell( elem, parent ) {
  this.element = elem;
  this.parent = parent;

  this.create();
}

Cell.prototype.create = function() {
  this.element.style.position = 'absolute';
};

window.Cell = Cell;

})( window );
