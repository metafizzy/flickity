/*global utils: false */

// -------------------------- prev/next button -------------------------- //

( function( window ) {

'use strict';

var svgURI = 'http://www.w3.org/2000/svg';

// -------------------------- inline SVG support -------------------------- //

// only check on demand, not on script load
var supportsInlineSVG = ( function() {
  var supports;
  function checkSupport() {
    if ( supports !== undefined ) {
      return supports;
    }
    var div = document.createElement('div');
    div.innerHTML = '<svg/>';
    supports = ( div.firstChild && div.firstChild.namespaceURI ) == svgURI;
    return supports;
  }
  return checkSupport;
})();

function PrevNextButton( direction, parent ) {
  this.direction = direction;
  this.parent = parent;
  this._create();
}

PrevNextButton.prototype._create = function() {
  // properties
  this.isEnabled = true;

  this.element = document.createElement('button');
  this.element.className = 'flickity-prev-next-button';
  this.element.className += this.direction === -1 ? ' previous' : ' next';
  // create arrow
  if ( supportsInlineSVG() ) {
    var svg = this.createSVG();
    this.element.appendChild( svg );
  } else {
    // SVG not supported, set button text
    this.setArrowText();
    this.element.className += ' no-svg';
  }

  // update on select
  var _this = this;
  this.onselect = function() {
    _this.update();
  };
  this.parent.on( 'select', this.onselect );

  // listen to click event
  this.element.onclick = function() {
    _this.onclick();
  };

  this.parent.element.appendChild( this.element );
};

PrevNextButton.prototype.createSVG = function() {
  var svg = document.createElementNS( svgURI, 'svg');
  svg.setAttribute( 'viewBox', '0 0 100 100' );
  var path = document.createElementNS( svgURI, 'path');
  path.setAttribute( 'd', 'M 50,0 L 60,10 L 20,50 L 60,90 L 50,100 L 0,50 Z' );
  path.setAttribute( 'class', 'arrow' );
  // adjust arrow
  var leftDirection = this.parent.options.rightToLeft ? 1 : -1;
  var arrowTransform = this.direction === leftDirection ? 'translate(15,0)' :
    'translate(85,100) rotate(180)';
  path.setAttribute( 'transform', arrowTransform );
  svg.appendChild( path );
  return svg;
};

PrevNextButton.prototype.setArrowText = function() {
  var parentOptions = this.parent.options;
  var previousArrowText = parentOptions.rightToLeft ?
    parentOptions.rightArrowText : parentOptions.leftArrowText;
  var nextArrowText = parentOptions.rightToLeft ?
      parentOptions.leftArrowText : parentOptions.rightArrowText;
  var arrowText = this.isPrevious() ? previousArrowText : nextArrowText;
  utils.setText( this.element, arrowText );
};

PrevNextButton.prototype.isPrevious = function() {
  return this.direction === -1;
};

PrevNextButton.prototype.onclick = function() {
  if ( !this.isEnabled ) {
    return;
  }
  this.parent.uiChange();
  var method = this.isPrevious() ? 'previous' : 'next';
  this.parent[ method ]();
};

PrevNextButton.prototype.enable = function() {
  if ( this.isEnabled ) {
    return;
  }
  this.element.disabled = false;
  this.isEnabled = true;
};

PrevNextButton.prototype.disable = function() {
  if ( !this.isEnabled ) {
    return;
  }
  this.element.disabled = true;
  this.isEnabled = false;
};

PrevNextButton.prototype.update = function() {
  if ( this.parent.options.wrapAround ) {
    this.enable();
    return;
  }
  // index of first or last cell, if previous or next
  var boundIndex = this.isPrevious() ? 0 : this.parent.cells.length - 1;
  var method = this.parent.selectedIndex === boundIndex ? 'disable' : 'enable';
  this[ method ]();
};

window.PrevNextButton = PrevNextButton;

})( window );
