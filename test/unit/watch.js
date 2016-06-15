QUnit.test( 'watch fallback', function( assert ) {
  'use strict';

  var elem = document.querySelector('#watch');
  var flkty = new Flickity( elem, {
    watchCSS: true
  });

  assert.ok( !flkty.isActive, 'fallback not active, watchCSS: true' );
});
