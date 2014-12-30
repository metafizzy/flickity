/*!
 * Flickity
 * Touch responsive gallery
 */

/*global EventEmitter: false, Cell: false, getSize: false, eventie: false, PrevNextButton: false, PageDots: false, Player: false */

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

  // style element
  this.element.style.position = 'relative';
  this.element.style.overflow = 'hidden';

  this._createSlider();

  this.getSize();

  // get cells from children
  this.reloadCells();
  // set height
  var firstCell = this.cells[0];
  this.element.style.height = firstCell.size.outerHeight +
    this.size.borderTopWidth + this.size.borderBottomWidth + 'px';

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

  this.updatePrevNextButtons();
  this.positionSliderAtSelected();

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
  this.element.appendChild( slider );
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

/**
 * @param {Array} cells - Array of Cells
 */
Flickity.prototype.positionCells = function() {
  var cellX = 0;
  for ( var i=0, len = this.cells.length; i < len; i++ ) {
    var cell = this.cells[i];
    cell.getSize();
    cell.setPosition( cellX );
    cellX += cell.size.outerWidth;
  }
  // keep track of cellX for wrap-around
  this.slideableWidth = cellX;
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
  // before cells
  // initial gap
  var gapX = this.cursorPosition - this.cells[0].target;
  var cellIndex = this.cells.length - 1;
  this.beforeShiftCells = this._getGapCells( gapX, cellIndex, -1 );
  // after cells
  // ending gap between last cell and end of gallery viewport
  gapX = ( this.size.innerWidth - this.cursorPosition ) -
    this.getLastCell().size.width * ( 1 - this.options.targetPosition );
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

// on button clicks and ui changes
// stop player and stop free scrolling
Flickity.prototype.uiChange = function() {
  this.player.stop();
  delete this.isFreeScrolling;
};

// -------------------------- events -------------------------- //

// ----- resize ----- //

Flickity.prototype.onresize = function() {
  this.getSize();
  // wrap values
  if ( this.options.wrapAround ) {
    this.x = U.modulo( this.x, this.slideableWidth );
  }
  this.positionCells();
  this.positionSliderAtSelected();
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
