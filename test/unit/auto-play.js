test( 'auto play', function( assert ) {

  'use strict';

  var done = assert.async();

  var flkty = new Flickity( '#auto-play', {
    autoPlay: 500
  });

  var selectCount = 0;

  var tests;
  
  function nextTest() {
    if ( tests.length ) {
      var next = tests.shift();
      next();
    } else {
      flkty.player.stop();
      done();
    }
  }
  
  tests = [
    // check that player runs
    function() {
      var onSelect = function() {
        selectCount++;
        if ( selectCount < 5 ) {
          equal( flkty.selectedIndex, selectCount % flkty.cells.length,
            'auto-played to ' + flkty.selectedIndex );
        } else if ( selectCount == 5 ) {
          // HACK do async, should be able to stop after a tick
          flkty.off( 'cellSelect', onSelect );
          nextTest();
        }
      };
      flkty.on( 'cellSelect', onSelect );
    },
    // pause & unpause
    function() {
      function onPauseSelect() {
        ok( false, 'player ticked during pause' );
      }
      flkty.on( 'cellSelect', onPauseSelect );
      flkty.player.pause();
      setTimeout( function() {
        ok( true, 'player did not tick during pause' );
        flkty.off( 'cellSelect', onPauseSelect );
        flkty.once( 'cellSelect', function() {
          ok( true, 'player resumed after unpausing' );
          nextTest();
        });
        flkty.player.unpause();
      }, flkty.options.autoPlay + 100 );
    }
  ];

  nextTest();

});
