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

window.Slide = Slide;

})();
