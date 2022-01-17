let flkty = new Flickity( '.carousel', {
  groupCells: true,
  adaptiveHeight: true,
  wrapAround: true,
} );

let paraBg = document.querySelector('.parallax-layer--bg');
let paraFg = document.querySelector('.parallax-layer--fg');
let count = flkty.slides.length - 1;

flkty.on( 'scroll', function( progress ) {
  paraBg.style.left = ( 0.5 - ( 0.5 + progress * count ) * 0.7 ) * ( 37/36 ) * 100 + '%';
  paraFg.style.left = ( 0.5 - ( 0.5 + progress * count ) * 1.5 ) * ( 37/36 ) * 100 + '%';
} );

flkty.reposition();
