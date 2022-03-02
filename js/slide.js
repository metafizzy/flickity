// slide
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    window.Flickity = window.Flickity || {};
    window.Flickity.Slide = factory();
  }

}( typeof window != 'undefined' ? window : this, function factory() {

function Slide( beginMargin, endMargin, cellAlign ) {
  this.beginMargin = beginMargin;
  this.endMargin = endMargin;
  this.cellAlign = cellAlign;
  this.cells = [];
  this.outerWidth = 0;
  this.height = 0;
}

let proto = Slide.prototype;

proto.addCell = function( cell ) {
  this.cells.push( cell );
  this.outerWidth += cell.size.outerWidth;
  this.height = Math.max( cell.size.outerHeight, this.height );
  // first cell stuff
  if ( this.cells.length === 1 ) {
    this.x = cell.x; // x comes from first cell
    this.firstMargin = cell.size[ this.beginMargin ];
  }
};

proto.updateTarget = function() {
  let lastCell = this.getLastCell();
  let lastMargin = lastCell ? lastCell.size[ this.endMargin ] : 0;
  let slideWidth = this.outerWidth - ( this.firstMargin + lastMargin );
  this.target = this.x + this.firstMargin + slideWidth * this.cellAlign;
};

proto.getLastCell = function() {
  return this.cells[ this.cells.length - 1 ];
};

proto.select = function() {
  this.cells.forEach( ( cell ) => cell.select() );
};

proto.unselect = function() {
  this.cells.forEach( ( cell ) => cell.unselect() );
};

proto.getCellElements = function() {
  return this.cells.map( ( cell ) => cell.element );
};

return Slide;

} ) );
