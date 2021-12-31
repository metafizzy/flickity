QUnit.test( 'destroy', function( assert ) {

  let elem = document.querySelector('#destroy');
  let flkty = new Flickity( elem );

  let done = assert.async();
  // do it async
  setTimeout( function() {
    flkty.destroy();
    assert.strictEqual( elem.flickityGUID, undefined, 'flickityGUID removed' );
    assert.ok( !flkty.isActive, 'not active' );
    assert.ok( !Flickity.data( elem ), '.data() returns falsey' );
    assert.ok( elem.children[0], '.cell', 'cell is back as first child' );
    assert.ok( !elem.matches('.flickity-enabled'), 'flickity-enabled class removed' );
    assert.ok( !elem.querySelector('.flickity-prev-next-button'), 'no buttons' );
    assert.ok( !elem.querySelector('.flickity-page-dots'), 'no page dots' );
    assert.ok( !elem.style.height, 'no height set' );
    assert.ok( !elem.children[0].style.left, 'first cell has no left position' );

    done();
  }, 20 );

} );
