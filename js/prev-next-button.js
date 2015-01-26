// -------------------------- prev/next button -------------------------- //

( function( window, factory ) {
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      './tap-listener',
      'fizzy-ui-utils/utils'
    ], function( TapListener, utils ) {
      return factory( window, TapListener, utils );
    });
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('./tap-listener'),
      require('fizzy-ui-utils')
    );
  } else {
    // browser global
    window.Flickity = window.Flickity || {};
    window.Flickity.PrevNextButton = factory(
      window,
      window.TapListener,
      window.fizzyUIUtils
    );
  }

}( window, function factory( window, TapListener, utils ) {

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
  this.isPrevious = this.direction == -1;
  var leftDirection = this.parent.options.rightToLeft ? 1 : -1;
  this.isLeft = this.direction == leftDirection;

  this.element = document.createElement('button');
  this.element.className = 'flickity-prev-next-button';
  this.element.className += this.isPrevious ? ' previous' : ' next';
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
  this.parent.on( 'cellSelect', this.onselect );
  // tap
  var tapListener = this.tapListener = new TapListener();
  tapListener.bindTap( this.element );
  tapListener.on( 'tap', function onTap() {
    _this.onTap.apply( _this, arguments );
  });
  // pointerDown
  tapListener.on( 'pointerDown', function onPointerDown( button, event ) {
    _this.parent.onChildUIPointerDown( event );
  });
};

PrevNextButton.prototype.activate = function() {
  // add to DOM
  this.parent.element.appendChild( this.element );
};

PrevNextButton.prototype.deactivate = function() {
  // remove from DOM
  this.parent.element.removeChild( this.element );
};

PrevNextButton.prototype.createSVG = function() {
  var svg = document.createElementNS( svgURI, 'svg');
  svg.setAttribute( 'viewBox', '0 0 100 100' );
  var path = document.createElementNS( svgURI, 'path');
  path.setAttribute( 'd', 'M 50,0 L 60,10 L 20,50 L 60,90 L 50,100 L 0,50 Z' );
  path.setAttribute( 'class', 'arrow' );
  // adjust arrow
  var arrowTransform = this.isLeft ? 'translate(15,0)' :
    'translate(85,100) rotate(180)';
  path.setAttribute( 'transform', arrowTransform );
  svg.appendChild( path );
  return svg;
};

PrevNextButton.prototype.setArrowText = function() {
  var parentOptions = this.parent.options;
  var arrowText = this.isLeft ? parentOptions.leftArrowText : parentOptions.rightArrowText;
  utils.setText( this.element, arrowText );
};

PrevNextButton.prototype.onTap = function() {
  if ( !this.isEnabled ) {
    return;
  }
  this.parent.uiChange();
  var method = this.isPrevious ? 'previous' : 'next';
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
  var boundIndex = this.isPrevious ? 0 : this.parent.cells.length - 1;
  var method = this.parent.selectedIndex == boundIndex ? 'disable' : 'enable';
  this[ method ]();
};

// TODO destroy prev/nextButton in flickity.destroy
PrevNextButton.prototype.destroy = function() {
  this.deactivate();
  this.tapListener.destroy();
};

return PrevNextButton;

}));
