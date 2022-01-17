QUnit.test( 'wrapAround: "fill"', function( assert ) {

  let elem = document.querySelector('#wrap-around-fill');
  let flkty = new Flickity( elem, {
    wrapAround: 'fill',
  } );

  assert.ok( !flkty.isWrapping, 'total cell width not big enough, not wrapping' );

  let shortCell = elem.querySelector('.cell--wrap-around-short');
  shortCell.classList.remove('cell--wrap-around-short');
  flkty.resize();
  assert.ok( flkty.isWrapping, 'cell width big enough, wrapping' );

} );
