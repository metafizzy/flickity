test( 'free play', function( assert ) {

  'use strict';

  var done = assert.async();

  var flkty = new Flickity( '#free-play', {
    autoPlay: true,
    freePlay: true
  });

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
      ok(flkty.player.isPlaying, 'is playing');
      ok(flkty.isAnimating, 'is animating');
      ok(flkty.isContinuous, 'is continuous');
      equal(flkty.freePlaySpeed, 50, 'defaults to speed 50');
      nextTest();
    },
    // pause & unpause
    function() {
      flkty.player.pause();

      setTimeout( function() {
          console.log('OK');
        equal(flkty.player.isPlaying, true, 'still playing');
        equal(flkty.player.isPaused, true, 'is paused');
        equal(flkty.isAnimating, false, 'not animating');
        equal(flkty.isContinuous, false, 'not continuous');
        var pos = flkty.slider.getAttribute('style');

        setTimeout( function() {
          //should have settled
          equal(flkty.slider.getAttribute('style'), pos, 'no longer moving');
          flkty.player.unpause();

          setTimeout( function() {
            notEqual(flkty.slider.getAttribute('style'), pos, 'it\'s moving');
            ok(flkty.isAnimating, 'is animating');
            ok(flkty.isContinuous, 'is continuous');
            nextTest();
          }, 100);
        }, 100);
      }, 100 ); //100ms to let it settle
      console.log('OK');
    }
  ];

  nextTest();

});
