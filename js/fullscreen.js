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
  this.viewFullscreenButton = new FullscreenButton( 'view', this );
  this.exitFullscreenButton = new FullscreenButton( 'exit', this );

  this.on( 'activate', this._changeFullscreenActive );
  this.on( 'deactivate', this._changeFullscreenActive );
};

// ----- activation ----- //

proto._changeFullscreenActive = function() {
  var childMethod = this.isActive ? 'appendChild' : 'removeChild';
  this.element[ childMethod ]( this.viewFullscreenButton.element );
  this.element[ childMethod ]( this.exitFullscreenButton.element );
  // activate or deactivate buttons
  var activeMethod = this.isActive ? 'activate' : 'deactivate';
  this.viewFullscreenButton[ activeMethod ]();
  this.exitFullscreenButton[ activeMethod ]();
};

// ----- view, exit, toggle ----- //

proto.viewFullscreen = function() {
  this._changeFullscreen( true );
  this.focus();
};

proto.exitFullscreen = function() {
  this._changeFullscreen( false );
};

proto._changeFullscreen = function( isView ) {
  if ( this.isFullscreen == isView ) {
    return;
  }
  this.isFullscreen = isView;
  var classMethod = isView ? 'add' : 'remove';
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
  this.exitFullscreen();
};

// ----- FullscreenButton ----- //

function FullscreenButton( name, flickity ) {
  this.name = name;
  this.createButton();
  this.createIcon();
  // events
  // trigger viewFullscreen or exitFullscreen on button tap
  this.onTap = function() {
    flickity[ name + 'Fullscreen' ]();
  };
  this.bindTap( this.element );
  this.clickHandler = this.onClick.bind( this );
}

FullscreenButton.prototype = Object.create( TapListener.prototype );

FullscreenButton.prototype.createButton = function() {
  var element = this.element = document.createElement('button');
  element.className = 'flickity-button flickity-fullscreen-button ' +
    'flickity-fullscreen-button-' + this.name;
  // set label
  var label = capitalize( this.name + ' full-screen' );
  element.setAttribute( 'aria-label', label );
  element.title = label;
};

function capitalize( text ) {
  return text[0].toUpperCase() + text.slice(1);
}

var svgURI = 'http://www.w3.org/2000/svg';

var pathDirections = {
  view: 'M0,32V20H4v8h8v4Zm32,0V20H28v8H20v4ZM0,0V12H4V4h8V0ZM20,0V4h8v8h4V0Z',
  exit: 'M20,12V0h4V8h8v4Zm-8,0V0H8V8H0v4Zm8,8V32h4V24h8V20ZM0,20v4H8v8h4V20Z',
};

FullscreenButton.prototype.createIcon = function() {
  var svg = document.createElementNS( svgURI, 'svg');
  svg.setAttribute( 'class', 'flickity-button-icon' );
  svg.setAttribute( 'viewBox', '0 0 32 32' );
  // path & direction
  var path = document.createElementNS( svgURI, 'path');
  var direction = pathDirections[ this.name ];
  path.setAttribute( 'd', direction );
  // put it together
  svg.appendChild( path );
  this.element.appendChild( svg );
};

FullscreenButton.prototype.activate = function() {
  this.on( 'tap', this.onTap );
  this.element.addEventListener( 'click', this.clickHandler );
};

FullscreenButton.prototype.deactivate = function() {
  this.off( 'tap', this.onTap );
  this.element.removeEventListener( 'click', this.clickHandler );
};

FullscreenButton.prototype.onClick = function() {
  var focused = document.activeElement;
  if ( focused && focused == this.element ) {
    this.onTap();
  }
};

// ----- fin ----- //

return Flickity;

}));
