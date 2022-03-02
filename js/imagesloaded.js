// imagesloaded
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        require('./core'),
        require('imagesloaded'),
    );
  } else {
    // browser global
    factory(
        window.Flickity,
        window.imagesLoaded,
    );
  }

}( typeof window != 'undefined' ? window : this,
    function factory( Flickity, imagesLoaded ) {

Flickity.create.imagesLoaded = function() {
  this.on( 'activate', this.imagesLoaded );
};

Flickity.prototype.imagesLoaded = function() {
  if ( !this.options.imagesLoaded ) return;

  let onImagesLoadedProgress = ( instance, image ) => {
    let cell = this.getParentCell( image.img );
    this.cellSizeChange( cell && cell.element );
    if ( !this.options.freeScroll ) this.positionSliderAtSelected();
  };
  imagesLoaded( this.slider ).on( 'progress', onImagesLoadedProgress );
};

return Flickity;

} ) );
