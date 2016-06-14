( function() {

'use strict';

function Slide( parent ) {
  this.parent = parent;
  this.cells = [];
  this.width = 0;
}

Slide.prototype.addCell = function( cell ) {
  this.cells.push( cell );
  // first cell logic
  if ( this.cells.length == 1 ) {
    this.width = cell.size.width;
    this.x = cell.x;
  }
};

Slide.prototype.updateTarget = function() {
  var marginProperty = this.parent.originSide == 'left' ?
    'marginLeft' : 'marginRight';
  var firstMargin = this.cells[0].size[ marginProperty ];
  this.target = this.x + firstMargin + this.width * this.parent.cellAlign;
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
