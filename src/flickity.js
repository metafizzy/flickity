/*!
 * Flickity
 * Touch responsive gallery
 */

/*global EventEmitter: false, Cell: false */

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
  friction: 0.2
};

// inherit EventEmitter
U.extend( Flickity.prototype, EventEmitter.prototype );
U.extend( Flickity.prototype, Unipointer.prototype );

Flickity.prototype._create = function() {
  // variables
  this.x = 0;
  this.velocity = 0;
  this.accel = 0;

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

  this.animate();

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
  this.emitEvent( 'dragStart', [ this, event, pointer ] );
};

Flickity.prototype.dragMove = function( movePoint, event, pointer ) {
  // do not drag if not dragging yet
  if ( !this.isDragging ) {
    return;
  }

  this.previousX = this.x;

  var movedX = movePoint.x - this.dragStartPoint.x;
  this.x = this.dragStartPosition + movedX;

  this.previousDragMoveTime = this.dragMoveTime;
  this.dragMoveTime = new Date();

  this.emitEvent( 'dragMove', [ this, event, pointer ] );
};

Flickity.prototype.dragEnd = function( event, pointer ) {
  if ( isFinite( this.previousX ) ) {
    // set slider velocity
    var timeDelta = this.dragMoveTime - this.previousDragMoveTime;
    // 60 frames per second, ideally
    // TODO, velocity should be in pixels per millisecond
    // currently in pixels per frame
    timeDelta /= 1000 / 60;
    var xDelta = this.x - this.previousX;
    this.velocity = xDelta / timeDelta;
    // reset
    delete this.previousX;
  }

  this.isDragging = false;

  this.emitEvent( 'dragEnd', [ this, event, pointer ] );
};

// -------------------------- animate -------------------------- //

Flickity.prototype.animate = function() {
  this.updatePhysics();
  this.positionSlider();

  var _this = this;
  requestAnimationFrame( function animateFrame() {
    _this.animate();
  });
};

Flickity.prototype.positionSlider = function() {
  this.slider.style.left = this.x + 'px';
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

window.Flickity = Flickity;

})( window );
