( function( window ) {

'use strict';

function Player( parent ) {
  this.isPlaying = false;
  this.parent = parent;
}

Player.prototype.play = function() {
  this.isPlaying = true;
  var _this = this;
  var time = this.parent.options.autoPlay;
  // default to 3 seconds if autoPlay: true
  time = time && time === true ? 3000 : time;
  this.timeout = setTimeout( function() {
    _this.parent.next( true );
    _this.play();
  }, time );
};

Player.prototype.stop = function() {
  this.isPlaying = false;
  if ( this.timeout ) {
    clearTimeout( this.timeout );
    delete this.timeout;
  }
};

window.Player = Player;

})( window );
