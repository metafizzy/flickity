docReady( function() {

  'use strict';

  if ( Flickity.supportsConditionalCSS() ) {

    test( 'watch', function() {

      var elem = document.querySelector('#watch');
      var flkty = new Flickity( elem, {
        watching: true
      });

      ok( !flkty.isActive, 'not active without :after' );
      // add :after via CSS class
      classie.add( elem, 'has-after' );
      flkty.watchActivate();
      ok( flkty.isActive, 'active with :after' );
    });

  } else {

    test( 'watch fallback', function() {

      var elem = document.querySelector('#watch');
      var flkty = new Flickity( elem, {
        watching: true
      });

      ok( !flkty.isActive, 'fallback not active, watching: true' );
      flkty.options.watching = 'fallbackOn';
      flkty.watchActivate();
      ok( flkty.isActive, 'active with watching: "fallbackOn" ');
    });

  }

});
