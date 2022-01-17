let flkty = new Flickity( '.carousel1', {
  initialIndex: 2,
  // groupCells: true,
  // wrapAround: true,
  // cellAlign: 'right'
} );

let progressBar = document.querySelector('.progress-bar');

flkty.on( 'scroll', function( progress ) {
  console.log( progress );
  let width = Math.max( 0, Math.min( 1, progress ) );
  progressBar.style.width = width * 100 + '%';
} );

flkty.reposition();

// -----  ----- //

let paraBG = document.querySelector('.parallax__layer--bg');
let paraFG = document.querySelector('.parallax__layer--fg');

let paraFlkty = new Flickity( '.parallax__carousel', {

} );

let cellRatio = 0.6;
let bgRatio = 0.8;
let fgRatio = 1.25;

paraFlkty.on( 'scroll', function( progress ) {
  // console.log( progress );
  paraBG.style.left = ( 0.5 - ( 0.5 + progress * 4 ) * cellRatio * bgRatio ) * 100 + '%';
  paraFG.style.left = ( 0.5 - ( 0.5 + progress * 4 ) * cellRatio * fgRatio ) * 100 + '%';
} );

paraFlkty.reposition();

// -----  ----- //

let imgFlkty = new Flickity( '.image-carousel', {
} );

window.onload = function() {
  imgFlkty.reposition();
};

let imgs = document.querySelectorAll('.image-carousel img');

imgFlkty.on( 'scroll', function() {
  imgFlkty.slides.forEach( ( slide, i ) => {
    let img = imgs[i];
    let x = ( slide.target + imgFlkty.x ) * -0.333;
    img.style.transform = `translateX(${x}px)`;
  } );
} );
