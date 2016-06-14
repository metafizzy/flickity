test( 'watch fallback', function() {
  'use strict';

  var elem = document.querySelector('#watch');
  var flkty = new Flickity( elem, {
    watchCSS: true
  });

  ok( !flkty.isActive, 'fallback not active, watchCSS: true' );
});
