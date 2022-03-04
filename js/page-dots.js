// page dots
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        require('./core'),
        require('fizzy-ui-utils'),
    );
  } else {
    // browser global
    factory(
        window.Flickity,
        window.fizzyUIUtils,
    );
  }

}( typeof window != 'undefined' ? window : this, function factory( Flickity, utils ) {

// -------------------------- PageDots -------------------------- //

function PageDots() {
  // create holder element
  this.holder = document.createElement('div');
  this.holder.className = 'flickity-page-dots';
  // create dots, array of elements
  this.dots = [];
}

PageDots.prototype.setDots = function( slidesLength ) {
  // get difference between number of slides and number of dots
  let delta = slidesLength - this.dots.length;
  if ( delta > 0 ) {
    this.addDots( delta );
  } else if ( delta < 0 ) {
    this.removeDots( -delta );
  }
};

PageDots.prototype.addDots = function( count ) {
  let newDots = new Array( count ).fill()
    .map( ( item, i ) => {
      let dot = document.createElement('button');
      dot.setAttribute( 'type', 'button' );
      let num = i + 1 + this.dots.length;
      dot.className = 'flickity-page-dot';
      dot.textContent = `View slide ${num}`;
      return dot;
    } );

  this.holder.append( ...newDots );
  this.dots = this.dots.concat( newDots );
};

PageDots.prototype.removeDots = function( count ) {
  // remove from this.dots collection
  let removeDots = this.dots.splice( this.dots.length - count, count );
  // remove from DOM
  removeDots.forEach( ( dot ) => dot.remove() );
};

PageDots.prototype.updateSelected = function( index ) {
  // remove selected class on previous
  if ( this.selectedDot ) {
    this.selectedDot.classList.remove('is-selected');
    this.selectedDot.removeAttribute('aria-current');
  }
  // don't proceed if no dots
  if ( !this.dots.length ) return;

  this.selectedDot = this.dots[ index ];
  this.selectedDot.classList.add('is-selected');
  this.selectedDot.setAttribute( 'aria-current', 'step' );
};

Flickity.PageDots = PageDots;

// -------------------------- Flickity -------------------------- //

Object.assign( Flickity.defaults, {
  pageDots: true,
} );

Flickity.create.pageDots = function() {
  if ( !this.options.pageDots ) return;

  this.pageDots = new PageDots();
  this.handlePageDotsClick = this.onPageDotsClick.bind( this );
  // events
  this.on( 'activate', this.activatePageDots );
  this.on( 'select', this.updateSelectedPageDots );
  this.on( 'cellChange', this.updatePageDots );
  this.on( 'resize', this.updatePageDots );
  this.on( 'deactivate', this.deactivatePageDots );
};

let proto = Flickity.prototype;

proto.activatePageDots = function() {
  this.pageDots.setDots( this.slides.length );
  this.focusableElems.push( ...this.pageDots.dots );
  this.pageDots.holder.addEventListener( 'click', this.handlePageDotsClick );
  this.element.append( this.pageDots.holder );
};

proto.onPageDotsClick = function( event ) {
  let index = this.pageDots.dots.indexOf( event.target );
  if ( index === -1 ) return; // only dot clicks

  this.uiChange();
  this.select( index );
};

proto.updateSelectedPageDots = function() {
  this.pageDots.updateSelected( this.selectedIndex );
};

proto.updatePageDots = function() {
  this.pageDots.dots.forEach( ( dot ) => {
    utils.removeFrom( this.focusableElems, dot );
  } );
  this.pageDots.setDots( this.slides.length );
  this.focusableElems.push( ...this.pageDots.dots );
};

proto.deactivatePageDots = function() {
  this.pageDots.holder.remove();
  this.pageDots.holder.removeEventListener( 'click', this.handlePageDotsClick );
};

// -----  ----- //

Flickity.PageDots = PageDots;

return Flickity;

} ) );
