/*!
 * Flickity
 * Touch responsive gallery
 * http://isotope.metafizzy.co
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
Flickity.prototype = new EventEmitter();

Flickity.prototype._create = function() {
  // get cells from children
  this.reloadCells();
};

// goes through all children
Flickity.prototype.reloadCells = function() {
  // collection of item elements
  this.cells = this._makeCells( this.element.children );
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


window.Flickity = Flickity;

})( window );
