// Flickity.Cell
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('get-size') );
  } else {
    // browser global
    window.Flickity = window.Flickity || {};
    window.Flickity.Cell = factory( window.getSize );
  }

}( typeof window != 'undefined' ? window : this, function factory( getSize ) {

const cellClassName = 'flickity-cell';

function Cell( elem ) {
  this.element = elem;
  this.element.classList.add( cellClassName );

  this.x = 0;
  this.unselect();
}

let proto = Cell.prototype;

proto.destroy = function() {
  // reset style
  this.unselect();
  this.element.classList.remove( cellClassName );
  this.element.style.transform = '';
  this.element.removeAttribute('aria-hidden');
};

proto.getSize = function() {
  this.size = getSize( this.element );
};

proto.select = function() {
  this.element.classList.add('is-selected');
  this.element.removeAttribute('aria-hidden');
};

proto.unselect = function() {
  this.element.classList.remove('is-selected');
  this.element.setAttribute( 'aria-hidden', 'true' );
};

proto.remove = function() {
  this.element.remove();
};

return Cell;

} ) );
