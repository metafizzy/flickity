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
var getComputedStyle = window.getComputedStyle;
var imagesLoaded = window.imagesLoaded;
var dragPrototype = window.Flickity.dragPrototype;
var animatePrototype = window.Flickity.animatePrototype;
var cellChangePrototype = window.Flickity.cellChangePrototype;

function moveChildren( fromElem, toElem ) {
  while ( fromElem.children.length ) {
    toElem.appendChild( fromElem.children[0] );
  }
}

// -------------------------- Flickity -------------------------- //

// globally unique identifiers
var GUID = 0;
// internal store of all Flickity intances
var instances = {};

function Flickity( element, options ) {
  this.element = U.getQueryElement( element );
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
  cellAlign: 'center',
  draggable: true,
  pageDots: true,
  prevNextButtons: true,
  resizeBound: true,
  selectedAttraction: 0.025,
  leftArrowText: '←', // text for prev/next button when no SVG support
  rightArrowText: '→'
};

// inherit EventEmitter
U.extend( Flickity.prototype, EventEmitter.prototype );

Flickity.prototype._create = function() {
  // add id for Flickity.data
  var id = this.guid = ++GUID;
  this.element.flickityGUID = id; // expando
  instances[ id ] = this; // associate via id
  // initial properties
  this.selectedIndex = 0;
  // how many frames slider has been in same position
  this.restingFrames = 0;
  // initial physics properties
  this.x = 0;
  this.velocity = 0;
  this.accel = 0;
  this.originSide = this.options.rightToLeft ? 'right' : 'left';
  // create viewport & slider
  this.viewport = document.createElement('div');
  this.viewport.className = 'flickity-viewport';
  this._createSlider();
  // create prev/next buttons, page dots, and player
  if ( this.options.prevNextButtons ) {
    this.prevButton = new PrevNextButton( -1, this );
    this.nextButton = new PrevNextButton( 1, this );
  }
  if ( this.options.pageDots ) {
    this.pageDots = new PageDots( this );
  }
  this.player = new Player( this );

  if ( this.options.resizeBound || this.options.watch ) {
    eventie.bind( window, 'resize', this );
  }

  if ( this.options.watch ) {
    this.watch();
  } else {
    this.activate();
  }
};

/**
 * set options
 * @param {Object} opts
 */
Flickity.prototype.option = function( opts ) {
  U.extend( this.options, opts );
};

Flickity.prototype.activate = function() {
  if ( this.isActive ) {
    return;
  }
  this.isActive = true;
  classie.add( this.element, 'flickity-enabled' );
  // move children to slider
  moveChildren( this.element, this.slider );
  this.viewport.appendChild( this.slider );
  this.element.appendChild( this.viewport );

  this.getSize();
  // get cells from children
  this.reloadCells();
  this.setContainerSize();
  // activate prev/next buttons, page dots
  if ( this.prevButton ) {
    this.prevButton.activate();
  }
  if ( this.nextButton ) {
    this.nextButton.activate();
  }
  if ( this.pageDots ) {
    this.pageDots.activate();
  }
  // player
  if ( this.options.autoPlay ) {
    this.player.play();
    // add hover listeners
    eventie.bind( this.element, 'mouseenter', this );
    // TODO add event for pointer enter
  }

  this.positionSliderAtSelected();
  this.select( this.selectedIndex );

  this.imagesLoaded();

  // events
  this.bindDrag();

  if ( this.options.accessibility ) {
    // allow element to focusable
    this.element.tabIndex = 0;
    // listen for key presses
    eventie.bind( this.element, 'keydown', this );
  }
};

// slider positions the cells
Flickity.prototype._createSlider = function() {
  // slider element does all the positioning
  var slider = document.createElement('div');
  slider.className = 'flickity-slider';
  slider.style[ this.originSide ] = 0;
  this.slider = slider;
};

// goes through all children
Flickity.prototype.reloadCells = function() {
  // collection of item elements
  this.cells = this._makeCells( this.slider.children );
  this.positionCells( this.cells );
  this._getWrapShiftCells();
  this.setContainerSize();
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
  // also measure maxCellHeight
  // start 0 if positioning all cells
  this.maxCellHeight = index ? this.maxCellHeight || 0 : 0;
  var cellX = 0;
  // get cellX
  if ( index > 0 ) {
    var startCell = this.cells[ index - 1 ];
    cellX = startCell.x + startCell.size.outerWidth;
  }
  for ( var len = this.cells.length; index < len; index++ ) {
    var cell = this.cells[ index ];
    cell.setPosition( cellX );
    cellX += cell.size.outerWidth;
    this.maxCellHeight = Math.max( cell.size.outerHeight, this.maxCellHeight );
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
  this.setCellAlign();
  this.cursorPosition = this.size.innerWidth * this.cellAlign;
};

var cellAlignShorthands = {
  // cell align, then based on origin side
  center: {
    left: 0.5,
    right: 0.5
  },
  left: {
    left: 0,
    right: 1
  },
  right: {
    right: 0,
    left: 1
  }
};

Flickity.prototype.setCellAlign = function() {
  var shorthand = cellAlignShorthands[ this.options.cellAlign ];
  this.cellAlign = shorthand ? shorthand[ this.originSide ] : this.options.cellAlign;
};

Flickity.prototype.setContainerSize = function() {
  this.viewport.style.height = this.maxCellHeight + 'px';
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
    if ( !cell ) {
      break;
    }
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
  if ( !this.isActive ) {
    return;
  }
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
  this._removeSelectedCellClass();
  this.selectedCell = this.cells[ this.selectedIndex ];
  classie.add( this.selectedCell.element, 'is-selected' );
};

Flickity.prototype._removeSelectedCellClass = function() {
  if ( this.selectedCell ) {
    classie.remove( this.selectedCell.element, 'is-selected' );
  }
};

// on button clicks and ui changes
// stop player and stop free scrolling
Flickity.prototype.uiChange = function() {
  this.player.stop();
  delete this.isFreeScrolling;
};

// -------------------------- images -------------------------- //

// TODO move out this repo to avoid problems with imagesLoaded dependency
Flickity.prototype.imagesLoaded = function() {
  if ( !this.options.imagesLoaded || !imagesLoaded ) {
    return;
  }
  var _this = this;
  function onImagesLoadedProgress( instance, image ) {
    // check if image is a cell
    var cell = _this.getCell( image.img );
    // otherwise get its parents
    var cellElem = cell.element || U.getParent( image.img, '.flickity-slider > *' );
    _this.cellSizeChange( cellElem );
  }
  imagesLoaded( this.slider ).on( 'progress', onImagesLoadedProgress );
};

// -------------------------- get cells -------------------------- //

/**
 * get Flickity.Cell, given an Element
 * @param {Element} elem
 * @returns {Flickity.Cell} item
 */
Flickity.prototype.getCell = function( elem ) {
  // loop through cells to get the one that matches
  for ( var i=0, len = this.cells.length; i < len; i++ ) {
    var cell = this.cells[i];
    if ( cell.element == elem ) {
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

// -------------------------- events -------------------------- //

// ----- resize ----- //

Flickity.prototype.onresize = function() {
  this.watch();
  this.resize();
};

U.debounceMethod( Flickity, 'onresize', 150 );

Flickity.prototype.resize = function() {
  if ( !this.isActive ) {
    return;
  }
  this.getSize();
  // wrap values
  if ( this.options.wrapAround ) {
    this.x = U.modulo( this.x, this.slideableWidth );
  }
  this.positionCells();
  this._getWrapShiftCells();
  this.setContainerSize();
  this.positionSliderAtSelected();
};

var supportsConditionalCSS = ( function() {
  var supports;
  return function checkSupport() {
    if ( supports !== undefined ) {
      return supports;
    }
    if ( !getComputedStyle ) {
      supports = false;
      return;
    }
    // style body's ::after and check that
    var style = document.createElement('style');
    var cssText = document.createTextNode('body::after { content: "foo"; display: none; }');
    style.appendChild( cssText );
    document.head.appendChild( style );
    var afterContent = getComputedStyle( document.body, '::after' ).content;
    // check if able to get ::after content
    supports = afterContent.indexOf('foo') != -1;
    document.head.removeChild( style );
    return supports;
  };
})();

// watches the :after property, activates/deactivates
Flickity.prototype.watch = function() {
  var watchOption = this.options.watch;
  if ( !watchOption ) {
    return;
  }
  var supports = supportsConditionalCSS();
  if ( !supports ) {
    // activate if watch option is fallbackOn
    var method = watchOption == 'fallbackOn' ? 'activate' : 'deactivate';
    this[ method ]();
    return;
  }

  var afterContent = getComputedStyle( this.element, '::after' ).content;
  // activate if :after { content: 'flickity' }
  if ( afterContent.indexOf('flickity') != -1 ) {
    this.activate();
  } else {
    this.deactivate();
  }
};

// ----- keydown ----- //

// go previous/next if left/right keys pressed
Flickity.prototype.onkeydown = function( event ) {
  // only work if element is in focus
  if ( !this.options.accessibility ||
    ( document.activeElement && document.activeElement != this.element ) ) {
    return;
  }

  if ( event.keyCode == 37 ) {
    // go left
    var leftMethod = this.options.rightToLeft ? 'next' : 'previous';
    this.uiChange();
    this[ leftMethod ]();
  } else if ( event.keyCode == 39 ) {
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

// -------------------------- destroy -------------------------- //

// deactivate all Flickity functionality, but keep stuff available
Flickity.prototype.deactivate = function() {
  if ( !this.isActive ) {
    return;
  }
  classie.remove( this.element, 'flickity-enabled' );
  // destroy cells
  for ( var i=0, len = this.cells.length; i < len; i++ ) {
    var cell = this.cells[i];
    cell.destroy();
  }
  this._removeSelectedCellClass();
  this.element.removeChild( this.viewport );
  // move child elements back into element
  moveChildren( this.slider, this.element );
  // deactivate prev/next buttons, page dots; stop player
  if ( this.prevButton ) {
    this.prevButton.deactivate();
  }
  if ( this.nextButton ) {
    this.nextButton.deactivate();
  }
  if ( this.pageDots ) {
    this.pageDots.deactivate();
  }
  this.player.stop();
  // unbind events
  this.unbindDrag();
  if ( this.options.accessibility ) {
    this.element.removeAttribute('tabIndex');
    eventie.unbind( this.element, 'keydown', this );
  }
  // set flags
  this.isActive = false;
  this.isAnimating = false;
};

Flickity.prototype.destroy = function() {
  this.deactivate();
  if ( this.options.resizeBound || this.options.watch ) {
    eventie.unbind( window, 'resize', this );
  }
  delete instances[ this.guid ];
};

// -------------------------- prototype -------------------------- //

U.extend( Flickity.prototype, dragPrototype );
U.extend( Flickity.prototype, animatePrototype );
U.extend( Flickity.prototype, cellChangePrototype );

// -------------------------- extras -------------------------- //

/**
 * get Flickity instance from element
 * @param {Element} elem
 * @returns {Flickity}
 */
Flickity.data = function( elem ) {
  elem = U.getQueryElement( elem );
  var id = elem && elem.flickityGUID;
  return id && instances[ id ];
};

U.htmlInit( Flickity, 'flickity' );

if ( jQuery && jQuery.bridget ) {
  jQuery.bridget( 'flickity', Flickity );
}

window.Flickity = Flickity;

})( window );
