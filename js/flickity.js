/*!
 * Flickity
 * Touch responsive gallery
 */

/*global EventEmitter: false, Cell: false, getSize: false, getStyleProperty: false, eventie: false, PrevNextButton: false, PageDots: false */

( function( window ) {

'use strict';

// utils
var U = window.utils;
var Unipointer = window.Unipointer;

function modulo( num, div ) {
  return ( ( num % div ) + div ) % div;
}

// -------------------------- requestAnimationFrame -------------------------- //

// https://gist.github.com/1866474

var lastTime = 0;
var prefixes = 'webkit moz ms o'.split(' ');
// get unprefixed rAF and cAF, if present
var requestAnimationFrame = window.requestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame;
// loop through vendor prefixes and get prefixed rAF and cAF
var prefix;
for( var i = 0; i < prefixes.length; i++ ) {
  if ( requestAnimationFrame && cancelAnimationFrame ) {
    break;
  }
  prefix = prefixes[i];
  requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
  cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] ||
                            window[ prefix + 'CancelRequestAnimationFrame' ];
}

// fallback to setTimeout and clearTimeout if either request/cancel is not supported
if ( !requestAnimationFrame || !cancelAnimationFrame )  {
  requestAnimationFrame = function( callback ) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
    var id = window.setTimeout( function() {
      callback( currTime + timeToCall );
    }, timeToCall );
    lastTime = currTime + timeToCall;
    return id;
  };

  cancelAnimationFrame = function( id ) {
    window.clearTimeout( id );
  };
}

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
  friction: 0.25,
  cursorPosition: 0.5,
  draggable: true,
  pageDots: true,
  prevNextButtons: true,
  resizeBound: true,
  targetPosition: 0.5
};

// inherit EventEmitter
U.extend( Flickity.prototype, EventEmitter.prototype );
U.extend( Flickity.prototype, Unipointer.prototype );

Flickity.prototype._create = function() {
  // variables
  this.x = 0;
  this.velocity = 0;
  this.accel = 0;

  this.selectedIndex = 0;
  this.selectedWrapIndex = 0;
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
  var side = this.options.rightToLeft ? 'right' : 'left';
  slider.style[ side ] = 0;
  // wrap child elements in slider
  while ( this.element.children.length ) {
    slider.appendChild( this.element.children[0] );
  }
  this.element.appendChild( slider );
  this.slider = slider;
};


// goes through all children
Flickity.prototype.reloadCells = function() {
  // collection of item elements
  this.cells = this._makeCells( this.slider.children );
  this.positionCells( this.cells );
  // clone cells for wrap around
  this._cloneCells();
  this.positionClones();
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

Flickity.prototype._cloneCells = function() {
  // only for wrap-around
  if ( !this.options.wrapAround ) {
    return;
  }
  // before cells
  // initial gap
  var gapX = this.cursorPosition - this.cells[0].target;
  var cellIndex = this.cells.length - 1;
  // start cloning at last cell, working backwards
  this.beforeClones = this._getClones( gapX, cellIndex, -1 );
  // after cells
  // ending gap between last cell and end of gallery viewport
  var lastCell = this.cells[ this.cells.length - 1 ];
  gapX = ( this.size.innerWidth - this.cursorPosition ) -
    lastCell.size.width * ( 1 - this.options.targetPosition );
  // start cloning at first cell, working forwards
  this.afterClones = this._getClones( gapX, 0, 1 );
};

Flickity.prototype._getClones = function( gapX, cellIndex, increment ) {
  var clones = [];
  var fragment = document.createDocumentFragment();
  // keep adding cells until the cover the initial gap
  while ( gapX >= 0 ) {
    var cell = this.cells[ cellIndex ];
    var clone = {
      // keep track of which cell this clone matches
      cell: cell,
      // clone element
      element: cell.element.cloneNode( true )
    };
    clones.push( clone );
    fragment.appendChild( clone.element );
    cellIndex += increment;
    gapX -= cell.size.outerWidth;
  }
  this.slider.appendChild( fragment );
  return clones;
};

Flickity.prototype.positionClones = function() {
  // before clones
  var cellX, clone, i, len;
  var side = this.options.rightToLeft ? 'right' : 'left';
  if ( this.beforeClones ) {
    cellX = 0;
    for ( i=0, len = this.beforeClones.length; i < len; i++ ) {
      clone = this.beforeClones[i];
      cellX -= clone.cell.size.outerWidth;
      clone.element.style[ side ] = this.getPositionValue( cellX );
    }
  }
  // after clones
  if ( this.afterClones ) {
    var lastCell =  this.cells[ this.cells.length - 1 ];
    cellX = lastCell.x + lastCell.size.outerWidth;
    for ( i=0, len = this.afterClones.length; i < len; i++ ) {
      clone = this.afterClones[i];
      clone.element.style[ side ] = this.getPositionValue( cellX );
      cellX += clone.cell.size.outerWidth;
    }
  }
};

// -------------------------- pointer events -------------------------- //

Flickity.prototype.pointerDown = function( event, pointer ) {
  preventDefaultEvent( event );
  // kludge to blur focused inputs in dragger
  var focused = document.activeElement;
  if ( focused && focused.blur ) {
    focused.blur();
  }
  // stop if it was moving
  this.velocity = 0;
  // track to see when dragging starts
  this.pointerDownPoint = Unipointer.getPointerPoint( pointer );
};

Flickity.prototype.pointerMove = function( event, pointer ) {

  var movePoint = Unipointer.getPointerPoint( pointer );
  var dragMove = movePoint.x - this.pointerDownPoint.x;

  // start drag
  if ( !this.isDragging && Math.abs( dragMove ) > 3 ) {
    this.dragStart( event, pointer );
  }

  this.dragMove( movePoint, event, pointer );
};



Flickity.prototype.pointerUp = function( event, pointer ) {
  if ( this.isDragging ) {
    this.dragEnd( event, pointer );
  } else {
    // allow click in text input
    if ( event.target.nodeName === 'INPUT' && event.target.type === 'text' ) {
      event.target.focus();
    }
  }
};

// handle IE8 prevent default
function preventDefaultEvent( event ) {
  if ( event.preventDefault ) {
    event.preventDefault();
  } else {
    event.returnValue = false;
  }
}

// -------------------------- dragging -------------------------- //

Flickity.prototype.dragStart = function( event, pointer ) {
  this.isDragging = true;
  this.dragStartPoint = Unipointer.getPointerPoint( pointer );
  this.dragStartPosition = this.x;
  this.startAnimation();
  // prevent clicks
  this.isPreventingClicks = true;
  this.emitEvent( 'dragStart', [ this, event, pointer ] );
};

Flickity.prototype.dragMove = function( movePoint, event, pointer ) {
  // do not drag if not dragging yet
  if ( !this.isDragging ) {
    return;
  }

  this.previousDragX = this.x;

  var movedX = movePoint.x - this.dragStartPoint.x;
  // reverse if right-to-left
  var direction = this.options.rightToLeft ? -1 : 1;
  this.x = this.dragStartPosition + movedX * direction;

  this.previousDragMoveTime = this.dragMoveTime;
  this.dragMoveTime = new Date();
  this.emitEvent( 'dragMove', [ this, event, pointer ] );
};

Flickity.prototype.dragEnd = function( event, pointer ) {
  this.dragEndFlick();
  var previousIndex = this.selectedIndex;
  var index = this.dragEndRestingSelect();
  // boost selection if selected index has not changed
  if ( index === previousIndex ) {
    index = this.dragEndBoostSelect();
  }
  // apply selection
  // TODO refactor this, selecting here feels weird
  this.select( index );

  this.isDragging = false;
  // re-enable clicking async
  var _this = this;
  setTimeout( function() {
    delete _this.isPreventingClicks;
  });

  this.emitEvent( 'dragEnd', [ this, event, pointer ] );
};

// apply velocity after dragging
Flickity.prototype.dragEndFlick = function() {
  if ( !isFinite( this.previousDragX ) ) {
    return;
  }
  // set slider velocity
  var timeDelta = ( new Date() ) - this.previousDragMoveTime;
  // 60 frames per second, ideally
  // TODO, velocity should be in pixels per millisecond
  // currently in pixels per frame
  timeDelta /= 1000 / 60;
  var xDelta = this.x - this.previousDragX;
  this.velocity = xDelta / timeDelta;
  // reset
  delete this.previousDragX;
};

Flickity.prototype.dragEndRestingSelect = function() {
  var restingX = this.getRestingPosition();
  var index = this.selectedWrapIndex;
  var len = this.cells.length;
  // how far away from selected cell
  var selectedCell = this.cells[ modulo( index, len ) ];
  var distance = Math.abs( -restingX - selectedCell.target );
  // get closet resting going up and going down
  var positiveResting = this._getClosestResting( restingX, distance, 1 );
  var negativeResting = this._getClosestResting( restingX, distance, -1 );
  // use closer resting for wrap-around
  index = positiveResting.distance < negativeResting.distance ?
    positiveResting.index : negativeResting.index;
  // set wrapIndex so it can be used for flicking
  if ( this.options.wrapAround ) {
    this.selectedWrapIndex = index;
  }

  return index;
};

/**
 * given resting X and distance to selected cell
 * get the distance and index of the closest cell
 * @param {Number} restingX - estimated post-flick resting position
 * @param {Number} distance - distance to selected cell
 * @param {Integer} increment - +1 or -1, going up or down
 * @returns {Object} - { distance: {Number}, index: {Integer} }
 */
Flickity.prototype._getClosestResting = function( restingX, distance, increment ) {
  var index = this.selectedWrapIndex;
  var minDistance = Infinity;
  var len = this.cells.length;
  while ( distance < minDistance ) {
    // measure distance to next cell
    index += increment;
    minDistance = distance;
    var cellIndex = this.options.wrapAround ? modulo( index, len ) : index;
    var wrap = this.options.wrapAround ? this.slideableWidth * Math.floor( index / len ) : 0;
    var cell = this.cells[ cellIndex ];
    if ( !cell ) {
      break;
    }
    distance = Math.abs( -restingX - ( cell.target + wrap ) );
  }
  return {
    distance: minDistance,
    // selected was previous index
    index: index - increment
  };
};

Flickity.prototype.dragEndBoostSelect = function() {
  var selectedCell = this.cells[ this.selectedIndex ];
  var distance = -this.x - selectedCell.target;
  if ( distance > 0 && this.velocity < -1 ) {
    // if moving towards the right, and positive velocity, and the next attractor
    return this.selectedIndex + 1;
  } else if ( distance < 0 && this.velocity > 1 ) {
    // if moving towards the left, and negative velocity, and previous attractor
    return this.selectedIndex - 1;
  }
  return this.selectedIndex;
};

// ----- onclick ----- //

// handle all clicks and prevent clicks when dragging
Flickity.prototype.onclick = function( event ) {
  if ( this.isPreventingClicks ) {
    preventDefaultEvent( event );
  }
};

// -------------------------- select -------------------------- //

Flickity.prototype.select = function( index ) {
  var previousIndex = this.selectedIndex;
  if ( this.options.wrapAround ) {
    var len = this.cells.length;
    // update selectedWrapIndex if needed
    // TODO, currently happening in dragEndRestingSelect
    if ( this.selectedWrapIndex % len !== index % len ) {
      this.selectedWrapIndex += index - previousIndex;
    }
    index = modulo( index, len );
  }

  if ( this.cells[ index ] ) {
    this.selectedIndex = index;
    this.updatePrevNextButtons();
    if ( this.pageDots ) {
      this.pageDots.update();
    }
    this.startAnimation();
  }
};

Flickity.prototype.previous = function() {
  this.select( this.selectedIndex - 1 );
};

Flickity.prototype.next = function() {
  this.select( this.selectedIndex + 1 );
};

Flickity.prototype.updatePrevNextButtons = function() {
  // no need if wrap around
  if ( this.options.wrapAround ) {
    return;
  }

  var method;

  if ( this.prevButton ) {
    method = this.selectedIndex === 0 ? 'disable' : 'enable';
    this.prevButton[ method ]();
  }

  if ( this.nextButton ) {
    method = this.selectedIndex === this.cells.length - 1 ? 'disable' : 'enable';
    this.nextButton[ method ]();
  }
};

// -------------------------- animate -------------------------- //

Flickity.prototype.startAnimation = function() {
  if ( this.isAnimating ) {
    return;
  }

  this.isAnimating = true;
  this.restingFrames = 0;
  this.animate();
};

Flickity.prototype.animate = function() {
  if ( !this.isPointerDown ) {
    var force = this.getSelectedAttraction();
    this.applyForce( force );
  }

  var previousX = this.x;

  this.updatePhysics();
  this.positionSlider();
  // keep track of frames where x hasn't moved
  if ( !this.isPointerDown && Math.round( this.x * 100 ) === Math.round( previousX * 100 ) ) {
    this.restingFrames++;
  }
  // stop animating if resting for 3 or more frames
  if ( this.restingFrames > 2 ) {
    this.isAnimating = false;
  }

  if ( this.isAnimating ) {
    var _this = this;
    requestAnimationFrame( function animateFrame() {
      _this.animate();
    });
  }
};

var transformProperty = getStyleProperty('transform');

Flickity.prototype.positionSlider = function() {
  var x = this.x;
  // wrap position around
  if ( this.options.wrapAround ) {
    x = modulo( x, this.slideableWidth );
    x = x - this.slideableWidth;
  }

  x = x + this.cursorPosition;

  // reverse if right-to-left and using transform
  x = this.options.rightToLeft && transformProperty ? -x : x;

  var value = this.getPositionValue( x );

  if ( transformProperty ) {
    this.slider.style[ transformProperty ] = 'translateX(' + value + ')';
  } else {
    var side = this.options.rightToLeft ? 'right' : 'left';
    this.slider.style[ side ] = value;
  }
};

Flickity.prototype.positionSliderAtSelected = function() {
  var selectedCell = this.cells[ this.selectedIndex ];
  this.x = -selectedCell.target;
  this.positionSlider();
};

Flickity.prototype.getPositionValue = function( position ) {
  if ( this.options.pixelPositioning ) {
    // pixel positioning
    return Math.round( position ) + 'px';
  } else {
    // percent position, round to 2 digits, like 12.34%
    return ( Math.round( ( position / this.size.innerWidth ) * 10000 ) * 0.01 )+ '%';
  }
};

// -------------------------- physics -------------------------- //

Flickity.prototype.updatePhysics = function() {
  this.velocity += this.accel;
  this.velocity *= ( 1 - this.options.friction );
  this.x += this.velocity;
  // reset acceleration
  this.accel = 0;
};

Flickity.prototype.applyForce = function( force ) {
  this.accel += force;
};


var restingVelo = 0.07;

Flickity.prototype.getRestingPosition = function() {
  // little simulation where thing will rest
  var velo = this.velocity;
  var restX = this.x;
  while ( Math.abs( velo ) > restingVelo ) {
    velo *= 1 - this.options.friction;
    restX += velo;
  }
  return restX;
};

Flickity.prototype.getSelectedAttraction = function() {
  var cell = this.cells[ this.selectedIndex ];
  var wrap = this.options.wrapAround ?
    this.slideableWidth * Math.floor( this.selectedWrapIndex / this.cells.length ) : 0;
  var distance = ( cell.target + wrap ) * -1 - this.x;
  var force = distance * 0.025;
  return force;
};

// -------------------------- resize -------------------------- //

Flickity.prototype.onresize = function() {
  this.getSize();
  // wrap values
  if ( this.options.wrapAround ) {
    var len = this.cells.length;
    this.selectedWrapIndex = modulo( this.selectedWrapIndex, len );
    this.x = modulo( this.x, this.slideableWidth );
  }
  this.positionCells();
  this.positionClones();
  this.positionSliderAtSelected();
};

U.debounceMethod( Flickity, 'onresize', 150 );

// --------------------------  -------------------------- //

window.Flickity = Flickity;

})( window );
