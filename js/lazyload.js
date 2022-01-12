// lazyload
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

Flickity.create.lazyLoad = function() {
  this.on( 'select', this.lazyLoad );
};

let proto = Flickity.prototype;

proto.lazyLoad = function() {
  let lazyLoad = this.options.lazyLoad;
  if ( !lazyLoad ) return;

  // get adjacent cells, use lazyLoad option for adjacent count
  let adjCount = typeof lazyLoad == 'number' ? lazyLoad : 0;
  let cellElems = this.getAdjacentCellElements( adjCount );
  // get lazy images in those cells
  let lazyImages = [];
  cellElems.forEach( ( cellElem ) => {
    let lazyCellImages = getCellLazyImages( cellElem );
    lazyImages = lazyImages.concat( lazyCellImages );
  } );
  // load lazy images
  lazyImages.forEach( ( img ) => new LazyLoader( img, this ) );
};

function getCellLazyImages( cellElem ) {
  // check if cell element is lazy image
  if ( cellElem.nodeName == 'IMG' ) {
    let lazyloadAttr = cellElem.getAttribute('data-flickity-lazyload');
    let srcAttr = cellElem.getAttribute('data-flickity-lazyload-src');
    let srcsetAttr = cellElem.getAttribute('data-flickity-lazyload-srcset');
    if ( lazyloadAttr || srcAttr || srcsetAttr ) {
      return [ cellElem ];
    }
  }
  // select lazy images in cell
  let lazySelector = 'img[data-flickity-lazyload], ' +
    'img[data-flickity-lazyload-src], img[data-flickity-lazyload-srcset]';
  let imgs = cellElem.querySelectorAll( lazySelector );
  return utils.makeArray( imgs );
}

// -------------------------- LazyLoader -------------------------- //

/**
 * class to handle loading images
 * @param {Image} img - Image element
 * @param {Flickity} flickity - Flickity instance
 */
function LazyLoader( img, flickity ) {
  this.img = img;
  this.flickity = flickity;
  this.load();
}

LazyLoader.prototype.handleEvent = utils.handleEvent;

LazyLoader.prototype.load = function() {
  this.img.addEventListener( 'load', this );
  this.img.addEventListener( 'error', this );
  // get src & srcset
  let src = this.img.getAttribute('data-flickity-lazyload') ||
    this.img.getAttribute('data-flickity-lazyload-src');
  let srcset = this.img.getAttribute('data-flickity-lazyload-srcset');
  // set src & serset
  this.img.src = src;
  if ( srcset ) {
    this.img.setAttribute( 'srcset', srcset );
  }
  // remove attr
  this.img.removeAttribute('data-flickity-lazyload');
  this.img.removeAttribute('data-flickity-lazyload-src');
  this.img.removeAttribute('data-flickity-lazyload-srcset');
};

LazyLoader.prototype.onload = function( event ) {
  this.complete( event, 'flickity-lazyloaded' );
};

LazyLoader.prototype.onerror = function( event ) {
  this.complete( event, 'flickity-lazyerror' );
};

LazyLoader.prototype.complete = function( event, className ) {
  // unbind events
  this.img.removeEventListener( 'load', this );
  this.img.removeEventListener( 'error', this );

  let cell = this.flickity.getParentCell( this.img );
  let cellElem = cell && cell.element;
  this.flickity.cellSizeChange( cellElem );

  this.img.classList.add( className );
  this.flickity.dispatchEvent( 'lazyLoad', event, cellElem );
};

// -----  ----- //

Flickity.LazyLoader = LazyLoader;

return Flickity;

} ) );
