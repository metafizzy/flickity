// Flickity main
/* eslint-disable max-params */
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        window,
        require('ev-emitter'),
        require('get-size'),
        require('fizzy-ui-utils'),
        require('./cell'),
        require('./slide'),
        require('./animate'),
    );
  } else {
    // browser global
    let _Flickity = window.Flickity;

    window.Flickity = factory(
        window,
        window.EvEmitter,
        window.getSize,
        window.fizzyUIUtils,
        _Flickity.Cell,
        _Flickity.Slide,
        _Flickity.animatePrototype,
    );
  }

}( typeof window != 'undefined' ? window : this,
    function factory( window, EvEmitter, getSize, utils, Cell, Slide, animatePrototype ) {
/* eslint-enable max-params */

// vars
const { getComputedStyle, console } = window;
let { jQuery } = window;

// -------------------------- Flickity -------------------------- //

// globally unique identifiers
let GUID = 0;
// internal store of all Flickity intances
let instances = {};

function Flickity( element, options ) {
  let queryElement = utils.getQueryElement( element );
  if ( !queryElement ) {
    if ( console ) console.error(`Bad element for Flickity: ${queryElement || element}`);
    return;
  }
  this.element = queryElement;
  // do not initialize twice on same element
  if ( this.element.flickityGUID ) {
    let instance = instances[ this.element.flickityGUID ];
    if ( instance ) instance.option( options );
    return instance;
  }

  // add jQuery
  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }
  // options
  this.options = { ...this.constructor.defaults };
  this.option( options );

  // kick things off
  this._create();
}

Flickity.defaults = {
  accessibility: true,
  // adaptiveHeight: false,
  cellAlign: 'center',
  // cellSelector: undefined,
  // contain: false,
  freeScrollFriction: 0.075, // friction when free-scrolling
  friction: 0.28, // friction when selecting
  namespaceJQueryEvents: true,
  // initialIndex: 0,
  percentPosition: true,
  resize: true,
  selectedAttraction: 0.025,
  setGallerySize: true,
  // watchCSS: false,
  // wrapAround: false
};

// hash of methods triggered on _create()
Flickity.create = {};

let proto = Flickity.prototype;
// inherit EventEmitter
Object.assign( proto, EvEmitter.prototype );

proto._create = function() {
  let { resize, watchCSS, rightToLeft } = this.options;
  // add id for Flickity.data
  let id = this.guid = ++GUID;
  this.element.flickityGUID = id; // expando
  instances[ id ] = this; // associate via id
  // initial properties
  this.selectedIndex = 0;
  // how many frames slider has been in same position
  this.restingFrames = 0;
  // initial physics properties
  this.x = 0;
  this.velocity = 0;
  this.beginMargin = rightToLeft ? 'marginRight' : 'marginLeft';
  this.endMargin = rightToLeft ? 'marginLeft' : 'marginRight';
  // create viewport & slider
  this.viewport = document.createElement('div');
  this.viewport.className = 'flickity-viewport';
  this._createSlider();
  // used for keyboard navigation
  this.focusableElems = [ this.element ];

  if ( resize || watchCSS ) {
    window.addEventListener( 'resize', this );
  }

  // add listeners from on option
  for ( let eventName in this.options.on ) {
    let listener = this.options.on[ eventName ];
    this.on( eventName, listener );
  }

  for ( let method in Flickity.create ) {
    Flickity.create[ method ].call( this );
  }

  if ( watchCSS ) {
    this.watchCSS();
  } else {
    this.activate();
  }
};

/**
 * set options
 * @param {Object} opts - options to extend
 */
proto.option = function( opts ) {
  Object.assign( this.options, opts );
};

proto.activate = function() {
  if ( this.isActive ) return;

  this.isActive = true;
  this.element.classList.add('flickity-enabled');
  if ( this.options.rightToLeft ) {
    this.element.classList.add('flickity-rtl');
  }

  this.getSize();
  // move initial cell elements so they can be loaded as cells
  let cellElems = this._filterFindCellElements( this.element.children );
  this.slider.append( ...cellElems );
  this.viewport.append( this.slider );
  this.element.append( this.viewport );
  // get cells from children
  this.reloadCells();

  if ( this.options.accessibility ) {
    // allow element to focusable
    this.element.tabIndex = 0;
    // listen for key presses
    this.element.addEventListener( 'keydown', this );
  }

  this.emitEvent('activate');
  this.selectInitialIndex();
  // flag for initial activation, for using initialIndex
  this.isInitActivated = true;
  // ready event. #493
  this.dispatchEvent('ready');
};

// slider positions the cells
proto._createSlider = function() {
  // slider element does all the positioning
  let slider = document.createElement('div');
  slider.className = 'flickity-slider';
  this.slider = slider;
};

proto._filterFindCellElements = function( elems ) {
  return utils.filterFindElements( elems, this.options.cellSelector );
};

// goes through all children
proto.reloadCells = function() {
  // collection of item elements
  this.cells = this._makeCells( this.slider.children );
  this.positionCells();
  this._updateWrapShiftCells();
  this.setGallerySize();
};

/**
 * turn elements into Flickity.Cells
 * @param {[Array, NodeList, HTMLElement]} elems - elements to make into cells
 * @returns {Array} items - collection of new Flickity Cells
 */
proto._makeCells = function( elems ) {
  let cellElems = this._filterFindCellElements( elems );

  // create new Cells for collection
  return cellElems.map( ( cellElem ) => new Cell( cellElem ) );
};

proto.getLastCell = function() {
  return this.cells[ this.cells.length - 1 ];
};

proto.getLastSlide = function() {
  return this.slides[ this.slides.length - 1 ];
};

// positions all cells
proto.positionCells = function() {
  // size all cells
  this._sizeCells( this.cells );
  // position all cells
  this._positionCells( 0 );
};

/**
 * position certain cells
 * @param {Integer} index - which cell to start with
 */
proto._positionCells = function( index ) {
  index = index || 0;
  // also measure maxCellHeight
  // start 0 if positioning all cells
  this.maxCellHeight = index ? this.maxCellHeight || 0 : 0;
  let cellX = 0;
  // get cellX
  if ( index > 0 ) {
    let startCell = this.cells[ index - 1 ];
    cellX = startCell.x + startCell.size.outerWidth;
  }

  this.cells.slice( index ).forEach( ( cell ) => {
    cell.x = cellX;
    this._renderCellPosition( cell, cellX );
    cellX += cell.size.outerWidth;
    this.maxCellHeight = Math.max( cell.size.outerHeight, this.maxCellHeight );
  } );
  // keep track of cellX for wrap-around
  this.slideableWidth = cellX;
  // slides
  this.updateSlides();
  // contain slides target
  this._containSlides();
  // update slidesWidth
  this.slidesWidth = this.cells.length ?
    this.getLastSlide().target - this.slides[0].target : 0;
};

proto._renderCellPosition = function( cell, x ) {
  // render position of cell with in slider
  let sideOffset = this.options.rightToLeft ? -1 : 1;
  let renderX = x * sideOffset;
  if ( this.options.percentPosition ) renderX *= this.size.innerWidth / cell.size.width;
  let positionValue = this.getPositionValue( renderX );
  cell.element.style.transform = `translateX( ${positionValue} )`;
};

/**
 * cell.getSize() on multiple cells
 * @param {Array} cells - cells to size
 */
proto._sizeCells = function( cells ) {
  cells.forEach( ( cell ) => cell.getSize() );
};

// --------------------------  -------------------------- //

proto.updateSlides = function() {
  this.slides = [];
  if ( !this.cells.length ) return;

  let { beginMargin, endMargin } = this;
  let slide = new Slide( beginMargin, endMargin, this.cellAlign );
  this.slides.push( slide );

  let canCellFit = this._getCanCellFit();

  this.cells.forEach( ( cell, i ) => {
    // just add cell if first cell in slide
    if ( !slide.cells.length ) {
      slide.addCell( cell );
      return;
    }

    let slideWidth = ( slide.outerWidth - slide.firstMargin ) +
      ( cell.size.outerWidth - cell.size[ endMargin ] );

    if ( canCellFit( i, slideWidth ) ) {
      slide.addCell( cell );
    } else {
      // doesn't fit, new slide
      slide.updateTarget();

      slide = new Slide( beginMargin, endMargin, this.cellAlign );
      this.slides.push( slide );
      slide.addCell( cell );
    }
  } );
  // last slide
  slide.updateTarget();
  // update .selectedSlide
  this.updateSelectedSlide();
};

proto._getCanCellFit = function() {
  let { groupCells } = this.options;
  if ( !groupCells ) return () => false;

  if ( typeof groupCells == 'number' ) {
    // group by number. 3 -> [0,1,2], [3,4,5], ...
    let number = parseInt( groupCells, 10 );
    return ( i ) => ( i % number ) !== 0;
  }
  // default, group by width of slide
  let percent = 1;
  // parse '75%
  let percentMatch = typeof groupCells == 'string' && groupCells.match( /^(\d+)%$/ );
  if ( percentMatch ) percent = parseInt( percentMatch[1], 10 ) / 100;
  let groupWidth = ( this.size.innerWidth + 1 ) * percent;
  return ( i, slideWidth ) => slideWidth <= groupWidth;
};

// alias _init for jQuery plugin .flickity()
proto._init =
proto.reposition = function() {
  this.positionCells();
  this.positionSliderAtSelected();
};

proto.getSize = function() {
  this.size = getSize( this.element );
  this.setCellAlign();
  this.cursorPosition = this.size.innerWidth * this.cellAlign;
};

let cellAlignShorthands = {
  left: 0,
  center: 0.5,
  right: 1,
};

proto.setCellAlign = function() {
  let { cellAlign, rightToLeft } = this.options;
  let shorthand = cellAlignShorthands[ cellAlign ];
  this.cellAlign = shorthand !== undefined ? shorthand : cellAlign;
  if ( rightToLeft ) this.cellAlign = 1 - this.cellAlign;
};

proto.setGallerySize = function() {
  if ( !this.options.setGallerySize ) return;

  let height = this.options.adaptiveHeight && this.selectedSlide ?
    this.selectedSlide.height : this.maxCellHeight;
  this.viewport.style.height = `${height}px`;
};

proto._updateWrapShiftCells = function() {
  // update isWrapping
  this.isWrapping = this.getIsWrapping();
  // only for wrap-around
  if ( !this.isWrapping ) return;

  // unshift previous cells
  this._unshiftCells( this.beforeShiftCells );
  this._unshiftCells( this.afterShiftCells );
  // get before cells
  // initial gap
  let beforeGapX = this.cursorPosition;
  let lastIndex = this.cells.length - 1;
  this.beforeShiftCells = this._getGapCells( beforeGapX, lastIndex, -1 );
  // get after cells
  // ending gap between last cell and end of gallery viewport
  let afterGapX = this.size.innerWidth - this.cursorPosition;
  // start cloning at first cell, working forwards
  this.afterShiftCells = this._getGapCells( afterGapX, 0, 1 );
};

proto.getIsWrapping = function() {
  let { wrapAround } = this.options;
  if ( !wrapAround || this.slides.length < 2 ) return false;

  if ( wrapAround !== 'fill' ) return true;
  // check that slides can fit

  let gapWidth = this.slideableWidth - this.size.innerWidth;
  if ( gapWidth > this.size.innerWidth ) return true; // gap * 2x big, all good
  // check that content width - shifting cell is bigger than viewport width
  for ( let cell of this.cells ) {
    if ( cell.size.outerWidth > gapWidth ) return false;
  }
  return true;
};

proto._getGapCells = function( gapX, cellIndex, increment ) {
  // keep adding cells until the cover the initial gap
  let cells = [];
  while ( gapX > 0 ) {
    let cell = this.cells[ cellIndex ];
    if ( !cell ) break;

    cells.push( cell );
    cellIndex += increment;
    gapX -= cell.size.outerWidth;
  }
  return cells;
};

// ----- contain & wrap ----- //

// contain cell targets so no excess sliding
proto._containSlides = function() {
  let isContaining = this.options.contain && !this.isWrapping &&
      this.cells.length;
  if ( !isContaining ) return;

  let contentWidth = this.slideableWidth - this.getLastCell().size[ this.endMargin ];
  // content is less than gallery size
  let isContentSmaller = contentWidth < this.size.innerWidth;
  if ( isContentSmaller ) {
    // all cells fit inside gallery
    this.slides.forEach( ( slide ) => {
      slide.target = contentWidth * this.cellAlign;
    } );
  } else {
    // contain to bounds
    let beginBound = this.cursorPosition + this.cells[0].size[ this.beginMargin ];
    let endBound = contentWidth - this.size.innerWidth * ( 1 - this.cellAlign );
    this.slides.forEach( ( slide ) => {
      slide.target = Math.max( slide.target, beginBound );
      slide.target = Math.min( slide.target, endBound );
    } );
  }
};

// ----- events ----- //

/**
 * emits events via eventEmitter and jQuery events
 * @param {String} type - name of event
 * @param {Event} event - original event
 * @param {Array} args - extra arguments
 */
proto.dispatchEvent = function( type, event, args ) {
  let emitArgs = event ? [ event ].concat( args ) : args;
  this.emitEvent( type, emitArgs );

  if ( jQuery && this.$element ) {
    // default trigger with type if no event
    type += this.options.namespaceJQueryEvents ? '.flickity' : '';
    let $event = type;
    if ( event ) {
      // create jQuery event
      let jQEvent = new jQuery.Event( event );
      jQEvent.type = type;
      $event = jQEvent;
    }
    this.$element.trigger( $event, args );
  }
};

const unidraggerEvents = [
  'dragStart',
  'dragMove',
  'dragEnd',
  'pointerDown',
  'pointerMove',
  'pointerEnd',
  'staticClick',
];

let _emitEvent = proto.emitEvent;
proto.emitEvent = function( eventName, args ) {
  if ( eventName === 'staticClick' ) {
    // add cellElem and cellIndex args to staticClick
    let clickedCell = this.getParentCell( args[0].target );
    let cellElem = clickedCell && clickedCell.element;
    let cellIndex = clickedCell && this.cells.indexOf( clickedCell );
    args = args.concat( cellElem, cellIndex );
  }
  // do regular thing
  _emitEvent.call( this, eventName, args );
  // duck-punch in jQuery events for Unidragger events
  let isUnidraggerEvent = unidraggerEvents.includes( eventName );
  if ( !isUnidraggerEvent || !jQuery || !this.$element ) return;

  eventName += this.options.namespaceJQueryEvents ? '.flickity' : '';
  let event = args.shift( 0 );
  let jQEvent = new jQuery.Event( event );
  jQEvent.type = eventName;
  this.$element.trigger( jQEvent, args );
};

// -------------------------- select -------------------------- //

/**
 * @param {Integer} index - index of the slide
 * @param {Boolean} isWrap - will wrap-around to last/first if at the end
 * @param {Boolean} isInstant - will immediately set position at selected cell
 */
proto.select = function( index, isWrap, isInstant ) {
  if ( !this.isActive ) return;

  index = parseInt( index, 10 );
  this._wrapSelect( index );

  if ( this.isWrapping || isWrap ) {
    index = utils.modulo( index, this.slides.length );
  }
  // bail if invalid index
  if ( !this.slides[ index ] ) return;

  let prevIndex = this.selectedIndex;
  this.selectedIndex = index;
  this.updateSelectedSlide();
  if ( isInstant ) {
    this.positionSliderAtSelected();
  } else {
    this.startAnimation();
  }
  if ( this.options.adaptiveHeight ) {
    this.setGallerySize();
  }
  // events
  this.dispatchEvent( 'select', null, [ index ] );
  // change event if new index
  if ( index !== prevIndex ) {
    this.dispatchEvent( 'change', null, [ index ] );
  }
};

// wraps position for wrapAround, to move to closest slide. #113
proto._wrapSelect = function( index ) {
  if ( !this.isWrapping ) return;

  const { selectedIndex, slideableWidth, slides: { length } } = this;
  // shift index for wrap, do not wrap dragSelect
  if ( !this.isDragSelect ) {
    let wrapIndex = utils.modulo( index, length );
    // go to shortest
    let delta = Math.abs( wrapIndex - selectedIndex );
    let backWrapDelta = Math.abs( ( wrapIndex + length ) - selectedIndex );
    let forewardWrapDelta = Math.abs( ( wrapIndex - length ) - selectedIndex );
    if ( backWrapDelta < delta ) {
      index += length;
    } else if ( forewardWrapDelta < delta ) {
      index -= length;
    }
  }

  // wrap position so slider is within normal area
  if ( index < 0 ) {
    this.x -= slideableWidth;
  } else if ( index >= length ) {
    this.x += slideableWidth;
  }
};

proto.previous = function( isWrap, isInstant ) {
  this.select( this.selectedIndex - 1, isWrap, isInstant );
};

proto.next = function( isWrap, isInstant ) {
  this.select( this.selectedIndex + 1, isWrap, isInstant );
};

proto.updateSelectedSlide = function() {
  let slide = this.slides[ this.selectedIndex ];
  // selectedIndex could be outside of slides, if triggered before resize()
  if ( !slide ) return;

  // unselect previous selected slide
  this.unselectSelectedSlide();
  // update new selected slide
  this.selectedSlide = slide;
  slide.select();
  this.selectedCells = slide.cells;
  this.selectedElements = slide.getCellElements();
  // HACK: selectedCell & selectedElement is first cell in slide, backwards compatibility
  this.selectedCell = slide.cells[0];
  this.selectedElement = this.selectedElements[0];
};

proto.unselectSelectedSlide = function() {
  if ( this.selectedSlide ) this.selectedSlide.unselect();
};

proto.selectInitialIndex = function() {
  let initialIndex = this.options.initialIndex;
  // already activated, select previous selectedIndex
  if ( this.isInitActivated ) {
    this.select( this.selectedIndex, false, true );
    return;
  }
  // select with selector string
  if ( initialIndex && typeof initialIndex == 'string' ) {
    let cell = this.queryCell( initialIndex );
    if ( cell ) {
      this.selectCell( initialIndex, false, true );
      return;
    }
  }

  let index = 0;
  // select with number
  if ( initialIndex && this.slides[ initialIndex ] ) {
    index = initialIndex;
  }
  // select instantly
  this.select( index, false, true );
};

/**
 * select slide from number or cell element
 * @param {[Element, Number]} value - zero-based index or element to select
 * @param {Boolean} isWrap - enables wrapping around for extra index
 * @param {Boolean} isInstant - disables slide animation
 */
proto.selectCell = function( value, isWrap, isInstant ) {
  // get cell
  let cell = this.queryCell( value );
  if ( !cell ) return;

  let index = this.getCellSlideIndex( cell );
  this.select( index, isWrap, isInstant );
};

proto.getCellSlideIndex = function( cell ) {
  // get index of slide that has cell
  let cellSlide = this.slides.find( ( slide ) => slide.cells.includes( cell ) );
  return this.slides.indexOf( cellSlide );
};

// -------------------------- get cells -------------------------- //

/**
 * get Flickity.Cell, given an Element
 * @param {Element} elem - matching cell element
 * @returns {Flickity.Cell} cell - matching cell
 */
proto.getCell = function( elem ) {
  // loop through cells to get the one that matches
  for ( let cell of this.cells ) {
    if ( cell.element === elem ) return cell;
  }
};

/**
 * get collection of Flickity.Cells, given Elements
 * @param {[Element, Array, NodeList]} elems - multiple elements
 * @returns {Array} cells - Flickity.Cells
 */
proto.getCells = function( elems ) {
  elems = utils.makeArray( elems );
  return elems.map( ( elem ) => this.getCell( elem ) ).filter( Boolean );
};

/**
 * get cell elements
 * @returns {Array} cellElems
 */
proto.getCellElements = function() {
  return this.cells.map( ( cell ) => cell.element );
};

/**
 * get parent cell from an element
 * @param {Element} elem - child element
 * @returns {Flickit.Cell} cell - parent cell
 */
proto.getParentCell = function( elem ) {
  // first check if elem is cell
  let cell = this.getCell( elem );
  if ( cell ) return cell;

  // try to get parent cell elem
  let closest = elem.closest('.flickity-slider > *');
  return this.getCell( closest );
};

/**
 * get cells adjacent to a slide
 * @param {Integer} adjCount - number of adjacent slides
 * @param {Integer} index - index of slide to start
 * @returns {Array} cells - array of Flickity.Cells
 */
proto.getAdjacentCellElements = function( adjCount, index ) {
  if ( !adjCount ) return this.selectedSlide.getCellElements();

  index = index === undefined ? this.selectedIndex : index;

  let len = this.slides.length;
  if ( 1 + ( adjCount * 2 ) >= len ) {
    return this.getCellElements(); // get all
  }

  let cellElems = [];
  for ( let i = index - adjCount; i <= index + adjCount; i++ ) {
    let slideIndex = this.isWrapping ? utils.modulo( i, len ) : i;
    let slide = this.slides[ slideIndex ];
    if ( slide ) {
      cellElems = cellElems.concat( slide.getCellElements() );
    }
  }
  return cellElems;
};

/**
 * select slide from number or cell element
 * @param {[Element, String, Number]} selector - element, selector string, or index
 * @returns {Flickity.Cell} - matching cell
 */
proto.queryCell = function( selector ) {
  if ( typeof selector == 'number' ) {
    // use number as index
    return this.cells[ selector ];
  }
  // do not select invalid selectors from hash: #123, #/. #791
  let isSelectorString = typeof selector == 'string' && !selector.match( /^[#.]?[\d/]/ );
  if ( isSelectorString ) {
    // use string as selector, get element
    selector = this.element.querySelector( selector );
  }
  // get cell from element
  return this.getCell( selector );
};

// -------------------------- events -------------------------- //

proto.uiChange = function() {
  this.emitEvent('uiChange');
};

// ----- resize ----- //

proto.onresize = function() {
  this.watchCSS();
  this.resize();
};

utils.debounceMethod( Flickity, 'onresize', 150 );

proto.resize = function() {
  // #1177 disable resize behavior when animating or dragging for iOS 15
  if ( !this.isActive || this.isAnimating || this.isDragging ) return;
  this.getSize();
  // wrap values
  if ( this.isWrapping ) {
    this.x = utils.modulo( this.x, this.slideableWidth );
  }
  this.positionCells();
  this._updateWrapShiftCells();
  this.setGallerySize();
  this.emitEvent('resize');
  // update selected index for group slides, instant
  // TODO: position can be lost between groups of various numbers
  let selectedElement = this.selectedElements && this.selectedElements[0];
  this.selectCell( selectedElement, false, true );
};

// watches the :after property, activates/deactivates
proto.watchCSS = function() {
  if ( !this.options.watchCSS ) return;

  let afterContent = getComputedStyle( this.element, ':after' ).content;
  // activate if :after { content: 'flickity' }
  if ( afterContent.includes('flickity') ) {
    this.activate();
  } else {
    this.deactivate();
  }
};

// ----- keydown ----- //

// go previous/next if left/right keys pressed
proto.onkeydown = function( event ) {
  let { activeElement } = document;
  let handler = Flickity.keyboardHandlers[ event.key ];
  // only work if element is in focus
  if ( !this.options.accessibility || !activeElement || !handler ) return;

  let isFocused = this.focusableElems.some( ( elem ) => activeElement === elem );
  if ( isFocused ) handler.call( this );
};

Flickity.keyboardHandlers = {
  ArrowLeft: function() {
    this.uiChange();
    let leftMethod = this.options.rightToLeft ? 'next' : 'previous';
    this[ leftMethod ]();
  },
  ArrowRight: function() {
    this.uiChange();
    let rightMethod = this.options.rightToLeft ? 'previous' : 'next';
    this[ rightMethod ]();
  },
};

// ----- focus ----- //

proto.focus = function() {
  this.element.focus({ preventScroll: true });
};

// -------------------------- destroy -------------------------- //

// deactivate all Flickity functionality, but keep stuff available
proto.deactivate = function() {
  if ( !this.isActive ) return;

  this.element.classList.remove('flickity-enabled');
  this.element.classList.remove('flickity-rtl');
  this.unselectSelectedSlide();
  // destroy cells
  this.cells.forEach( ( cell ) => cell.destroy() );
  this.viewport.remove();
  // move child elements back into element
  this.element.append( ...this.slider.children );
  if ( this.options.accessibility ) {
    this.element.removeAttribute('tabIndex');
    this.element.removeEventListener( 'keydown', this );
  }
  // set flags
  this.isActive = false;
  this.emitEvent('deactivate');
};

proto.destroy = function() {
  this.deactivate();
  window.removeEventListener( 'resize', this );
  this.allOff();
  this.emitEvent('destroy');
  if ( jQuery && this.$element ) {
    jQuery.removeData( this.element, 'flickity' );
  }
  delete this.element.flickityGUID;
  delete instances[ this.guid ];
};

// -------------------------- prototype -------------------------- //

Object.assign( proto, animatePrototype );

// -------------------------- extras -------------------------- //

/**
 * get Flickity instance from element
 * @param {[Element, String]} elem - element or selector string
 * @returns {Flickity} - Flickity instance
 */
Flickity.data = function( elem ) {
  elem = utils.getQueryElement( elem );
  if ( elem ) return instances[ elem.flickityGUID ];
};

utils.htmlInit( Flickity, 'flickity' );

let { jQueryBridget } = window;
if ( jQuery && jQueryBridget ) {
  jQueryBridget( 'flickity', Flickity, jQuery );
}

// set internal jQuery, for Webpack + jQuery v3, #478
Flickity.setJQuery = function( jq ) {
  jQuery = jq;
};

Flickity.Cell = Cell;
Flickity.Slide = Slide;

return Flickity;

} ) );
