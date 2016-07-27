QUnit.test( 'auto play', function( assert ) {
  'use strict';

  var done = assert.async();

  var flkty = new Flickity( '#auto-play', {
    autoPlay: 200
  });

  var selectCount = 0;
  var testDelay = flkty.options.autoPlay + 100;

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
          assert.equal( flkty.selectedIndex, selectCount % flkty.cells.length,
            'auto-played to ' + flkty.selectedIndex );
        } else if ( selectCount == 5 ) {
          // HACK do async, should be able to stop after a tick
          flkty.off( 'select', onSelect );
          nextTest();
        }
      };
      flkty.on( 'select', onSelect );
    },
    // pause & unpause
    function() {
      function onPauseSelect() {
        assert.ok( false, 'player ticked during pause' );
      }
      flkty.on( 'select', onPauseSelect );
      flkty.pausePlayer();
      setTimeout( function() {
        assert.ok( true, 'player did not tick during pause' );
        flkty.off( 'select', onPauseSelect );
        flkty.once( 'select', function() {
          assert.ok( true, 'player resumed after unpausing' );
          nextTest();
        });
        flkty.unpausePlayer();
      }, testDelay );
    },
    // stopPlayer
    function() {
      var ticks = 0;
      function onSelect() {
        ticks++;
      }
      flkty.stopPlayer();
      setTimeout( function() {
        flkty.off( 'select', onSelect );
        assert.equal( ticks, 0, 'no ticks after stopped' );
        nextTest();
      }, testDelay * 2 );
    },
    // double playPlayer()
    function() {
      var ticks = 0;
      function onSelect() {
        ticks++;
      }
      flkty.stopPlayer();
      flkty.on( 'select', onSelect );
      flkty.playPlayer();
      flkty.playPlayer();
      setTimeout( function() {
        flkty.off( 'select', onSelect );
        assert.equal( ticks, 1, 'only one tick after double playPlayer' );
        nextTest();
      }, testDelay );
    },
  ];

  nextTest();

});
