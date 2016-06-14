test('empty', function() {
  'use strict';

  var gallery = document.querySelector('#empty');

  var flkty = new Flickity( gallery );

  ok( true, 'empty gallery ok' );
  ok( flkty.prevButton.element.disabled, 'previous button disabled' );
  ok( flkty.nextButton.element.disabled, 'next button disabled' );
  equal( flkty.pageDots.dots.length, 0, '0 page dots');

  flkty.resize();
  ok( true, 'resize with empty gallery ok');

  function makeCellElem() {
    var cellElem = document.createElement('div');
    cellElem.className = 'cell';
    return cellElem;
  }

  flkty.append( makeCellElem() );
  equal( flkty.cells.length, 1, 'added cell to empty gallery' );


  ok( flkty.prevButton.element.disabled, 'previous button disabled' );
  ok( flkty.nextButton.element.disabled, 'next button disabled' );
  equal( flkty.pageDots.dots.length, 1, '1 page dots');

  // destroy and re-init with higher initialIndex
  flkty.destroy();
  flkty = new Flickity( gallery, {
    initialIndex: 2
  });

  // #291
  ok( true, 'initializing with initialIndex > cells doesnt throw error' );

});
