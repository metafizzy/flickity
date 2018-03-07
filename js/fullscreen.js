// fullscreen
( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      './flickity',
      'tap-listener/tap-listener',
    ], factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('./flickity'),
      require('tap-listener')
    );
  } else {
    // browser global
    factory(
      window.Flickity,
      window.TapListener
    );
  }

}( window, function factory( Flickity, TapListener ) {

'use strict';

Flickity.createMethods.push('_createFullscreen');
var proto = Flickity.prototype;


proto._createFullscreen = function() {
  // console.log(  this.options.fullscreen );
  if ( !this.options.fullscreen ) {
    return;
  }
  // property
  this.isFullscreen = false;
  // buttons
  this.expandFullscreenButton = new FullscreenButton( 'expand', this );
  this.collapseFullscreenButton = new FullscreenButton( 'collapse', this );

  this.on( 'activate', this._changeFullscreenActive );
  this.on( 'deactivate', this._changeFullscreenActive );
};

// ----- activation ----- //

proto._changeFullscreenActive = function() {
  var childMethod = this.isActive ? 'appendChild' : 'removeChild';
  this.element[ childMethod ]( this.expandFullscreenButton.element );
  this.element[ childMethod ]( this.collapseFullscreenButton.element );
};

// ----- expand, collapse, toggle ----- //

proto.expandFullscreen = function() {
  this._changeFullscreen( true );
  this.focus();
};

proto.collapseFullscreen = function() {
  this._changeFullscreen( false );
};

proto._changeFullscreen = function( isExpand ) {
  if ( this.isFullscreen == isExpand ) {
    return;
  }
  this.isFullscreen = isExpand;
  var classMethod = isExpand ? 'add' : 'remove';
  document.documentElement.classList[ classMethod ]('is-flickity-fullscreen');
  this.element.classList[ classMethod ]('is-fullscreen');
  this.resize();
  // HACK extra reposition on fullscreen for images
  if ( this.isFullscreen ) {
    this.reposition();
  }
};

proto.toggleFullscreen = function() {
  this._changeFullscreen( !this.isFullscreen );
};

// ----- setGallerySize ----- //

// overwrite so fullscreen cells are full height
var setGallerySize = proto.setGallerySize;
proto.setGallerySize = function() {
  if ( !this.options.setGallerySize ) {
    return;
  }
  if ( this.isFullscreen ) {
    // remove height style on fullscreen
    this.viewport.style.height = '';
  } else {
    // otherwise, do normal
    setGallerySize.call( this );
  }
};

// ----- keyboard ----- //

// ESC key closes full screen
Flickity.keyboardHandlers[27] = function() {
  this.collapseFullscreen();
};

// ----- FullscreenButton ----- //

function FullscreenButton( name, flickity ) {
  var element = this.element = document.createElement('button');
  element.textContent = name;
  element.className = 'flickity-fullscreen-button ' + name;
  element.setAttribute( 'aria-label', name + ' full-screen' );

  // trigger expandFullscreen or collapseFullscreen on button tap
  function onTap() {
    flickity[ name + 'Fullscreen' ]();
  }
  this.on( 'tap', onTap );
  this.bindTap( this.element );
}

FullscreenButton.prototype = Object.create( TapListener.prototype );

// ----- fin ----- //

return Flickity;

}));
