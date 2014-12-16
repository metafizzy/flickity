/*!
 * Flickity
 * Touch responsive gallery
 */

/*global EventEmitter: false, Cell: false */

( function( window ) {

'use strict';

// utils
var U = window.utils;

// -------------------------- Flickity -------------------------- //

function Flickity( element, options ) {
  // use element as selector string
  if ( typeof element === 'string' ) {
    element = document.querySelector( element );
  }
  this.element = element;

  // options
  this.options = U.extend( {}, this.constructor.defaults );
  this.option( options );

  // kick things off
  this._create();
}

Flickity.defaults = {
};

// inherit EventEmitter
U.extend( Flickity.prototype, EventEmitter.prototype );
U.extend( Flickity.prototype, Unipointer.prototype );

Flickity.prototype._create = function() {
  // variables
  this.x = 0;

  // set up elements
  // style element
  this.element.style.position = 'relative';
  this.element.style.overflow = 'hidden';
  // slider element does all the positioning
  this.slider = document.createElement('div');
  this.slider.className = 'flickity-slider';
  this.slider.style.position = 'absolute';
  this.slider.style.width = '100%';
  // wrap child elements in slider
  while ( this.element.children.length ) {
    this.slider.appendChild( this.element.children[0] );
  }
  this.element.appendChild( this.slider );

  // get cells from children
  this.reloadCells();
  // set height
  var firstCell = this.cells[0];
  firstCell.getSize();
  this.element.style.height = firstCell.size.outerHeight + 'px';

  // events


  this.element.addEventListener( 'mousedown', this, false );

};

/**
 * set options
 * @param {Object} opts
 */
Flickity.prototype.option = function( opts ) {
  U.extend( this.options, opts );
};

// goes through all children
Flickity.prototype.reloadCells = function() {
  // collection of item elements
  this.cells = this._makeCells( this.slider.children );
  this.positionCells( this.cells );
};

/**
 * turn elements into Flickity.Cells
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Flickity Cells
 */
Flickity.prototype._makeCells = function( elems ) {
  var cellElems = U.filterFindElements( elems, this.options.cellSelector );

  // create new Flickity for collection
  var cells = [];
  for ( var i=0, len = cellElems.length; i < len; i++ ) {
    var elem = cellElems[i];
    var cell = new Cell( elem, this );
    cells.push( cell );
  }

  return cells;
};


/**
 * @param {Array} cells - Array of Cells
 */
Flickity.prototype.positionCells = function() {
  var cellX = 0;
  for ( var i=0, len = this.cells.length; i < len; i++ ) {
    var cell = this.cells[i];
    cell.setPosition( cellX );
    cell.getSize();
    cellX += cell.size.outerWidth;
  }
};

// -------------------------- pointer events -------------------------- //

Flickity.prototype.pointerDown = function( event, pointer ) {
  console.log('pointer down');
}

Flickity.prototype.pointerMove = function( event, pointer ) {
  console.log('pointer move');
}

Flickity.prototype.pointerUp = function( event, pointer ) {
  console.log('pointer up');
}

// --------------------------  -------------------------- //


window.Flickity = Flickity;

})( window );
