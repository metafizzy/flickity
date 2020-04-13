QUnit.test( 'empty', function( assert ) {
  'use strict';

  var gallery = document.querySelector('#empty');

  var flkty = new Flickity( gallery );

  assert.ok( true, 'empty gallery ok' );
  assert.ok( flkty.prevButton.element.disabled, 'previous button disabled' );
  assert.ok( flkty.nextButton.element.disabled, 'next button disabled' );
  assert.equal( flkty.pageDots.dots.length, 0, '0 page dots' );

  flkty.resize();
  assert.ok( true, 'resize with empty gallery ok' );

  function makeCellElem() {
    var cellElem = document.createElement('div');
    cellElem.className = 'cell';
    return cellElem;
  }

  flkty.append( makeCellElem() );
  assert.equal( flkty.cells.length, 1, 'added cell to empty gallery' );

  assert.ok( flkty.prevButton.element.disabled, 'previous button disabled' );
  assert.ok( flkty.nextButton.element.disabled, 'next button disabled' );
  assert.equal( flkty.pageDots.dots.length, 1, '1 page dots' );

  // destroy and re-init with higher initialIndex
  flkty.destroy();
  flkty = new Flickity( gallery, {
    initialIndex: 2,
  } );

  // #291
  assert.ok( true, 'initializing with initialIndex > cells doesnt throw error' );

} );
