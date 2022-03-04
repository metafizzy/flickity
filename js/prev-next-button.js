// prev/next buttons
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./core') );
  } else {
    // browser global
    factory( window.Flickity );
  }

}( typeof window != 'undefined' ? window : this, function factory( Flickity ) {

const svgURI = 'http://www.w3.org/2000/svg';

// -------------------------- PrevNextButton -------------------------- //

function PrevNextButton( increment, direction, arrowShape ) {
  this.increment = increment;
  this.direction = direction;
  this.isPrevious = increment === 'previous';
  this.isLeft = direction === 'left';
  this._create( arrowShape );
}

PrevNextButton.prototype._create = function( arrowShape ) {
  // properties
  let element = this.element = document.createElement('button');
  element.className = `flickity-button flickity-prev-next-button ${this.increment}`;
  let label = this.isPrevious ? 'Previous' : 'Next';
  // prevent button from submitting form https://stackoverflow.com/a/10836076/182183
  element.setAttribute( 'type', 'button' );
  element.setAttribute( 'aria-label', label );
  // init as disabled
  this.disable();
  // create arrow
  let svg = this.createSVG( label, arrowShape );
  element.append( svg );
};

PrevNextButton.prototype.createSVG = function( label, arrowShape ) {
  let svg = document.createElementNS( svgURI, 'svg' );
  svg.setAttribute( 'class', 'flickity-button-icon' );
  svg.setAttribute( 'viewBox', '0 0 100 100' );
  // add title #1189
  let title = document.createElementNS( svgURI, 'title' );
  title.append( label );
  // add path
  let path = document.createElementNS( svgURI, 'path' );
  let pathMovements = getArrowMovements( arrowShape );
  path.setAttribute( 'd', pathMovements );
  path.setAttribute( 'class', 'arrow' );
  // rotate arrow
  if ( !this.isLeft ) {
    path.setAttribute( 'transform', 'translate(100, 100) rotate(180)' );
  }
  svg.append( title, path );
  return svg;
};

// get SVG path movmement
function getArrowMovements( shape ) {
  // use shape as movement if string
  if ( typeof shape == 'string' ) return shape;

  let { x0, x1, x2, x3, y1, y2 } = shape;

  // create movement string
  return `M ${x0}, 50
    L ${x1}, ${y1 + 50}
    L ${x2}, ${y2 + 50}
    L ${x3}, 50
    L ${x2}, ${50 - y2}
    L ${x1}, ${50 - y1}
    Z`;
}

// -----  ----- //

PrevNextButton.prototype.enable = function() {
  this.element.removeAttribute('disabled');
};

PrevNextButton.prototype.disable = function() {
  this.element.setAttribute( 'disabled', true );
};

// -------------------------- Flickity prototype -------------------------- //

Object.assign( Flickity.defaults, {
  prevNextButtons: true,
  arrowShape: {
    x0: 10,
    x1: 60, y1: 50,
    x2: 70, y2: 40,
    x3: 30,
  },
} );

Flickity.create.prevNextButtons = function() {
  if ( !this.options.prevNextButtons ) return;

  let { rightToLeft, arrowShape } = this.options;
  let prevDirection = rightToLeft ? 'right' : 'left';
  let nextDirection = rightToLeft ? 'left' : 'right';
  this.prevButton = new PrevNextButton( 'previous', prevDirection, arrowShape );
  this.nextButton = new PrevNextButton( 'next', nextDirection, arrowShape );
  this.focusableElems.push( this.prevButton.element );
  this.focusableElems.push( this.nextButton.element );

  this.handlePrevButtonClick = () => {
    this.uiChange();
    this.previous();
  };

  this.handleNextButtonClick = () => {
    this.uiChange();
    this.next();
  };

  this.on( 'activate', this.activatePrevNextButtons );
  this.on( 'select', this.updatePrevNextButtons );
};

let proto = Flickity.prototype;

proto.updatePrevNextButtons = function() {
  let lastIndex = this.slides.length ? this.slides.length - 1 : 0;
  this.updatePrevNextButton( this.prevButton, 0 );
  this.updatePrevNextButton( this.nextButton, lastIndex );
};

proto.updatePrevNextButton = function( button, disabledIndex ) {
  // enable is wrapAround and at least 2 slides
  if ( this.isWrapping && this.slides.length > 1 ) {
    button.enable();
    return;
  }

  let isEnabled = this.selectedIndex !== disabledIndex;
  button[ isEnabled ? 'enable' : 'disable' ]();
  // if disabling button that is focused,
  // shift focus to element to maintain keyboard accessibility
  let isDisabledFocused = !isEnabled && document.activeElement === button.element;
  if ( isDisabledFocused ) this.focus();
};

proto.activatePrevNextButtons = function() {
  this.prevButton.element.addEventListener( 'click', this.handlePrevButtonClick );
  this.nextButton.element.addEventListener( 'click', this.handleNextButtonClick );
  this.element.append( this.prevButton.element, this.nextButton.element );
  this.on( 'deactivate', this.deactivatePrevNextButtons );
};

proto.deactivatePrevNextButtons = function() {
  this.prevButton.element.remove();
  this.nextButton.element.remove();
  this.prevButton.element.removeEventListener( 'click', this.handlePrevButtonClick );
  this.nextButton.element.removeEventListener( 'click', this.handleNextButtonClick );
  this.off( 'deactivate', this.deactivatePrevNextButtons );
};

// --------------------------  -------------------------- //

Flickity.PrevNextButton = PrevNextButton;

return Flickity;

} ) );
