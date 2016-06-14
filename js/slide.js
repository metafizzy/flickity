( function() {

'use strict';

function Slide( parent ) {
  this.parent = parent;
  this.isOriginLeft = parent.originSide == 'left';
  this.cells = [];
  this.outerWidth = 0;
}

Slide.prototype.addCell = function( cell ) {
  this.cells.push( cell );
  this.outerWidth += cell.size.outerWidth;
  // first cell stuff
  if ( this.cells.length == 1 ) {
    this.x = cell.x; // x comes from first cell
    var beginMargin = this.isOriginLeft ? 'marginLeft' : 'marginRight';
    this.firstMargin = cell.size[ beginMargin ];
  }
};

Slide.prototype.updateTarget = function() {
  var endMargin = this.isOriginLeft ? 'marginRight' : 'marginLeft';
  var lastMargin = this.getLastCell().size[ endMargin ];
  var slideWidth = this.outerWidth - ( this.firstMargin + lastMargin );
  this.target = this.x + this.firstMargin + slideWidth * this.parent.cellAlign;
};

Slide.prototype.getLastCell = function() {
  return this.cells[ this.cells.length - 1 ];
};

Slide.prototype.select = function() {
  this.changeSelectedClass('add');
};

Slide.prototype.unselect = function() {
  this.changeSelectedClass('remove');
};

Slide.prototype.changeSelectedClass = function( method ) {
  this.cells.forEach( function( cell ) {
    cell.element.classList[ method ]('is-selected');
  });
};

Slide.prototype.getCellElements = function() {
  return this.cells.map( function( cell ) {
    return cell.element;
  });
};

window.Slide = Slide;

})();
