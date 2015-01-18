docReady( function() {

  'use strict';

  if ( Flickity.supportsConditionalCSS() ) {

    test( 'watch', function() {

      var elem = document.querySelector('#watch');
      var flkty = new Flickity( elem, {
        watchCSS: true
      });

      ok( !flkty.isActive, 'not active without :after' );
      // add :after via CSS class
      classie.add( elem, 'has-after' );
      flkty.watchCSS();
      ok( flkty.isActive, 'active with :after' );
    });

  } else {

    test( 'watch fallback', function() {

      var elem = document.querySelector('#watch');
      var flkty = new Flickity( elem, {
        watchCSS: true
      });

      ok( !flkty.isActive, 'fallback not active, watchCSS: true' );
      flkty.options.watchCSS = 'fallbackOn';
      flkty.watchCSS();
      ok( flkty.isActive, 'active with watchCSS: "fallbackOn" ');
    });

  }

});
