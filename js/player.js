( function( window ) {

'use strict';

function Player( parent ) {
  this.isPlaying = false;
  this.parent = parent;
}

Player.prototype.play = function() {
  this.isPlaying = true;
  // playing kills pauses
  delete this.isPaused;
  var _this = this;
  var time = this.parent.options.autoPlay;
  // default to 3 seconds
  time = typeof time === 'number' ? time : 3000;
  this.timeout = setTimeout( function() {
    _this.parent.next( true );
    _this.play();
  }, time );
};

Player.prototype.stop = function() {
  this.isPlaying = false;
  // stopping kills pauses
  delete this.isPaused;
  clearTimeout( this.timeout );
};

Player.prototype.pause = function() {
  if ( this.isPlaying ) {
    this.stop();
    // set pause flag after pause so it persists
    this.isPaused = true;
  }
};

Player.prototype.unpause = function() {
  // re-start play if in unpaused state
  if ( this.isPaused ) {
    this.play();
  }
};

window.Player = Player;

})( window );
