QUnit.test( 'watch fallback', function( assert ) {

  let elem = document.querySelector('#watch');
  let flkty = new Flickity( elem, {
    watchCSS: true,
  } );

  assert.ok( !flkty.isActive, 'fallback not active, watchCSS: true' );
} );
