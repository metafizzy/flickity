test( 'destroy', function( assert ) {

  'use strict';

  var elem = document.querySelector('#destroy');
  var flkty = new Flickity( elem );

  var done = assert.async();
  // do it async
  setTimeout( function() {
    flkty.destroy();
    strictEqual( elem.flickityGUID, undefined, 'flickityGUID removed' );
    ok( !flkty.isActive, 'not active' );
    ok( !Flickity.data( elem ), '.data() returns falsey' );
    ok( elem.children[0], '.cell', 'cell is back as first child' );
    ok( !matchesSelector( elem, '.flickity-enabled'), 'flickity-enabled class removed' );
    ok( !elem.querySelector('.flickity-prev-next-button'), 'no buttons' );
    ok( !elem.querySelector('.flickity-page-dots'), 'no page dots' );
    ok( !elem.style.height, 'no height set' );
    ok( !elem.children[0].style.left, 'first cell has no left position' );

    done();
  }, 20 );

});
