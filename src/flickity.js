/*!
 * Flickity
 * Touch responsive gallery
 */

/*global EventEmitter: false, Cell: false, getSize: false, getStyleProperty: false, eventie: false */

( function( window ) {

'use strict';

// utils
var U = window.utils;
var Unipointer = window.Unipointer;

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
  targetPosition: 0.5,
  resizeBound: true
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
  // how many frames slider has been in same position
  this.restingFrames = 0;

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
  this.getSize();
  var firstCell = this.cells[0];
  this.element.style.height = firstCell.size.outerHeight +
    this.size.borderTopWidth + this.size.borderBottomWidth + 'px';

  this.positionSliderAtSelected();

  // events
  // TODO bind start events proper
  // maybe move to Unipointer
  eventie.bind( this.element, 'mousedown', this );

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
    cell.getSize();
    cell.setPosition( cellX );
    cellX += cell.size.outerWidth;
  }
};

Flickity.prototype.getSize = function() {
  this.size = getSize( this.element );
  this.cursorPosition = this.size.innerWidth * this.options.cursorPosition;
};

// -------------------------- pointer events -------------------------- //

Flickity.prototype.pointerDown = function( event, pointer ) {
  if ( event.preventDefault ) {
    event.preventDefault();
  } else {
    event.returnValue = false;
  }

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
  this.dragEnd( event, pointer );

  // this.emitEvent( 'dragMove', [ this, event, pointer ] );
};

// -------------------------- dragging -------------------------- //

Flickity.prototype.dragStart = function( event, pointer ) {
  this.isDragging = true;
  this.dragStartPoint = Unipointer.getPointerPoint( pointer );
  this.dragStartPosition = this.x;
  this.startAnimation();
  this.emitEvent( 'dragStart', [ this, event, pointer ] );
};

Flickity.prototype.dragMove = function( movePoint, event, pointer ) {
  // do not drag if not dragging yet
  if ( !this.isDragging ) {
    return;
  }

  this.previousDragX = this.x;

  var movedX = movePoint.x - this.dragStartPoint.x;
  this.x = this.dragStartPosition + movedX;

  this.previousDragMoveTime = this.dragMoveTime;
  this.dragMoveTime = new Date();
  this.emitEvent( 'dragMove', [ this, event, pointer ] );
};

Flickity.prototype.dragEnd = function( event, pointer ) {
  this.dragEndFlick();
  var previousIndex = this.selectedIndex;
  this.dragEndRestingSelect();
  // boost selection if selected index has not changed
  if ( this.selectedIndex === previousIndex ) {
    this.dragEndBoostSelect();
  }

  this.isDragging = false;

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
  delete this.previousX;
};

Flickity.prototype.dragEndRestingSelect = function() {
  var restingX = this.getRestingPosition();
  // get closest attractor to end position
  var minDistance = Infinity;
  var distance;
  for ( var i=0, len = this.cells.length; i < len; i++ ) {
    var cell = this.cells[i];
    distance = Math.abs( -restingX - cell.target );
    if ( distance < minDistance ) {
      this.selectedIndex = i;
      minDistance = distance;
    }
  }
};

Flickity.prototype.dragEndBoostSelect = function() {
  var selectedCell = this.cells[ this.selectedIndex ];
  var distance = -this.x - selectedCell.target;
  if ( distance > 0 && this.velocity < -1 ) {
    // if moving towards the right, and positive velocity, and the next attractor
    this.selectNext();
  } else if ( distance < 0 && this.velocity > 1 ) {
    // if moving towards the left, and negative velocity, and previous attractor
    this.selectPrevious();
  }
};

// -------------------------- select -------------------------- //

Flickity.prototype.select = function( index ) {
  if ( this.cells[ index ] ) {
    this.selectedIndex = index;
    this.startAnimation();
  }
};

Flickity.prototype.selectPrevious = function() {
  this.select( this.selectedIndex - 1);
};

Flickity.prototype.selectNext = function() {
  this.select( this.selectedIndex + 1 );
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
  if ( !this.isDragging ) {
    var force = this.getSelectedAttraction();
    this.applyForce( force );
  }

  var previousX = this.x;

  this.updatePhysics();
  this.positionSlider();
  // keep track of frames where x hasn't moved
  if ( !this.isDragging && Math.round( this.x * 100 ) === Math.round( previousX * 100 ) ) {
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
  var x = Math.round( this.x + this.cursorPosition );
  if ( transformProperty ) {
    this.slider.style[ transformProperty ] = 'translateX(' + x + 'px)';
  } else {
    this.slider.style.left = x + 'px';
  }
};

Flickity.prototype.positionSliderAtSelected = function() {
  var selectedCell = this.cells[ this.selectedIndex ];
  this.x = -selectedCell.target;
  this.positionSlider();
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
  var distance = -cell.target - this.x;
  var force = distance * 0.025;
  return force;
};

// -------------------------- resize -------------------------- //

Flickity.prototype.onresize = function() {
  this.getSize();
  this.positionCells();
  this.positionSliderAtSelected();
};

U.debounceMethod( Flickity, 'onresize', 150 );

// --------------------------  -------------------------- //

window.Flickity = Flickity;

})( window );
