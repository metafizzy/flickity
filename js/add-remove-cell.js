// add, remove cell
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        require('./core'),
        require('fizzy-ui-utils'),
    );
  } else {
    // browser global
    factory(
        window.Flickity,
        window.fizzyUIUtils,
    );
  }

}( typeof window != 'undefined' ? window : this, function factory( Flickity, utils ) {

// append cells to a document fragment
function getCellsFragment( cells ) {
  let fragment = document.createDocumentFragment();
  cells.forEach( ( cell ) => fragment.appendChild( cell.element ) );
  return fragment;
}

// -------------------------- add/remove cell prototype -------------------------- //

let proto = Flickity.prototype;

/**
 * Insert, prepend, or append cells
 * @param {[Element, Array, NodeList]} elems - Elements to insert
 * @param {Integer} index - Zero-based number to insert
 */
proto.insert = function( elems, index ) {
  let cells = this._makeCells( elems );
  if ( !cells || !cells.length ) return;

  let len = this.cells.length;
  // default to append
  index = index === undefined ? len : index;
  // add cells with document fragment
  let fragment = getCellsFragment( cells );
  // append to slider
  let isAppend = index === len;
  if ( isAppend ) {
    this.slider.appendChild( fragment );
  } else {
    let insertCellElement = this.cells[ index ].element;
    this.slider.insertBefore( fragment, insertCellElement );
  }
  // add to this.cells
  if ( index === 0 ) {
    // prepend, add to start
    this.cells = cells.concat( this.cells );
  } else if ( isAppend ) {
    // append, add to end
    this.cells = this.cells.concat( cells );
  } else {
    // insert in this.cells
    let endCells = this.cells.splice( index, len - index );
    this.cells = this.cells.concat( cells ).concat( endCells );
  }

  this._sizeCells( cells );
  this.cellChange( index );
  this.positionSliderAtSelected();
};

proto.append = function( elems ) {
  this.insert( elems, this.cells.length );
};

proto.prepend = function( elems ) {
  this.insert( elems, 0 );
};

/**
 * Remove cells
 * @param {[Element, Array, NodeList]} elems - ELements to remove
 */
proto.remove = function( elems ) {
  let cells = this.getCells( elems );
  if ( !cells || !cells.length ) return;

  let minCellIndex = this.cells.length - 1;
  // remove cells from collection & DOM
  cells.forEach( ( cell ) => {
    cell.remove();
    let index = this.cells.indexOf( cell );
    minCellIndex = Math.min( index, minCellIndex );
    utils.removeFrom( this.cells, cell );
  } );

  this.cellChange( minCellIndex );
  this.positionSliderAtSelected();
};

/**
 * logic to be run after a cell's size changes
 * @param {Element} elem - cell's element
 */
proto.cellSizeChange = function( elem ) {
  let cell = this.getCell( elem );
  if ( !cell ) return;

  cell.getSize();

  let index = this.cells.indexOf( cell );
  this.cellChange( index );
  // do not position slider after lazy load
};

/**
 * logic any time a cell is changed: added, removed, or size changed
 * @param {Integer} changedCellIndex - index of the changed cell, optional
 */
proto.cellChange = function( changedCellIndex ) {
  let prevSelectedElem = this.selectedElement;
  this._positionCells( changedCellIndex );
  this._updateWrapShiftCells();
  this.setGallerySize();
  // update selectedIndex, try to maintain position & select previous selected element
  let cell = this.getCell( prevSelectedElem );
  if ( cell ) this.selectedIndex = this.getCellSlideIndex( cell );
  this.selectedIndex = Math.min( this.slides.length - 1, this.selectedIndex );

  this.emitEvent( 'cellChange', [ changedCellIndex ] );
  // position slider
  this.select( this.selectedIndex );
};

// -----  ----- //

return Flickity;

} ) );
