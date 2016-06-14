test( 'auto play', function( assert ) {

  'use strict';

  var done = assert.async();

  var flkty = new Flickity( '#auto-play', {
    autoPlay: 200
  });

  var selectCount = 0;

  var tests;
  
  function nextTest() {
    if ( tests.length ) {
      var next = tests.shift();
      next();
    } else {
      flkty.stopPlayer();
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
      flkty.pausePlayer();
      setTimeout( function() {
        ok( true, 'player did not tick during pause' );
        flkty.off( 'cellSelect', onPauseSelect );
        flkty.once( 'cellSelect', function() {
          ok( true, 'player resumed after unpausing' );
          nextTest();
        });
        flkty.unpausePlayer();
      }, flkty.options.autoPlay + 100 );
    },
    // double playPlayer()
    function() {
      var ticks = 0;
      function onSelect() {
        ticks++;
      }
      flkty.stopPlayer();
      flkty.on( 'cellSelect', onSelect );
      flkty.playPlayer();
      flkty.playPlayer();
      setTimeout( function() {
        flkty.off( 'cellSelect', onSelect );
        equal( ticks, 1, 'only one tick after double playPlayer' );
        nextTest();
      }, flkty.options.autoPlay + 100 );
    }
  ];

  nextTest();

});
