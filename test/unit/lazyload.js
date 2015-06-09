test( 'lazyload', function( assert ) {
  'use strict';

  var gallery = document.querySelector('#lazyload');
  var imgs = gallery.querySelectorAll('img');

  var done = assert.async();
  var flkty;

  var loadCount = 0;
  function onLoad() {
    loadCount++;
    if ( loadCount < 6 ) {
      ok( true, 'img loaded' );
    }
    // after first 2 have loaded, select 7th cell
    if ( loadCount == 2 ) {
      flkty.select( 6 );
    }
    if ( loadCount == 5 ) {
      done();
    }
  }

  for ( var i=0, len = imgs.length; i < len; i++ ) {
    var img = imgs[i];
    img.onload = onLoad;
  }

  flkty = new Flickity( '#lazyload', {
    lazyLoad: true,
    lazyLoadAdjacent: 1
  });

});
