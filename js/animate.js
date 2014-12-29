/*global getStyleProperty: false */

( function( window ) {

'use strict';

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

// -------------------------- animate -------------------------- //

var proto = {};

proto.startAnimation = function() {
  if ( this.isAnimating ) {
    return;
  }

  this.isAnimating = true;
  this.restingFrames = 0;
  this.animate();
};

proto.animate = function() {
  this.applySelectedAttraction();

  var previousX = this.x;

  this.updatePhysics();
  this.positionSlider();
  this.settle( previousX );
  // animate next frame
  if ( this.isAnimating ) {
    var _this = this;
    requestAnimationFrame( function animateFrame() {
      _this.animate();
    });
  }
};


var transformProperty = getStyleProperty('transform');

proto.positionSlider = function() {
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
    var side = this.getOriginSide();
    this.slider.style[ side ] = value;
  }
};

proto.positionSliderAtSelected = function() {
  var selectedCell = this.cells[ this.selectedIndex ];
  this.x = -selectedCell.target;
  this.positionSlider();
};

proto.getPositionValue = function( position ) {
  if ( this.options.pixelPositioning ) {
    // pixel positioning
    return Math.round( position ) + 'px';
  } else {
    // percent position, round to 2 digits, like 12.34%
    return ( Math.round( ( position / this.size.innerWidth ) * 10000 ) * 0.01 )+ '%';
  }
};

proto.settle = function( previousX ) {
  // keep track of frames where x hasn't moved
  if ( !this.isPointerDown && Math.round( this.x * 100 ) === Math.round( previousX * 100 ) ) {
    this.restingFrames++;
  }
  // stop animating if resting for 3 or more frames
  if ( this.restingFrames > 2 ) {
    this.isAnimating = false;
    delete this.isFreeScrolling;
    this.dispatchEvent('settle');
  }
};

// -------------------------- physics -------------------------- //

proto.updatePhysics = function() {
  this.velocity += this.accel;
  this.velocity *= this.getFrictionFactor();
  this.x += this.velocity;
  // reset acceleration
  this.accel = 0;
};

proto.applyForce = function( force ) {
  this.accel += force;
};

proto.getFrictionFactor = function() {
  return 1 - this.options[ this.isFreeScrolling ? 'freeScrollFriction' : 'friction' ];
};


var restingVelo = 0.07;

proto.getRestingPosition = function() {
  // little simulation where thing will rest
  var velo = this.velocity;
  var restX = this.x;
  var frictionF = this.getFrictionFactor();
  while ( Math.abs( velo ) > restingVelo ) {
    velo *= frictionF;
    restX += velo;
  }
  return restX;
};


proto.applySelectedAttraction = function() {
  // do not attract if pointer down
  if ( this.isPointerDown || this.isFreeScrolling ) {
    return;
  }
  var cell = this.cells[ this.selectedIndex ];
  var wrap = this.options.wrapAround ?
    this.slideableWidth * Math.floor( this.selectedWrapIndex / this.cells.length ) : 0;
  var distance = ( cell.target + wrap ) * -1 - this.x;
  var force = distance * this.options.selectedAttraction;
  this.applyForce( force );
};

window.Flickity = window.Flickity || {};
window.Flickity.animatePrototype = proto;

})( window );
