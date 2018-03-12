QUnit.test( 'change', function( assert ) {
  'use strict';

  var done = assert.async();

  function onInitChange() {
    assert.ok( false, 'change should not trigger on init' );
  }

  new Flickity( '#change', {
    on: {
      change: onInitChange,
      ready: function() {
        // define events last to first for strict
        var onChangeC = function( index ) {
          assert.equal( index, 0, 'change triggered on select back to 0' );
          done();
        };

        var onChangeB = function() {
          assert.ok( false, 'change should not trigger on same select' );
        };

        var onSelectB = function( index ) {
          assert.equal( index, 1, 'select triggered on same select 1' );
          this.off( 'change', onChangeB );
          this.once( 'change', onChangeC );
          this.select( 0, false, true );
        };

        var onChangeA = function( index ) {
          assert.equal( index, 1, 'change triggered, selected 1');
          this.once( 'change', onChangeB );
          this.once( 'select', onSelectB );
          // select 1 again
          this.select( 1, false, true );
        };

        // kick off
        this.off( 'change', onInitChange );
        this.once( 'change', onChangeA );
        this.select( 1, false, true );
      }
    },
  });

});
