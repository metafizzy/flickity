test( 'sync', function( assert ) {
  'use strict';

  var flktyA = new Flickity( '#sync-a', {
    sync: '#sync-b'
  });

  var elemB = document.querySelector('#sync-b');
  var flktyB = new Flickity( elemB );

  // HACK do async because syncing is async
  var done = assert.async();

  setTimeout( function() {
    flktyA.next();
    equal( flktyB.selectedIndex, 1, 'A.next() syncs to B' );
    flktyB.previous();
    equal( flktyA.selectedIndex, 0, 'B.previous() syncs to A' );
    flktyA.select( 3 );
    equal( flktyB.selectedIndex, 3, 'A.select() syncs to B' );
    // usync()
    flktyA.unsync('#sync-b');
    flktyA.select( 1 );
    equal( flktyB.selectedIndex, 3, 'A.unsync() unsyncs A from B' );
    flktyB.select( 4 );
    equal( flktyA.selectedIndex, 1, 'A.unsync() unsyncs B from A' );
    // sync()
    flktyB.sync('#sync-a');
    flktyB.select( 0 );
    equal( flktyA.selectedIndex, 0, 'B.sync() syncs B to A' );
    flktyA.select( 2 );
    equal( flktyB.selectedIndex, 2, 'B.sync() syncs A to B' );
    // unsyncAll()
    flktyA.unsyncAll();
    flktyA.select( 1 );
    equal( flktyB.selectedIndex, 2, 'A.unsyncAll() unsyncs A from B' );
    flktyB.select( 4 );
    equal( flktyA.selectedIndex, 1, 'A.unsyncAll() unsyncs B from A' );

    done();
  }, 100 );

});
