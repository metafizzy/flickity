let flky = window.flky = new Flickity('#full-width');

// flky.on( 'dragMove', function( event, pointer ) {
//   console.log( event.type, pointer.pageX, pointer.pageY );
// });
flky.on( 'select', function() {
  console.log( 'selected', flky.selectedIndex );
} );

flky.on( 'settle', function() {
  console.log( 'settled', flky.x );
} );

let halfWidthflky = new Flickity( '#half-width', {
  cellAlign: 'left',
} );

halfWidthflky.on( 'staticClick', function( event, pointer, cellIndex, cellElement ) {
  console.log( cellIndex, cellElement );
} );

new Flickity( '#gallery3', {
} );

document.querySelector('#gallery3 button').onclick = function() {
  console.log('button click');
};
