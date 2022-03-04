/* globals $ */

let $gallery1 = $('#gallery1').flickity();
let flkty = $gallery1.data('flickity');

// $gallery1.on( 'dragMove', function( event, pointer ) {
//   console.log( event.type, pointer.pageX, pointer.pageY );
// });

$gallery1.on( 'cellSelect.flickity', function( event ) {
  console.log( 'selected', event.type, `ns:${event.namespace}`, flkty.selectedIndex );
} );

$gallery1.on( 'settle.flickity', function( event ) {
  console.log( 'settled', flkty.x, event.type );
} );

$gallery1.on( 'staticClick.flickity', function( event, pointer, cellElem, cellIndex ) {
  console.log( 'staticClick', event.type, cellIndex );
} );

$('#gallery2').flickity({
  wrapAround: true,
});
