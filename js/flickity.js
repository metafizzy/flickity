/*!
 * Flickity
 * Touch responsive gallery
 */

/*global EventEmitter: false, Cell: false, getSize: false, eventie: false, PrevNextButton: false, PageDots: false, Player: false, classie: false */

( function( window ) {

'use strict';

// utils
var jQuery = window.jQuery;
var U = window.utils;
var dragPrototype = window.Flickity.dragPrototype;
var animatePrototype = window.Flickity.animatePrototype;

// -------------------------- Flickity -------------------------- //

// globally unique identifiers
var GUID = 0;
// internal store of all Outlayer intances
var instances = {};

function Flickity( element, options ) {
  // use element as selector string
  if ( typeof element === 'string' ) {
    element = document.querySelector( element );
  }
  this.element = element;
  // add jQuery
  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }
  // options
  this.options = U.extend( {}, this.constructor.defaults );
  this.option( options );

  // kick things off
  this._create();
}

Flickity.defaults = {
  accessibility: true,
  freeScrollFriction: 0.075, // friction when free-scrolling
  friction: 0.25, // friction when selecting
  cursorPosition: 0.5,
  draggable: true,
  pageDots: true,
  prevNextButtons: true,
  resizeBound: true,
  selectedAttraction: 0.025,
  targetPosition: 0.5,
  leftArrowText: '←', // text for prev/next button when no SVG support
  rightArrowText: '→'
};

// inherit EventEmitter
U.extend( Flickity.prototype, EventEmitter.prototype );

Flickity.prototype._create = function() {
  // add id for Outlayer.data
  var id = ++GUID;
  this.element.flickityGUID = id; // expando
  instances[ id ] = this; // associate via id

  // variables
  this.x = 0;
  this.velocity = 0;
  this.accel = 0;

  this.selectedIndex = 0;
  // how many frames slider has been in same position
  this.restingFrames = 0;

  this.element.className += ' flickity-enabled';
  // create viewport element
  this.viewport = document.createElement('div');
  this.viewport.className = 'flickity-viewport';

  this._createSlider();
  this.element.appendChild( this.viewport );

  this.getSize();

  // get cells from children
  this.reloadCells();
  // set height
  var firstCell = this.cells[0];
  this.viewport.style.height = firstCell.size.outerHeight + 'px';


  // add prev/next buttons
  if ( this.options.prevNextButtons ) {
    this.prevButton = new PrevNextButton( -1, this );
    this.nextButton = new PrevNextButton( 1, this );
  }

  if ( this.options.pageDots ) {
    this.pageDots = new PageDots( this );
  }

  this.player = new Player( this );
  if ( this.options.autoPlay ) {
    this.player.play();
  }

  this.positionSliderAtSelected();
  this.select( this.selectedIndex );

  // events
  if ( this.options.draggable ) {
    this.handles = [ this.element ];
    this.bindHandles();
    // bind click handler
    // TODO unbind click handler on destroy
    for ( var i=0, len = this.handles.length; i < len; i++ ) {
      var handle = this.handles[i];
      eventie.bind( handle, 'click', this );
    }
  }

  if ( this.options.resizeBound ) {
    eventie.bind( window, 'resize', this );
  }

  if ( this.options.accessibility ) {
    // allow element to focusable
    this.element.tabIndex = 0;
    // listen for key presses
    eventie.bind( this.element, 'keydown', this );
  }

  // add hover listeners
  if ( this.options.autoPlay ) {
    eventie.bind( this.element, 'mouseenter', this );
    // TODO add event for pointer enter
  }

};

/**
 * set options
 * @param {Object} opts
 */
Flickity.prototype.option = function( opts ) {
  U.extend( this.options, opts );
};

// slider positions the cells
Flickity.prototype._createSlider = function() {
  // slider element does all the positioning
  var slider = document.createElement('div');
  slider.className = 'flickity-slider';
  slider.style.position = 'absolute';
  slider.style.width = '100%';
  var side = this.getOriginSide();
  slider.style[ side ] = 0;
  // wrap child elements in slider
  while ( this.element.children.length ) {
    slider.appendChild( this.element.children[0] );
  }
  this.viewport.appendChild( slider );
  this.slider = slider;
};

Flickity.prototype.getOriginSide = function() {
  return this.options.rightToLeft ? 'right' : 'left';
};

// goes through all children
Flickity.prototype.reloadCells = function() {
  // collection of item elements
  this.cells = this._makeCells( this.slider.children );
  this.positionCells( this.cells );
  this._getWrapShiftCells();
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

Flickity.prototype.getLastCell = function() {
  return this.cells[ this.cells.length - 1 ];
};

// positions all cells
Flickity.prototype.positionCells = function() {
  // size all cells
  this._sizeCells( this.cells );
  // position all cells
  this._positionCells( 0 );
};

/**
 * position certain cells
 * @param {Integer} index - which cell to start with
 */
Flickity.prototype._positionCells = function( index ) {
  var cellX = 0;
  if ( index > 0 ) {
    var startCell = this.cells[ index - 1 ];
    cellX = startCell.x + startCell.size.outerWidth;
  }
  for ( var len = this.cells.length; index < len; index++ ) {
    var cell = this.cells[ index ];
    cell.setPosition( cellX );
    cellX += cell.size.outerWidth;
  }
  // keep track of cellX for wrap-around
  this.slideableWidth = cellX;
};

/**
 * cell.getSize() on multiple cells
 * @param {Array} cells
 */
Flickity.prototype._sizeCells = function( cells ) {
  for ( var i=0, len = cells.length; i < len; i++ ) {
    var cell = cells[i];
    cell.getSize();
  }
};

Flickity.prototype.getSize = function() {
  this.size = getSize( this.element );
  this.cursorPosition = this.size.innerWidth * this.options.cursorPosition;
};

Flickity.prototype._getWrapShiftCells = function() {
  // only for wrap-around
  if ( !this.options.wrapAround ) {
    return;
  }
  // unshift previous cells
  this._unshiftCells( this.beforeShiftCells );
  this._unshiftCells( this.afterShiftCells );
  // get before cells
  // initial gap
  var gapX = this.cursorPosition;
  var cellIndex = this.cells.length - 1;
  this.beforeShiftCells = this._getGapCells( gapX, cellIndex, -1 );
  // get after cells
  // ending gap between last cell and end of gallery viewport
  gapX = this.size.innerWidth - this.cursorPosition;
  // start cloning at first cell, working forwards
  this.afterShiftCells = this._getGapCells( gapX, 0, 1 );
};

Flickity.prototype._getGapCells = function( gapX, cellIndex, increment ) {
  // keep adding cells until the cover the initial gap
  var cells = [];
  while ( gapX >= 0 ) {
    var cell = this.cells[ cellIndex ];
    cells.push( cell );
    cellIndex += increment;
    gapX -= cell.size.outerWidth;
  }
  return cells;
};

/**
 * emits events via eventEmitter and jQuery events
 * @param {String} type - name of event
 * @param {Event} event - original event
 * @param {Array} args - extra arguments
 */
Flickity.prototype.dispatchEvent = function( type, event, args ) {
  var emitArgs = [ event ].concat( args );
  this.emitEvent( type, emitArgs );

  if ( jQuery && this.$element ) {
    if ( event ) {
      // create jQuery event
      var $event = jQuery.Event( event );
      $event.type = type;
      this.$element.trigger( $event, args );
    } else {
      // just trigger with type if no event available
      this.$element.trigger( type, args );
    }
  }
};

// -------------------------- select -------------------------- //

/**
 * @param {Integer} index - index of the cell
 * @param {Boolean} isWrap - will wrap-around to last/first if at the end
 */
Flickity.prototype.select = function( index, isWrap ) {
  // wrap position so slider is within normal area
  if ( this.options.wrapAround ) {
    if ( index < 0 ) {
      this.x -= this.slideableWidth;
    } else if ( index >= this.cells.length ) {
      this.x += this.slideableWidth;
    }
  }

  if ( this.options.wrapAround || isWrap ) {
    index = U.modulo( index, this.cells.length );
  }

  if ( this.cells[ index ] ) {
    this.selectedIndex = index;
    this.setSelectedCell();
    this.startAnimation();
    this.dispatchEvent('select');
  }
};

Flickity.prototype.previous = function( isWrap ) {
  this.select( this.selectedIndex - 1, isWrap );
};

Flickity.prototype.next = function( isWrap ) {
  this.select( this.selectedIndex + 1, isWrap );
};

Flickity.prototype.updatePrevNextButtons = function() {
  if ( this.prevButton ) {
    this.prevButton.update();
  }
  if ( this.nextButton ) {
    this.nextButton.update();
  }
};

Flickity.prototype.setSelectedCell = function() {
  if ( this.selectedCell ) {
    classie.remove( this.selectedCell.element, 'is-selected' );
  }
  this.selectedCell = this.cells[ this.selectedIndex ];
  classie.add( this.selectedCell.element, 'is-selected' );
};

// on button clicks and ui changes
// stop player and stop free scrolling
Flickity.prototype.uiChange = function() {
  this.player.stop();
  delete this.isFreeScrolling;
};

// -------------------------- add/remove -------------------------- //

/**
 * get Flickity.Cell, given an Element
 * @param {Element} elem
 * @returns {Flickity.Cell} item
 */
Flickity.prototype.getCell = function( elem ) {
  // loop through cells to get the one that matches
  for ( var i=0, len = this.cells.length; i < len; i++ ) {
    var cell = this.cells[i];
    if ( cell.element === elem ) {
      return cell;
    }
  }
};

/**
 * get collection of Flickity.Cells, given Elements
 * @param {Element, Array, NodeList} elems
 * @returns {Array} cells - Flickity.Cells
 */
Flickity.prototype.getCells = function( elems ) {
  elems = U.makeArray( elems );
  var cells = [];
  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    var cell = this.getCell( elem );
    if ( cell ) {
      cells.push( cell );
    }
  }
  return cells;
};

// append cells to a document fragment
function getCellsFragment( cells ) {
  var fragment = document.createDocumentFragment();
  for ( var i=0, len = cells.length; i < len; i++ ) {
    var cell = cells[i];
    fragment.appendChild( cell.element );
  }
  return fragment;
}

// append
Flickity.prototype.append = function( elems ) {
  var cells = this._makeCells( elems );
  if ( !cells || !cells.length ) {
    return;
  }
  // append to slider
  var fragment = getCellsFragment( cells );
  this.slider.appendChild( fragment );
  // index of newly appened cells
  var index = this.cells.length;
  // add to end of this.cells
  this.cells = this.cells.concat( cells );
  this._sizeCells( cells );
  this.cellChange( index, true );
};


/**
 * Insert cells
 * @param {Element, Array, NodeList} elems
 * @param {Integer} index
 */
Flickity.prototype.insert = function( elems, index ) {
  var cells = this._makeCells( elems );
  if ( !cells || !cells.length ) {
    return;
  }
  // append to slider
  var fragment = getCellsFragment( cells );
  var insertCellElement = this.cells[ index ].element;
  this.slider.insertBefore( fragment, insertCellElement );
  // add to this.cells
  if ( index === 0 ) {
    // prepend, add to start
    this.cells = cells.concat( this.cells );
  } else {
    // insert in this.cells
    var endCells = this.cells.splice( index, this.cells.length - index );
    this.cells = this.cells.concat( cells ).concat( endCells );
  }

  this._sizeCells( cells );
  this.cellChange( index, true );
};

// prepend
Flickity.prototype.prepend = function( elems ) {
  this.insert( elems, 0 );
};



/**
 * Remove cells
 * @param {Element, Array, NodeList} elems
 */
Flickity.prototype.remove = function( elems ) {
  var cells = this.getCells( elems );
  for ( var i=0, len = cells.length; i < len; i++ ) {
    var cell = cells[i];
    cell.remove();
    // remove item from collection
    U.removeFrom( cell, this.cells );
  }

  if ( cells.length ) {
    // update stuff
    this.cellChange( 0, true );
  }
};

// updates when cells are added or removed
Flickity.prototype.cellChange = function( index, isSkippingSizing ) {
  index = index || 0;
  // size all cells if necessary
  if ( !isSkippingSizing ) {
    this._sizeCells( this.cells );
  }
  this._positionCells( index );
  this._getWrapShiftCells();
  // update page dots
  if ( this.pageDots ) {
    this.pageDots.setDots();
  }
  // TODO cell is removed before the selected cell, adjust selectedIndex by -1
  this.selectedIndex = Math.max( 0, Math.min( this.cells.length - 1, this.selectedIndex ) );

  if ( this.options.freeScroll ) {
    this.positionSlider();
  } else {
    this.select( this.selectedIndex );
  }
};

// -------------------------- events -------------------------- //

// ----- resize ----- //

Flickity.prototype.resize = function() {
  this.getSize();
  // wrap values
  if ( this.options.wrapAround ) {
    this.x = U.modulo( this.x, this.slideableWidth );
  }
  this.positionCells();
  this._getWrapShiftCells();
  this.positionSliderAtSelected();
};

Flickity.prototype.onresize = function() {
  this.resize();
};

U.debounceMethod( Flickity, 'onresize', 150 );

// ----- keydown ----- //

// go previous/next if left/right keys pressed
Flickity.prototype.onkeydown = function( event ) {
  // only work if element is in focus
  if ( !this.options.accessibility ||
    ( document.activeElement && document.activeElement !== this.element ) ) {
    return;
  }

  if ( event.keyCode === 37 ) {
    // go left
    var leftMethod = this.options.rightToLeft ? 'next' : 'previous';
    this.uiChange();
    this[ leftMethod ]();
  } else if ( event.keyCode === 39 ) {
    // go right
    var rightMethod = this.options.rightToLeft ? 'previous' : 'next';
    this.uiChange();
    this[ rightMethod ]();
  }
};

// ----- mouseenter/leave ----- //

// pause auto-play on hover
Flickity.prototype.onmouseenter = function() {
  this.player.pause();
  eventie.bind( this.element, 'mouseleave', this );
};

// resume auto-play on hover off
Flickity.prototype.onmouseleave = function() {
  this.player.unpause();
  eventie.unbind( this.element, 'mouseleave', this );
};

// -------------------------- prototype -------------------------- //

U.extend( Flickity.prototype, dragPrototype );
U.extend( Flickity.prototype, animatePrototype );

// --------------------------  -------------------------- //

/**
 * get Outlayer instance from element
 * @param {Element} elem
 * @returns {Outlayer}
 */
Flickity.data = function( elem ) {
  var id = elem && elem.flickityGUID;
  return id && instances[ id ];
};

U.htmlInit( Flickity, 'flickity' );

if ( jQuery && jQuery.bridget ) {
  jQuery.bridget( 'flickity', Flickity );
}

window.Flickity = Flickity;

})( window );
