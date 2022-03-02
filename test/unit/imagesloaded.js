/* globals imagesLoaded */

( function() {

  // position values can be off by 0.1% or 1px
  function isPositionApprox( value, expected ) {
    let isPercent = value.indexOf('%') !== -1;
    value = parseFloat( value );
    let diff = Math.abs( expected - value );
    return isPercent ? diff < 0.1 : diff <= 1;
  }

  QUnit.test( 'imagesloaded', function( assert ) {
    let done = assert.async();
    let gallery = document.querySelector('#imagesloaded');

    let flkty = new Flickity( gallery, {
      imagesLoaded: true,
      percentPosition: false,
    } );

    imagesLoaded( gallery, function() {
      flkty.cells.forEach( ( cell, i ) => {
        assert.ok( cell.size.width > 10, `cell ${i} has width` );
        let transform = cell.element.style.transform;
        let position = transform.replace( 'translateX(', '' ).replace( ')', '' );
        let isApprox = isPositionApprox( position, cell.x );
        assert.ok( isApprox, `cell ${i} at proper position` );
      } );

      assert.equal( flkty.viewport.style.height, '140px', 'gallery height set' );

      done();
    } );

  } );

  QUnit.test( 'imagesloaded-in-divs', function( assert ) {

    let done = assert.async();
    let gallery = document.querySelector('#imagesloaded-in-divs');

    let flkty = new Flickity( gallery, {
      imagesLoaded: true,
      percentPosition: false,
    } );

    imagesLoaded( gallery, function() {
      flkty.cells.forEach( ( cell, i ) => {
        assert.ok( cell.size.width > 10, `cell ${i} has width` );
        let transform = cell.element.style.transform;
        let position = transform.replace( 'translateX(', '' ).replace( ')', '' );
        let isApprox = isPositionApprox( position, cell.x );
        assert.ok( isApprox, `cell ${i} at proper position` );
      } );

      assert.equal( flkty.viewport.style.height, '140px', 'gallery height set' );

      done();
    } );

  } );

} )();

